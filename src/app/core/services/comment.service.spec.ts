import { TestBed } from '@angular/core/testing';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CommentService);
  });

  it('returns comments for an issue sorted oldest first', (done) => {
    service.getByIssueId('issue-1').subscribe((comments) => {
      expect(comments.length).toBeGreaterThan(0);
      const dates = comments.map((c) => new Date(c.createdDate).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => a - b));
      done();
    });
  });

  it('returns an empty array for an issue with no comments', (done) => {
    service.getByIssueId('issue-nonexistent').subscribe((comments) => {
      expect(comments).toEqual([]);
      done();
    });
  });

  it('creates a comment with the given author and content', (done) => {
    service.create('issue-2', 'user-1', 'Aditya Sharma', 'A new test comment.').subscribe((comment) => {
      expect(comment.issueId).toBe('issue-2');
      expect(comment.userName).toBe('Aditya Sharma');
      expect(comment.content).toBe('A new test comment.');
      done();
    });
  });

  it('updates a comment content and sets updatedDate', (done) => {
    service.create('issue-2', 'user-1', 'Aditya Sharma', 'Original content.').subscribe((created) => {
      service.update(created.id, 'Edited content.').subscribe((updated) => {
        expect(updated.content).toBe('Edited content.');
        expect(updated.updatedDate).toBeTruthy();
        done();
      });
    });
  });

  it('deletes a comment', (done) => {
    service.create('issue-2', 'user-1', 'Aditya Sharma', 'To be deleted.').subscribe((created) => {
      service.delete(created.id).subscribe(() => {
        service.getByIssueId('issue-2').subscribe((comments) => {
          expect(comments.find((c) => c.id === created.id)).toBeUndefined();
          done();
        });
      });
    });
  });
});
