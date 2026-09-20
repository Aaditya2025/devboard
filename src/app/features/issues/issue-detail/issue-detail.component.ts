import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IssuePriority, IssueStatus } from '../../../core/enums';
import { IssueService } from '../../../core/services/issue.service';
import { UserService } from '../../../core/services/user.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { Activity, Issue, User } from '../../../core/models';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { ActivityTimelineComponent } from '../../../shared/components/activity-timeline/activity-timeline.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CommentsComponent } from '../comments/comments.component';

const STATUS_OPTIONS = Object.values(IssueStatus);
const PRIORITY_OPTIONS = Object.values(IssuePriority);

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    ActivityTimelineComponent,
    CommentsComponent,
  ],
  templateUrl: './issue-detail.component.html',
  styleUrl: './issue-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueDetailComponent {
  private readonly issueService = inject(IssueService);
  private readonly userService = inject(UserService);
  private readonly dashboardService = inject(DashboardService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  private readonly issueId = this.activatedRoute.snapshot.paramMap.get('id') ?? '';

  readonly statusOptions = STATUS_OPTIONS;
  readonly priorityOptions = PRIORITY_OPTIONS;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly issue = signal<Issue | null>(null);
  readonly users = signal<User[]>([]);

  private readonly allActivity = signal<Activity[]>([]);
  readonly issueActivity = computed(() =>
    this.allActivity().filter((activity) => activity.entityId === this.issueId),
  );

  readonly assigneeName = computed(() => this.userName(this.issue()?.assigneeId ?? null));
  readonly reporterName = computed(() => this.userName(this.issue()?.reporterId ?? null));

  constructor() {
    this.userService.getAll().subscribe((users) => this.users.set(users));
    this.load();
  }

  retry(): void {
    this.load();
  }

  changeStatus(status: IssueStatus): void {
    this.updateIssue({ status });
  }

  changePriority(priority: IssuePriority): void {
    this.updateIssue({ priority });
  }

  assignTo(userId: string | null): void {
    this.updateIssue({ assigneeId: userId });
  }

  deleteIssue(): void {
    const issue = this.issue();
    if (!issue) {
      return;
    }
    const data: ConfirmDialogData = {
      title: 'Delete issue?',
      message: `"${issue.key} — ${issue.title}" will be permanently deleted. This can't be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    };
    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.issueService.delete(issue.id).subscribe(() => {
          this.snackBar.open(`${issue.key} deleted.`, undefined, { duration: 3000 });
          this.router.navigateByUrl('/issues');
        });
      });
  }

  private updateIssue(patch: Partial<Issue>): void {
    const issue = this.issue();
    if (!issue) {
      return;
    }
    this.issueService.update(issue.id, patch).subscribe({
      next: (updated) => {
        this.issue.set(updated);
        this.snackBar.open('Issue updated.', undefined, { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Unable to update issue.', undefined, { duration: 3000 });
      },
    });
  }

  private userName(userId: string | null): string {
    if (!userId) {
      return 'Unassigned';
    }
    const user = this.users().find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.issueService.getById(this.issueId).subscribe({
      next: (issue) => {
        if (!issue) {
          this.error.set("We couldn't find this issue.");
          this.loading.set(false);
          return;
        }
        this.issue.set(issue);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("We couldn't load this issue.");
        this.loading.set(false);
      },
    });

    this.dashboardService.getRecentActivity(50).subscribe((activity) => {
      this.allActivity.set(activity);
    });
  }
}
