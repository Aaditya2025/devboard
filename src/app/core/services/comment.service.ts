import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Comment } from '../models';
import { MOCK_COMMENTS } from '../mock/comments.mock';

const MOCK_LATENCY_MS = 350;

function delayed<T>(factory: () => T): Observable<T> {
  return new Observable<T>((subscriber) => {
    const timeout = setTimeout(() => {
      subscriber.next(factory());
      subscriber.complete();
    }, MOCK_LATENCY_MS);
    return () => clearTimeout(timeout);
  });
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  getByIssueId(issueId: string): Observable<Comment[]> {
    return delayed(() =>
      MOCK_COMMENTS.filter((c) => c.issueId === issueId).sort(
        (a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
      ),
    );
  }

  create(issueId: string, userId: string, userName: string, content: string): Observable<Comment> {
    return delayed(() => {
      const comment: Comment = {
        id: `comment-${MOCK_COMMENTS.length + 1}`,
        issueId,
        userId,
        userName,
        content,
        createdDate: new Date().toISOString(),
      };
      MOCK_COMMENTS.push(comment);
      return comment;
    });
  }

  update(commentId: string, content: string): Observable<Comment> {
    return delayed(() => {
      const index = MOCK_COMMENTS.findIndex((c) => c.id === commentId);
      if (index === -1) {
        throw new Error('Comment not found.');
      }
      MOCK_COMMENTS[index] = {
        ...MOCK_COMMENTS[index],
        content,
        updatedDate: new Date().toISOString(),
      };
      return MOCK_COMMENTS[index];
    });
  }

  delete(commentId: string): Observable<void> {
    return delayed(() => {
      const index = MOCK_COMMENTS.findIndex((c) => c.id === commentId);
      if (index !== -1) {
        MOCK_COMMENTS.splice(index, 1);
      }
    });
  }
}
