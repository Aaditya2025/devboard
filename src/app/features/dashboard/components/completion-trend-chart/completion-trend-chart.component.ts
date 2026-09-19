import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';

export interface CompletionTrendPoint {
  date: string;
  completed: number;
}

const CHART_WIDTH = 280;
const CHART_HEIGHT = 80;
const PADDING = 8;

@Component({
  selector: 'app-completion-trend-chart',
  standalone: true,
  templateUrl: './completion-trend-chart.component.html',
  styleUrl: './completion-trend-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompletionTrendChartComponent {
  private readonly pointsSignal = signal<CompletionTrendPoint[]>([]);

  @Input({ required: true })
  set points(value: CompletionTrendPoint[]) {
    this.pointsSignal.set(value);
  }

  readonly width = CHART_WIDTH;
  readonly height = CHART_HEIGHT;

  readonly total = computed(() => this.pointsSignal().reduce((sum, p) => sum + p.completed, 0));

  readonly dayLabels = computed(() =>
    this.pointsSignal().map((p) =>
      new Date(p.date).toLocaleDateString(undefined, { weekday: 'narrow' }),
    ),
  );

  readonly polylinePoints = computed(() => {
    const points = this.pointsSignal();
    if (points.length === 0) {
      return '';
    }
    const max = Math.max(1, ...points.map((p) => p.completed));
    const innerWidth = CHART_WIDTH - PADDING * 2;
    const innerHeight = CHART_HEIGHT - PADDING * 2;
    const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;

    return points
      .map((point, index) => {
        const x = PADDING + step * index;
        const y = PADDING + innerHeight - (point.completed / max) * innerHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  readonly dots = computed(() => {
    const points = this.pointsSignal();
    if (points.length === 0) {
      return [];
    }
    const max = Math.max(1, ...points.map((p) => p.completed));
    const innerWidth = CHART_WIDTH - PADDING * 2;
    const innerHeight = CHART_HEIGHT - PADDING * 2;
    const step = points.length > 1 ? innerWidth / (points.length - 1) : 0;

    return points.map((point, index) => ({
      x: PADDING + step * index,
      y: PADDING + innerHeight - (point.completed / max) * innerHeight,
      completed: point.completed,
    }));
  });
}
