import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { IssueStatus, IssuePriority } from '../../../core/enums';
import { IssueService } from '../../../core/services/issue.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { Issue, IssueFilters, Project, User } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../../shared/components/search-input/search-input.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

type SortableColumn = 'createdDate' | 'priority' | 'status' | 'dueDate';

const STATUS_OPTIONS = Object.values(IssueStatus);
const PRIORITY_OPTIONS = Object.values(IssuePriority);

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    PageHeaderComponent,
    SearchInputComponent,
    PaginationComponent,
    StatusBadgeComponent,
    PriorityBadgeComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './issue-list.component.html',
  styleUrl: './issue-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueListComponent {
  private readonly issueService = inject(IssueService);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly statusOptions = STATUS_OPTIONS;
  readonly priorityOptions = PRIORITY_OPTIONS;

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly issues = signal<Issue[]>([]);
  readonly totalItems = signal(0);
  readonly totalPages = signal(1);

  readonly projects = signal<Project[]>([]);
  readonly users = signal<User[]>([]);

  readonly filters = signal<IssueFilters>(this.readFiltersFromUrl());

  constructor() {
    this.projectService.getAll().subscribe((projects) => this.projects.set(projects));
    this.userService.getAll().subscribe((users) => this.users.set(users));
    this.load();
  }

  retry(): void {
    this.load();
  }

  onSearch(search: string): void {
    this.updateFilters({ search: search || undefined, page: 1 });
  }

  onStatusChange(status: IssueStatus | null): void {
    this.updateFilters({ status, page: 1 });
  }

  onPriorityChange(priority: IssuePriority | null): void {
    this.updateFilters({ priority, page: 1 });
  }

  onAssigneeChange(assigneeId: string | null): void {
    this.updateFilters({ assigneeId, page: 1 });
  }

  onProjectChange(projectId: string | null): void {
    this.updateFilters({ projectId, page: 1 });
  }

  onSort(column: SortableColumn): void {
    const current = this.filters();
    const direction =
      current.sortBy === column && current.sortDirection === 'asc' ? 'desc' : 'asc';
    this.updateFilters({ sortBy: column, sortDirection: direction });
  }

  onPageChange(page: number): void {
    this.updateFilters({ page });
  }

  assigneeName(issue: Issue): string {
    if (!issue.assigneeId) {
      return 'Unassigned';
    }
    const user = this.users().find((u) => u.id === issue.assigneeId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
  }

  clearFilters(): void {
    this.filters.set({ page: 1, pageSize: 10 });
    this.syncUrlAndLoad();
  }

  private updateFilters(patch: Partial<IssueFilters>): void {
    this.filters.update((current) => ({ ...current, ...patch }));
    this.syncUrlAndLoad();
  }

  private syncUrlAndLoad(): void {
    const filters = this.filters();
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        search: filters.search || null,
        status: filters.status || null,
        priority: filters.priority || null,
        assigneeId: filters.assigneeId || null,
        projectId: filters.projectId || null,
        page: filters.page && filters.page > 1 ? filters.page : null,
        sortBy: filters.sortBy || null,
        sortDirection: filters.sortBy ? filters.sortDirection : null,
      },
      queryParamsHandling: '',
    });
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.issueService.getFiltered(this.filters()).subscribe({
      next: (result) => {
        this.issues.set(result.items);
        this.totalItems.set(result.totalItems);
        this.totalPages.set(result.totalPages);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("We couldn't load your issues.");
        this.loading.set(false);
      },
    });
  }

  private readFiltersFromUrl(): IssueFilters {
    const params = this.activatedRoute.snapshot.queryParamMap;
    return {
      search: params.get('search') ?? undefined,
      status: (params.get('status') as IssueStatus | null) ?? null,
      priority: (params.get('priority') as IssuePriority | null) ?? null,
      assigneeId: params.get('assigneeId'),
      projectId: params.get('projectId'),
      page: params.get('page') ? Number(params.get('page')) : 1,
      pageSize: 10,
      sortBy: (params.get('sortBy') as IssueFilters['sortBy']) ?? null,
      sortDirection: (params.get('sortDirection') as 'asc' | 'desc') ?? 'asc',
    };
  }
}
