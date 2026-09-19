import { TestBed } from '@angular/core/testing';
import { DashboardService } from './dashboard.service';
import { IssuePriority, IssueStatus } from '../enums';

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DashboardService);
  });

  it('aggregates total, completed, in-progress and high-priority issue counts', (done) => {
    service.getStatistics().subscribe((stats) => {
      expect(stats.totalIssues).toBeGreaterThan(0);
      expect(stats.completedIssues).toBe(stats.issuesByStatus[IssueStatus.Done]);
      expect(stats.inProgressIssues).toBe(stats.issuesByStatus[IssueStatus.InProgress]);
      expect(stats.highPriorityIssues).toBe(
        stats.issuesByPriority[IssuePriority.High] + stats.issuesByPriority[IssuePriority.Critical],
      );
      done();
    });
  });

  it('counts issues across every status and priority bucket, including zero-count ones', (done) => {
    service.getStatistics().subscribe((stats) => {
      for (const status of Object.values(IssueStatus)) {
        expect(stats.issuesByStatus[status]).toBeDefined();
      }
      for (const priority of Object.values(IssuePriority)) {
        expect(stats.issuesByPriority[priority]).toBeDefined();
      }
      done();
    });
  });

  it('sums issuesByStatus back up to totalIssues', (done) => {
    service.getStatistics().subscribe((stats) => {
      const sum = Object.values(stats.issuesByStatus).reduce((a, b) => a + b, 0);
      expect(sum).toBe(stats.totalIssues);
      done();
    });
  });

  it('includes progress for every mock project', (done) => {
    service.getStatistics().subscribe((stats) => {
      expect(stats.projectProgress.length).toBeGreaterThan(0);
      for (const project of stats.projectProgress) {
        expect(project.progress).toBeGreaterThanOrEqual(0);
        expect(project.progress).toBeLessThanOrEqual(100);
      }
      done();
    });
  });

  it('returns exactly 7 days of completion trend data', (done) => {
    service.getStatistics().subscribe((stats) => {
      expect(stats.completionTrend.length).toBe(7);
      done();
    });
  });

  it('returns only issues assigned to the given user', (done) => {
    service.getAssignedIssues('user-1').subscribe((issues) => {
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.every((issue) => issue.assigneeId === 'user-1')).toBe(true);
      done();
    });
  });

  it('returns an empty array for a user with no assigned issues', (done) => {
    service.getAssignedIssues('nonexistent-user').subscribe((issues) => {
      expect(issues).toEqual([]);
      done();
    });
  });

  it('returns recent activity sorted newest first, respecting the limit', (done) => {
    service.getRecentActivity(3).subscribe((activity) => {
      expect(activity.length).toBe(3);
      const timestamps = activity.map((a) => new Date(a.createdDate).getTime());
      const sorted = [...timestamps].sort((a, b) => b - a);
      expect(timestamps).toEqual(sorted);
      done();
    });
  });
});
