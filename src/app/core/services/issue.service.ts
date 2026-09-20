import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateIssuePayload, Issue, IssueFilters, PaginationResponse, UpdateIssuePayload } from '../models';
import { MOCK_ISSUES } from '../mock/issues.mock';
import { MOCK_PROJECTS } from '../mock/projects.mock';
import { ALL_LABELS } from '../mock/labels.mock';

const MOCK_LATENCY_MS = 400;

function delayed<T>(factory: () => T): Observable<T> {
  return new Observable<T>((subscriber) => {
    const timeout = setTimeout(() => {
      subscriber.next(factory());
      subscriber.complete();
    }, MOCK_LATENCY_MS);
    return () => clearTimeout(timeout);
  });
}

const DEFAULT_PAGE_SIZE = 10;

/**
 * Reads/writes issue data. Backed by the mock store for now — swapped for
 * real HTTP calls in Phase 11. `getFiltered` does search/filter/sort/
 * pagination client-side against the mock array today, but is shaped
 * exactly like a paginated REST endpoint (IssueFilters in, PaginationResponse
 * out) so the frontend is already designed for server-side filtering later —
 * IssueListComponent never needs to change when that swap happens.
 */
@Injectable({ providedIn: 'root' })
export class IssueService {
  getAll(): Observable<Issue[]> {
    return delayed(() => [...MOCK_ISSUES]);
  }

  getById(id: string): Observable<Issue | undefined> {
    return delayed(() => MOCK_ISSUES.find((issue) => issue.id === id));
  }

  getAssignedTo(userId: string): Observable<Issue[]> {
    return delayed(() => MOCK_ISSUES.filter((issue) => issue.assigneeId === userId));
  }

  getByProjectId(projectId: string): Observable<Issue[]> {
    return delayed(() => MOCK_ISSUES.filter((issue) => issue.projectId === projectId));
  }

  getFiltered(filters: IssueFilters): Observable<PaginationResponse<Issue>> {
    return delayed(() => {
      let items = [...MOCK_ISSUES];

      if (filters.search) {
        const term = filters.search.trim().toLowerCase();
        items = items.filter(
          (issue) =>
            issue.title.toLowerCase().includes(term) || issue.key.toLowerCase().includes(term),
        );
      }
      if (filters.status) {
        items = items.filter((issue) => issue.status === filters.status);
      }
      if (filters.priority) {
        items = items.filter((issue) => issue.priority === filters.priority);
      }
      if (filters.assigneeId) {
        items = items.filter((issue) => issue.assigneeId === filters.assigneeId);
      }
      if (filters.projectId) {
        items = items.filter((issue) => issue.projectId === filters.projectId);
      }

      if (filters.sortBy) {
        const sortBy = filters.sortBy;
        const direction = filters.sortDirection === 'desc' ? -1 : 1;
        items = [...items].sort((a, b) => {
          const aValue = a[sortBy];
          const bValue = b[sortBy];
          if (aValue === bValue) return 0;
          if (aValue === null || aValue === undefined) return 1;
          if (bValue === null || bValue === undefined) return -1;
          return aValue < bValue ? -direction : direction;
        });
      }

      const totalItems = items.length;
      const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : DEFAULT_PAGE_SIZE;
      const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      const page = Math.min(Math.max(1, filters.page ?? 1), totalPages);
      const start = (page - 1) * pageSize;

      return {
        items: items.slice(start, start + pageSize),
        page,
        pageSize,
        totalItems,
        totalPages,
      };
    });
  }

  create(payload: CreateIssuePayload): Observable<Issue> {
    return delayed(() => {
      const now = new Date().toISOString().slice(0, 10);
      const projectIssues = MOCK_ISSUES.filter((i) => i.projectId === payload.projectId);
      const issue: Issue = {
        id: `issue-${MOCK_ISSUES.length + 1}`,
        key: this.nextIssueKey(payload.projectId, projectIssues.length),
        title: payload.title,
        description: payload.description,
        projectId: payload.projectId,
        status: payload.status,
        priority: payload.priority,
        assigneeId: payload.assigneeId,
        reporterId: 'user-1',
        labels: ALL_LABELS.filter((label) => payload.labelIds.includes(label.id)),
        sprintId: payload.sprintId,
        createdDate: now,
        updatedDate: now,
        dueDate: payload.dueDate,
      };
      MOCK_ISSUES.push(issue);
      return issue;
    });
  }

  update(id: string, payload: UpdateIssuePayload): Observable<Issue> {
    return delayed(() => {
      const index = MOCK_ISSUES.findIndex((issue) => issue.id === id);
      if (index === -1) {
        throw new Error('Issue not found.');
      }
      const current = MOCK_ISSUES[index];
      const updated: Issue = {
        ...current,
        ...(payload.title !== undefined && { title: payload.title }),
        ...(payload.description !== undefined && { description: payload.description }),
        ...(payload.projectId !== undefined && { projectId: payload.projectId }),
        ...(payload.status !== undefined && { status: payload.status }),
        ...(payload.priority !== undefined && { priority: payload.priority }),
        ...(payload.assigneeId !== undefined && { assigneeId: payload.assigneeId }),
        ...(payload.sprintId !== undefined && { sprintId: payload.sprintId }),
        ...(payload.dueDate !== undefined && { dueDate: payload.dueDate }),
        ...(payload.labelIds !== undefined && {
          labels: ALL_LABELS.filter((label) => payload.labelIds?.includes(label.id)),
        }),
        updatedDate: new Date().toISOString().slice(0, 10),
      };
      MOCK_ISSUES[index] = updated;
      return updated;
    });
  }

  delete(id: string): Observable<void> {
    return delayed(() => {
      const index = MOCK_ISSUES.findIndex((issue) => issue.id === id);
      if (index !== -1) {
        MOCK_ISSUES.splice(index, 1);
      }
    });
  }

  private nextIssueKey(projectId: string, existingCountForProject: number): string {
    // Mirrors real Jira-style keys (PROJECTKEY-N) using the project's own
    // issue count rather than the global MOCK_ISSUES length, so keys stay
    // sequential per project instead of jumping around.
    const project = MOCK_PROJECTS.find((p) => p.id === projectId);
    const prefix = project?.key ?? 'ISSUE';
    return `${prefix}-${existingCountForProject + 1}`;
  }
}
