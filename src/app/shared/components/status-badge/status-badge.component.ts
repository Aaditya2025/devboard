import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { IssueStatus } from '../../../core/enums';

const STATUS_LABELS: Record<IssueStatus, string> = {
  [IssueStatus.Backlog]: 'Backlog',
  [IssueStatus.Todo]: 'Todo',
  [IssueStatus.InProgress]: 'In Progress',
  [IssueStatus.InReview]: 'In Review',
  [IssueStatus.Done]: 'Done',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  private readonly statusSignal = signal<IssueStatus>(IssueStatus.Backlog);

  @Input({ required: true })
  set status(value: IssueStatus) {
    this.statusSignal.set(value);
  }
  get status(): IssueStatus {
    return this.statusSignal();
  }

  readonly label = computed(() => STATUS_LABELS[this.statusSignal()]);
  readonly cssClass = computed(
    () => `status-badge--${this.statusSignal().toLowerCase().replace(/_/g, '-')}`,
  );
}
