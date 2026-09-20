import { TestBed } from '@angular/core/testing';
import { IssueService } from './issue.service';
import { IssuePriority, IssueStatus } from '../enums';

describe('IssueService', () => {
  let service: IssueService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IssueService);
  });

  describe('getFiltered', () => {
    it('returns a paginated response shape', (done) => {
      service.getFiltered({}).subscribe((result) => {
        expect(result.items.length).toBeGreaterThan(0);
        expect(result.page).toBe(1);
        expect(result.totalItems).toBeGreaterThan(0);
        expect(result.totalPages).toBeGreaterThan(0);
        done();
      });
    });

    it('filters by search term across title and key', (done) => {
      service.getFiltered({ search: 'login' }).subscribe((result) => {
        expect(result.items.length).toBeGreaterThan(0);
        expect(
          result.items.every(
            (issue) =>
              issue.title.toLowerCase().includes('login') || issue.key.toLowerCase().includes('login'),
          ),
        ).toBe(true);
        done();
      });
    });

    it('filters by status', (done) => {
      service.getFiltered({ status: IssueStatus.Done }).subscribe((result) => {
        expect(result.items.every((issue) => issue.status === IssueStatus.Done)).toBe(true);
        done();
      });
    });

    it('filters by priority', (done) => {
      service.getFiltered({ priority: IssuePriority.Critical }).subscribe((result) => {
        expect(result.items.every((issue) => issue.priority === IssuePriority.Critical)).toBe(true);
        done();
      });
    });

    it('filters by project', (done) => {
      service.getFiltered({ projectId: 'proj-1' }).subscribe((result) => {
        expect(result.items.every((issue) => issue.projectId === 'proj-1')).toBe(true);
        done();
      });
    });

    it('combines multiple filters (AND, not OR)', (done) => {
      service
        .getFiltered({ projectId: 'proj-1', status: IssueStatus.Done })
        .subscribe((result) => {
          expect(
            result.items.every(
              (issue) => issue.projectId === 'proj-1' && issue.status === IssueStatus.Done,
            ),
          ).toBe(true);
          done();
        });
    });

    it('returns an empty page (not an error) when no issues match', (done) => {
      service.getFiltered({ search: 'nonexistent-xyz-123' }).subscribe((result) => {
        expect(result.items).toEqual([]);
        expect(result.totalItems).toBe(0);
        done();
      });
    });

    it('sorts ascending by the given field', (done) => {
      service.getFiltered({ sortBy: 'createdDate', sortDirection: 'asc' }).subscribe((result) => {
        const dates = result.items.map((i) => i.createdDate);
        expect(dates).toEqual([...dates].sort());
        done();
      });
    });

    it('sorts descending by the given field', (done) => {
      service.getFiltered({ sortBy: 'createdDate', sortDirection: 'desc' }).subscribe((result) => {
        const dates = result.items.map((i) => i.createdDate);
        expect(dates).toEqual([...dates].sort().reverse());
        done();
      });
    });

    it('paginates results according to pageSize', (done) => {
      service.getFiltered({ pageSize: 2, page: 1 }).subscribe((result) => {
        expect(result.items.length).toBe(2);
        expect(result.pageSize).toBe(2);
        done();
      });
    });

    it('clamps an out-of-range page to the last valid page', (done) => {
      service.getFiltered({ pageSize: 2, page: 9999 }).subscribe((result) => {
        expect(result.page).toBe(result.totalPages);
        done();
      });
    });
  });

  describe('CRUD', () => {
    it('creates an issue with a generated key based on the project prefix', (done) => {
      service
        .create({
          title: 'New test issue',
          description: '',
          projectId: 'proj-1',
          status: IssueStatus.Backlog,
          priority: IssuePriority.Low,
          assigneeId: null,
          labelIds: [],
          sprintId: null,
          dueDate: null,
        })
        .subscribe((created) => {
          expect(created.key.startsWith('DEV-')).toBe(true);
          expect(created.title).toBe('New test issue');
          done();
        });
    });

    it('updates only the provided fields', (done) => {
      service.getAll().subscribe((issues) => {
        const target = issues[0];
        service.update(target.id, { title: 'Updated title only' }).subscribe((updated) => {
          expect(updated.title).toBe('Updated title only');
          expect(updated.status).toBe(target.status);
          expect(updated.priority).toBe(target.priority);
          done();
        });
      });
    });

    it('deletes an issue', (done) => {
      service.getAll().subscribe((issuesBefore) => {
        const target = issuesBefore[0];
        service.delete(target.id).subscribe(() => {
          service.getById(target.id).subscribe((found) => {
            expect(found).toBeUndefined();
            done();
          });
        });
      });
    });
  });
});
