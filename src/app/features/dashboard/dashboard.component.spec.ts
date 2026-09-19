import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { IssuePriority, IssueStatus } from '../../core/enums';
import { DashboardStatistics } from '../../core/models';

const STUB_STATS: DashboardStatistics = {
  totalIssues: 5,
  completedIssues: 2,
  inProgressIssues: 1,
  highPriorityIssues: 1,
  issuesByStatus: {
    [IssueStatus.Backlog]: 1,
    [IssueStatus.Todo]: 1,
    [IssueStatus.InProgress]: 1,
    [IssueStatus.InReview]: 0,
    [IssueStatus.Done]: 2,
  },
  issuesByPriority: {
    [IssuePriority.Low]: 2,
    [IssuePriority.Medium]: 2,
    [IssuePriority.High]: 1,
    [IssuePriority.Critical]: 0,
  },
  projectProgress: [{ projectId: 'p1', projectName: 'Test Project', progress: 50 }],
  completionTrend: [],
};

describe('DashboardComponent', () => {
  it('starts in a loading state and shows statistics once loaded', () => {
    const dashboardServiceStub = {
      getStatistics: () => of(STUB_STATS),
      getAssignedIssues: () => of([]),
      getRecentActivity: () => of([]),
    };
    const authServiceStub = { currentUser: () => ({ id: 'user-1' }) };

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceStub },
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;

    // Statistics resolve synchronously via `of(...)`, so by the time the
    // constructor's load() call returns, loading is already false.
    expect(component.loading()).toBe(false);
    expect(component.statistics()).toEqual(STUB_STATS);
    expect(component.error()).toBeNull();
  });

  it('shows an error state when statistics fail to load', () => {
    const dashboardServiceStub = {
      getStatistics: () => throwError(() => new Error('network down')),
      getAssignedIssues: () => of([]),
      getRecentActivity: () => of([]),
    };
    const authServiceStub = { currentUser: () => ({ id: 'user-1' }) };

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceStub },
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;

    expect(component.loading()).toBe(false);
    expect(component.error()).toContain("couldn't load");
    expect(component.statistics()).toBeNull();
  });

  it('retry() re-fetches statistics and clears the error', () => {
    let callCount = 0;
    const dashboardServiceStub = {
      getStatistics: () => {
        callCount++;
        return callCount === 1 ? throwError(() => new Error('fail')) : of(STUB_STATS);
      },
      getAssignedIssues: () => of([]),
      getRecentActivity: () => of([]),
    };
    const authServiceStub = { currentUser: () => ({ id: 'user-1' }) };

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceStub },
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    const fixture = TestBed.createComponent(DashboardComponent);
    const component = fixture.componentInstance;
    expect(component.error()).toBeTruthy();

    component.retry();

    expect(component.error()).toBeNull();
    expect(component.statistics()).toEqual(STUB_STATS);
  });

  it('does not request assigned issues when there is no current user', () => {
    const dashboardServiceStub = {
      getStatistics: () => of(STUB_STATS),
      getAssignedIssues: jasmine.createSpy('getAssignedIssues').and.returnValue(of([])),
      getRecentActivity: () => of([]),
    };
    const authServiceStub = { currentUser: () => null };

    TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardServiceStub },
        { provide: AuthService, useValue: authServiceStub },
      ],
    });

    TestBed.createComponent(DashboardComponent);
    expect(dashboardServiceStub.getAssignedIssues).not.toHaveBeenCalled();
  });
});
