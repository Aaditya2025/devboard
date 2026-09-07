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
import { Subscription, merge } from 'rxjs';

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
      // The control can carry errors that were set imperatively (e.g. a
      // cross-field validator calling confirm.setErrors(...) on a *sibling*
      // control). OnPush won't re-check this component on its own in that
      // case — no local event fired and the @Input reference didn't change —
      // so we subscribe to the control's own change streams and force a
      // check whenever either fires.
      this.subscription?.unsubscribe();
      this.subscription = null;

      if (this.control) {
        this.subscription = merge(this.control.statusChanges, this.control.valueChanges).subscribe(
          () => this.cdr.markForCheck(),
        );
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
