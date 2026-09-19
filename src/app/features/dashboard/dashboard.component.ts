import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { Activity, DashboardStatistics, Issue } from '../../core/models';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { ActivityTimelineComponent } from '../../shared/components/activity-timeline/activity-timeline.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { IssueStatusChartComponent } from './components/issue-status-chart/issue-status-chart.component';
import { PriorityDistributionChartComponent } from './components/priority-distribution-chart/priority-distribution-chart.component';
import { CompletionTrendChartComponent } from './components/completion-trend-chart/completion-trend-chart.component';
import { ProjectProgressListComponent } from './components/project-progress-list/project-progress-list.component';
import { AssignedIssuesTableComponent } from './components/assigned-issues-table/assigned-issues-table.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    StatCardComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    ActivityTimelineComponent,
    EmptyStateComponent,
    IssueStatusChartComponent,
    PriorityDistributionChartComponent,
    CompletionTrendChartComponent,
    ProjectProgressListComponent,
    AssignedIssuesTableComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly statistics = signal<DashboardStatistics | null>(null);
  readonly assignedIssues = signal<Issue[]>([]);
  readonly recentActivity = signal<Activity[]>([]);

  constructor() {
    this.load();
  }

  retry(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    const userId = this.authService.currentUser()?.id;

    this.dashboardService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics.set(stats);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("We couldn't load your dashboard statistics.");
        this.loading.set(false);
      },
    });

    if (userId) {
      this.dashboardService.getAssignedIssues(userId).subscribe((issues) => {
        this.assignedIssues.set(issues);
      });
    }

    this.dashboardService.getRecentActivity().subscribe((activity) => {
      this.recentActivity.set(activity);
    });
  }
}
