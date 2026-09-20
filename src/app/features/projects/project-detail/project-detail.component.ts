import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ProjectService } from '../../../core/services/project.service';
import { IssueService } from '../../../core/services/issue.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { Activity, Issue, Project } from '../../../core/models';
import { ProjectStatusBadgeComponent } from '../../../shared/components/project-status-badge/project-status-badge.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { ActivityTimelineComponent } from '../../../shared/components/activity-timeline/activity-timeline.component';
import { ProjectMembersComponent } from '../project-members/project-members.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    ProjectStatusBadgeComponent,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    EmptyStateComponent,
    ActivityTimelineComponent,
    ProjectMembersComponent,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {
  private readonly projectService = inject(ProjectService);
  private readonly issueService = inject(IssueService);
  private readonly dashboardService = inject(DashboardService);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly projectId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly project = signal<Project | null>(null);

  readonly issues = signal<Issue[]>([]);
  readonly issuesLoading = signal(true);

  private readonly allActivity = signal<Activity[]>([]);
  /** Only the activity entries whose entityId matches an issue in this project. */
  readonly projectActivity = computed(() => {
    const issueIds = new Set(this.issues().map((issue) => issue.id));
    return this.allActivity().filter((activity) => issueIds.has(activity.entityId));
  });

  constructor() {
    this.load();
  }

  retry(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectService.getById(this.projectId).subscribe({
      next: (project) => {
        if (!project) {
          this.error.set("We couldn't find this project.");
          this.loading.set(false);
          return;
        }
        this.project.set(project);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("We couldn't load this project.");
        this.loading.set(false);
      },
    });

    this.issuesLoading.set(true);
    this.issueService.getByProjectId(this.projectId).subscribe((issues) => {
      this.issues.set(issues);
      this.issuesLoading.set(false);
    });

    this.dashboardService.getRecentActivity(20).subscribe((activity) => {
      this.allActivity.set(activity);
    });
  }
}
