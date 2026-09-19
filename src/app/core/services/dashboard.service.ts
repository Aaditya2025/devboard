import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { IssuePriority, IssueStatus } from '../enums';
import { Activity, DashboardStatistics, Issue, Project } from '../models';
import { ProjectService } from './project.service';
import { IssueService } from './issue.service';
import { MOCK_ACTIVITIES } from '../mock/activities.mock';

const MOCK_LATENCY_MS = 400;

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly projectService = inject(ProjectService);
  private readonly issueService = inject(IssueService);

  /**
   * Aggregates statistics from issues + projects. Once a real backend exists
   * (Phase 11) this becomes a single `GET /dashboard/statistics` call — the
   * aggregation logic here moves server-side, but the returned shape (and
   * therefore every component consuming it) stays the same.
   */
  getStatistics(): Observable<DashboardStatistics> {
    return forkJoin({
      issues: this.issueService.getAll(),
      projects: this.projectService.getAll(),
    }).pipe(map(({ issues, projects }) => this.buildStatistics(issues, projects)));
  }

  getAssignedIssues(userId: string): Observable<Issue[]> {
    return this.issueService.getAssignedTo(userId);
  }

  getRecentActivity(limit = 6): Observable<Activity[]> {
    return new Observable<Activity[]>((subscriber) => {
      const timeout = setTimeout(() => {
        const sorted = [...MOCK_ACTIVITIES].sort(
          (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime(),
        );
        subscriber.next(sorted.slice(0, limit));
        subscriber.complete();
      }, MOCK_LATENCY_MS);
      return () => clearTimeout(timeout);
    });
  }

  private buildStatistics(issues: Issue[], projects: Project[]): DashboardStatistics {
    const issuesByStatus = this.countBy(issues, (issue) => issue.status, Object.values(IssueStatus));
    const issuesByPriority = this.countBy(
      issues,
      (issue) => issue.priority,
      Object.values(IssuePriority),
    );

    return {
      totalIssues: issues.length,
      completedIssues: issuesByStatus[IssueStatus.Done] ?? 0,
      inProgressIssues: issuesByStatus[IssueStatus.InProgress] ?? 0,
      highPriorityIssues:
        (issuesByPriority[IssuePriority.High] ?? 0) + (issuesByPriority[IssuePriority.Critical] ?? 0),
      issuesByStatus,
      issuesByPriority,
      projectProgress: projects.map((project) => ({
        projectId: project.id,
        projectName: project.name,
        progress: project.progress,
      })),
      completionTrend: this.buildCompletionTrend(issues),
    };
  }

  private countBy<T, K extends string>(
    items: T[],
    keyFn: (item: T) => K,
    allKeys: K[],
  ): Record<K, number> {
    const counts = Object.fromEntries(allKeys.map((key) => [key, 0])) as Record<K, number>;
    for (const item of items) {
      counts[keyFn(item)] += 1;
    }
    return counts;
  }

  /** Last 7 days of completed-issue counts, derived from each issue's updatedDate. */
  private buildCompletionTrend(issues: Issue[]): { date: string; completed: number }[] {
    const days: { date: string; completed: number }[] = [];
    const doneIssues = issues.filter((issue) => issue.status === IssueStatus.Done);

    for (let offset = 6; offset >= 0; offset--) {
      const day = new Date();
      day.setDate(day.getDate() - offset);
      const dateKey = day.toISOString().slice(0, 10);

      const completed = doneIssues.filter(
        (issue) => issue.updatedDate.slice(0, 10) === dateKey,
      ).length;

      days.push({ date: dateKey, completed });
    }

    return days;
  }
}
