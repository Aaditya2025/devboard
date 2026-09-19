import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { IssuePriority } from '../../../../core/enums';

interface PriorityBarDatum {
  priority: IssuePriority;
  label: string;
  count: number;
  percent: number;
  cssVar: string;
}

const PRIORITY_META: { priority: IssuePriority; label: string; cssVar: string }[] = [
  { priority: IssuePriority.Low, label: 'Low', cssVar: '--db-priority-low' },
  { priority: IssuePriority.Medium, label: 'Medium', cssVar: '--db-priority-medium' },
  { priority: IssuePriority.High, label: 'High', cssVar: '--db-priority-high' },
  { priority: IssuePriority.Critical, label: 'Critical', cssVar: '--db-priority-critical' },
];

@Component({
  selector: 'app-priority-distribution-chart',
  standalone: true,
  templateUrl: './priority-distribution-chart.component.html',
  styleUrl: './priority-distribution-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityDistributionChartComponent {
  private readonly countsSignal = signal<Record<IssuePriority, number>>(
    Object.fromEntries(PRIORITY_META.map((p) => [p.priority, 0])) as Record<IssuePriority, number>,
  );

  @Input({ required: true })
  set counts(value: Record<IssuePriority, number>) {
    this.countsSignal.set(value);
  }

  readonly bars = computed<PriorityBarDatum[]>(() => {
    const counts = this.countsSignal();
    const max = Math.max(1, ...PRIORITY_META.map((p) => counts[p.priority] ?? 0));
    return PRIORITY_META.map((meta) => ({
      priority: meta.priority,
      label: meta.label,
      count: counts[meta.priority] ?? 0,
      percent: ((counts[meta.priority] ?? 0) / max) * 100,
      cssVar: meta.cssVar,
    }));
  });

  readonly total = computed(() =>
    Object.values(this.countsSignal()).reduce((sum, n) => sum + n, 0),
  );
}
