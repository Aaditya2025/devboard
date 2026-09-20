import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  private readonly pageSignal = signal(1);
  private readonly totalPagesSignal = signal(1);
  private readonly totalItemsSignal = signal(0);
  private readonly pageSizeSignal = signal(10);

  @Input({ required: true })
  set page(value: number) {
    this.pageSignal.set(value);
  }
  @Input({ required: true })
  set totalPages(value: number) {
    this.totalPagesSignal.set(value);
  }
  @Input({ required: true })
  set totalItems(value: number) {
    this.totalItemsSignal.set(value);
  }
  @Input({ required: true })
  set pageSize(value: number) {
    this.pageSizeSignal.set(value);
  }

  @Output() pageChange = new EventEmitter<number>();

  readonly page$ = this.pageSignal.asReadonly();
  readonly totalPages$ = this.totalPagesSignal.asReadonly();

  readonly rangeLabel = computed(() => {
    const total = this.totalItemsSignal();
    if (total === 0) {
      return 'No results';
    }
    const start = (this.pageSignal() - 1) * this.pageSizeSignal() + 1;
    const end = Math.min(this.pageSignal() * this.pageSizeSignal(), total);
    return `${start}-${end} of ${total}`;
  });

  readonly canGoPrevious = computed(() => this.pageSignal() > 1);
  readonly canGoNext = computed(() => this.pageSignal() < this.totalPagesSignal());

  previous(): void {
    if (this.canGoPrevious()) {
      this.pageChange.emit(this.pageSignal() - 1);
    }
  }

  next(): void {
    if (this.canGoNext()) {
      this.pageChange.emit(this.pageSignal() + 1);
    }
  }
}
