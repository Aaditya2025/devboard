import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * Debounced search box — emits `search` at most once per `debounceMs` and
 * only when the (trimmed) value actually changed, so consumers never fire a
 * request per keystroke. Has its own clear button and can show a spinner
 * via `loading` while the consumer's request is in flight.
 */
@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search...';
  @Input() debounceMs = 300;
  @Input() loading = false;
  @Input()
  set value(val: string) {
    this.control.setValue(val ?? '', { emitEvent: false });
  }

  @Output() searchChange = new EventEmitter<string>();

  readonly control = new FormControl('', { nonNullable: true });
  private subscription: Subscription | null = null;

  ngOnInit(): void {
    this.subscription = this.control.valueChanges
      .pipe(debounceTime(this.debounceMs), distinctUntilChanged())
      .subscribe((value) => this.searchChange.emit(value.trim()));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  clear(): void {
    this.control.setValue('');
  }
}
