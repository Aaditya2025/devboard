import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Issue } from '../models';
import { MOCK_ISSUES } from '../mock/issues.mock';

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

/**
 * Reads/writes issue data. Backed by the mock store for now — swapped for
 * real HTTP calls in Phase 11. Filtering/sorting/pagination (Phase 6) will
 * extend this service further.
 */
@Injectable({ providedIn: 'root' })
export class IssueService {
  getAll(): Observable<Issue[]> {
    return delayed(() => [...MOCK_ISSUES]);
  }

  getAssignedTo(userId: string): Observable<Issue[]> {
    return delayed(() => MOCK_ISSUES.filter((issue) => issue.assigneeId === userId));
  }

  getByProjectId(projectId: string): Observable<Issue[]> {
    return delayed(() => MOCK_ISSUES.filter((issue) => issue.projectId === projectId));
  }
}
