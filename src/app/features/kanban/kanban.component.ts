import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IssuePriority, IssueStatus } from '../../core/enums';
import { IssueService } from '../../core/services/issue.service';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { Issue, IssueFilters, Project, User } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { PriorityBadgeComponent } from '../../shared/components/priority-badge/priority-badge.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';

interface KanbanColumn {
  status: IssueStatus;
  label: string;
  cssVar: string;
}

const COLUMNS: KanbanColumn[] = [
  { status: IssueStatus.Backlog, label: 'Backlog', cssVar: '--db-status-backlog' },
  { status: IssueStatus.Todo, label: 'Todo', cssVar: '--db-status-todo' },
  { status: IssueStatus.InProgress, label: 'In Progress', cssVar: '--db-status-in-progress' },
  { status: IssueStatus.InReview, label: 'In Review', cssVar: '--db-status-in-review' },
  { status: IssueStatus.Done, label: 'Done', cssVar: '--db-status-done' },
];

type BoardColumns = Record<IssueStatus, Issue[]>;

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    RouterLink,
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    PageHeaderComponent,
    SearchInputComponent,
    PriorityBadgeComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
  ],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanComponent {
  private readonly issueService = inject(IssueService);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly snackBar = inject(MatSnackBar);

  readonly columnsMeta = COLUMNS;
  readonly priorityOptions = Object.values(IssuePriority);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly board = signal<BoardColumns>(this.emptyBoard());

  readonly projects = signal<Project[]>([]);
  readonly users = signal<User[]>([]);

  private filters: Omit<IssueFilters, 'status' | 'page' | 'pageSize' | 'sortBy' | 'sortDirection'> = {};

  constructor() {
    this.projectService.getAll().subscribe((projects) => this.projects.set(projects));
    this.userService.getAll().subscribe((users) => this.users.set(users));
    this.load();
  }

  retry(): void {
    this.load();
  }

  onSearch(search: string): void {
    this.filters = { ...this.filters, search: search || undefined };
    this.load();
  }

  onProjectChange(projectId: string | null): void {
    this.filters = { ...this.filters, projectId };
    this.load();
  }

  onAssigneeChange(assigneeId: string | null): void {
    this.filters = { ...this.filters, assigneeId };
    this.load();
  }

  onPriorityChange(priority: IssuePriority | null): void {
    this.filters = { ...this.filters, priority };
    this.load();
  }

  columnIssues(status: IssueStatus): Issue[] {
    return this.board()[status];
  }

  connectedDropListIds(): string[] {
    return this.columnsMeta.map((c) => c.status);
  }

  assigneeName(issue: Issue): string {
    if (!issue.assigneeId) {
      return 'Unassigned';
    }
    const user = this.users().find((u) => u.id === issue.assigneeId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
  }

  drop(event: CdkDragDrop<Issue[]>, targetStatus: IssueStatus): void {
    if (event.previousContainer === event.container) {
      // Same column — purely a visual reorder. There's no persisted
      // "position" field on Issue (yet), so this only affects the current
      // session, not what gets sent to the backend.
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.board.update((board) => ({ ...board }));
      return;
    }

    const issue = event.previousContainer.data[event.previousIndex];
    const previousStatus = issue.status;

    // Optimistic move: update the board immediately so the drag feels
    // instant, then persist the status change and roll back on failure.
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    this.board.update((board) => ({ ...board }));

    this.issueService.update(issue.id, { status: targetStatus }).subscribe({
      next: (updated) => {
        // Keep the moved card's own data in sync (e.g. updatedDate) without a full reload.
        const column = this.board()[targetStatus];
        const index = column.findIndex((i) => i.id === updated.id);
        if (index !== -1) {
          column[index] = updated;
          this.board.update((board) => ({ ...board }));
        }
      },
      error: () => {
        // Roll back to the original column.
        const targetColumn = this.board()[targetStatus];
        const failedIndex = targetColumn.findIndex((i) => i.id === issue.id);
        if (failedIndex !== -1) {
          const [reverted] = targetColumn.splice(failedIndex, 1);
          this.board()[previousStatus].splice(event.previousIndex, 0, reverted);
          this.board.update((board) => ({ ...board }));
        }
        this.snackBar.open('Unable to move issue. Please try again.', undefined, {
          duration: 3000,
        });
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.issueService.getAllFiltered(this.filters).subscribe({
      next: (issues) => {
        this.board.set(this.groupByStatus(issues));
        this.loading.set(false);
      },
      error: () => {
        this.error.set("We couldn't load the board.");
        this.loading.set(false);
      },
    });
  }

  private groupByStatus(issues: Issue[]): BoardColumns {
    const board = this.emptyBoard();
    for (const issue of issues) {
      board[issue.status].push(issue);
    }
    return board;
  }

  private emptyBoard(): BoardColumns {
    return {
      [IssueStatus.Backlog]: [],
      [IssueStatus.Todo]: [],
      [IssueStatus.InProgress]: [],
      [IssueStatus.InReview]: [],
      [IssueStatus.Done]: [],
    };
  }
}
