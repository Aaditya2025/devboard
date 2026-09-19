import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { IssueStatus } from '../../../../core/enums';

interface StatusBarDatum {
  status: IssueStatus;
  label: string;
  count: number;
  percent: number;
  cssVar: string;
}

const STATUS_META: { status: IssueStatus; label: string; cssVar: string }[] = [
  { status: IssueStatus.Backlog, label: 'Backlog', cssVar: '--db-status-backlog' },
  { status: IssueStatus.Todo, label: 'Todo', cssVar: '--db-status-todo' },
  { status: IssueStatus.InProgress, label: 'In Progress', cssVar: '--db-status-in-progress' },
  { status: IssueStatus.InReview, label: 'In Review', cssVar: '--db-status-in-review' },
  { status: IssueStatus.Done, label: 'Done', cssVar: '--db-status-done' },
];

/**
 * Horizontal bar chart of issue counts by status. Plain CSS/flex bars rather
 * than a chart library — no new dependency for a shape this simple, and the
 * data comes in fully computed via `counts` (spec: chart data comes from
 * services, not embedded in the chart component itself).
 */
@Component({
  selector: 'app-issue-status-chart',
  standalone: true,
  templateUrl: './issue-status-chart.component.html',
  styleUrl: './issue-status-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueStatusChartComponent {
  private readonly countsSignal = signal<Record<IssueStatus, number>>(
    Object.fromEntries(STATUS_META.map((s) => [s.status, 0])) as Record<IssueStatus, number>,
  );

  @Input({ required: true })
  set counts(value: Record<IssueStatus, number>) {
    this.countsSignal.set(value);
  }

  readonly bars = computed<StatusBarDatum[]>(() => {
    const counts = this.countsSignal();
    const max = Math.max(1, ...STATUS_META.map((s) => counts[s.status] ?? 0));
    return STATUS_META.map((meta) => ({
      status: meta.status,
      label: meta.label,
      count: counts[meta.status] ?? 0,
      percent: ((counts[meta.status] ?? 0) / max) * 100,
      cssVar: meta.cssVar,
    }));
  });

  readonly total = computed(() =>
    Object.values(this.countsSignal()).reduce((sum, n) => sum + n, 0),
  );
}
