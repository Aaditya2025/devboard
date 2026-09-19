import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Issue } from '../models';
import { MOCK_ISSUES } from '../mock/issues.mock';

const MOCK_LATENCY_MS = 400;

/**
 * Reads/writes issue data. Backed by the mock store for now — swapped for
 * real HTTP calls in Phase 11. Filtering/sorting/pagination (Phase 6) will
 * extend this service; kept intentionally minimal here since Phase 4 only
 * needs read access for dashboard statistics.
 */
@Injectable({ providedIn: 'root' })
export class IssueService {
  getAll(): Observable<Issue[]> {
    return new Observable<Issue[]>((subscriber) => {
      const timeout = setTimeout(() => {
        subscriber.next([...MOCK_ISSUES]);
        subscriber.complete();
      }, MOCK_LATENCY_MS);
      return () => clearTimeout(timeout);
    });
  }

  getAssignedTo(userId: string): Observable<Issue[]> {
    return new Observable<Issue[]>((subscriber) => {
      const timeout = setTimeout(() => {
        subscriber.next(MOCK_ISSUES.filter((issue) => issue.assigneeId === userId));
        subscriber.complete();
      }, MOCK_LATENCY_MS);
      return () => clearTimeout(timeout);
    });
  }
}
