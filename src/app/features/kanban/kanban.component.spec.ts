import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { KanbanComponent } from './kanban.component';
import { IssueService } from '../../core/services/issue.service';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';
import { IssuePriority, IssueStatus } from '../../core/enums';
import { Issue } from '../../core/models';

function makeIssue(id: string, status: IssueStatus): Issue {
  return {
    id,
    key: `T-${id}`,
    title: `Issue ${id}`,
    description: '',
    projectId: 'proj-1',
    status,
    priority: IssuePriority.Medium,
    assigneeId: null,
    reporterId: 'user-1',
    labels: [],
    sprintId: null,
    createdDate: '2026-01-01',
    updatedDate: '2026-01-01',
    dueDate: null,
  };
}

describe('KanbanComponent', () => {
  function setup(issues: Issue[], updateImpl?: (id: string, patch: unknown) => unknown) {
    const issueServiceStub = {
      getAllFiltered: () => of(issues),
      update: updateImpl ?? ((_id: string, patch: { status: IssueStatus }) =>
        of({ ...issues[0], status: patch.status })),
    };
    const projectServiceStub = { getAll: () => of([]) };
    const userServiceStub = { getAll: () => of([]) };

    TestBed.configureTestingModule({
      imports: [KanbanComponent],
      providers: [
        { provide: IssueService, useValue: issueServiceStub },
        { provide: ProjectService, useValue: projectServiceStub },
        { provide: UserService, useValue: userServiceStub },
        provideRouter([]),
      ],
    });

    return TestBed.createComponent(KanbanComponent).componentInstance;
  }

  it('groups loaded issues into their status columns', () => {
    const issues = [
      makeIssue('1', IssueStatus.Todo),
      makeIssue('2', IssueStatus.Done),
      makeIssue('3', IssueStatus.Todo),
    ];
    const component = setup(issues);

    expect(component.columnIssues(IssueStatus.Todo).length).toBe(2);
    expect(component.columnIssues(IssueStatus.Done).length).toBe(1);
    expect(component.columnIssues(IssueStatus.Backlog).length).toBe(0);
  });

  it('persists the new status when a card is dragged to a different column', () => {
    const issues = [makeIssue('1', IssueStatus.Todo)];
    let capturedPatch: unknown = null;
    const component = setup(issues, (_id, patch) => {
      capturedPatch = patch;
      return of({ ...issues[0], status: (patch as { status: IssueStatus }).status });
    });

    const todoList = component.columnIssues(IssueStatus.Todo);
    const doneList = component.columnIssues(IssueStatus.Done);

    const event = {
      previousContainer: { data: todoList },
      container: { data: doneList },
      previousIndex: 0,
      currentIndex: 0,
    } as CdkDragDrop<Issue[]>;

    component.drop(event, IssueStatus.Done);

    expect(capturedPatch).toEqual({ status: IssueStatus.Done });
    expect(component.columnIssues(IssueStatus.Done).length).toBe(1);
    expect(component.columnIssues(IssueStatus.Todo).length).toBe(0);
  });

  it('rolls back the move if persisting the status change fails', () => {
    const issues = [makeIssue('1', IssueStatus.Todo)];
    const component = setup(issues, () => throwError(() => new Error('network error')));

    const todoList = component.columnIssues(IssueStatus.Todo);
    const doneList = component.columnIssues(IssueStatus.Done);

    const event = {
      previousContainer: { data: todoList },
      container: { data: doneList },
      previousIndex: 0,
      currentIndex: 0,
    } as CdkDragDrop<Issue[]>;

    component.drop(event, IssueStatus.Done);

    expect(component.columnIssues(IssueStatus.Done).length).toBe(0);
    expect(component.columnIssues(IssueStatus.Todo).length).toBe(1);
  });

  it('reorders within the same column without calling the update API', () => {
    const issues = [
      makeIssue('1', IssueStatus.Todo),
      makeIssue('2', IssueStatus.Todo),
    ];
    const updateSpy = jasmine.createSpy('update');
    const component = setup(issues, updateSpy);

    const todoList = component.columnIssues(IssueStatus.Todo);
    const container = { data: todoList };
    const event = {
      previousContainer: container,
      container,
      previousIndex: 0,
      currentIndex: 1,
    } as CdkDragDrop<Issue[]>;

    component.drop(event, IssueStatus.Todo);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(component.columnIssues(IssueStatus.Todo).map((i) => i.id)).toEqual(['2', '1']);
  });
});
