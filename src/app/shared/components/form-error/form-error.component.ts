import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Maps a validator error key to its display message. Centralized here so
 * every form (login, register, project form, issue form, ...) shows
 * identical wording instead of re-implementing it per template.
 */
const ERROR_MESSAGES: Record<string, (error: unknown, label: string) => string> = {
  required: (_error, label) => `${label} is required.`,
  email: () => 'Enter a valid email address.',
  minlength: (error, label) => {
    const { requiredLength } = error as { requiredLength: number };
    return `${label} must be at least ${requiredLength} characters.`;
  },
  maxlength: (error, label) => {
    const { requiredLength } = error as { requiredLength: number };
    return `${label} must be at most ${requiredLength} characters.`;
  },
  pattern: (_error, label) => `${label} format is invalid.`,
  passwordMismatch: () => 'Passwords do not match.',
  passwordStrength: (error) => {
    const details = error as {
      minLength?: true;
      requiresUppercase?: true;
      requiresLowercase?: true;
      requiresNumber?: true;
    };
    const missing: string[] = [];
    if (details.minLength) missing.push('at least 8 characters');
    if (details.requiresUppercase) missing.push('an uppercase letter');
    if (details.requiresLowercase) missing.push('a lowercase letter');
    if (details.requiresNumber) missing.push('a number');
    return `Password needs ${missing.join(', ')}.`;
  },
  projectKeyFormat: () => 'Use 2-6 uppercase letters, e.g. DEV.',
  dateRange: () => 'End date cannot be before start date.',
};

@Component({
  selector: 'app-form-error',
  standalone: true,
  templateUrl: './form-error.component.html',
  styleUrl: './form-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormErrorComponent implements OnChanges, OnDestroy {
  /** The control to read validation errors from. */
  @Input({ required: true }) control: AbstractControl | null = null;

  /** Human-readable field name used in generated messages, e.g. "Email". */
  @Input({ required: true }) label = '';

  private subscription: Subscription | null = null;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('control' in changes) {
      // The control's displayed error can change for reasons this component
      // never sees directly: a cross-field validator on a *sibling* control
      // calling setErrors() imperatively, or — the case that mattered most
      // in practice — form.markAllAsTouched() on submit, which flips
      // `touched` without emitting through statusChanges or valueChanges at
      // all. `control.events` is the one stream that covers every one of
      // these (TouchedChangeEvent, StatusChangeEvent, ValueChangeEvent), so
      // subscribe to it and force a check on every emission.
      this.subscription?.unsubscribe();
      this.subscription = null;

      if (this.control) {
        this.subscription = this.control.events.subscribe(() => this.cdr.markForCheck());
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get message(): string | null {
    const control = this.control;
    if (!control || !control.errors || !(control.dirty || control.touched)) {
      return null;
    }

    const [key, error] = Object.entries(control.errors)[0];
    const format = ERROR_MESSAGES[key];
    return format ? format(error, this.label) : `${this.label} is invalid.`;
  }
}
