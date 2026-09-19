import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Project } from '../models';
import { MOCK_PROJECTS } from '../mock/projects.mock';

/** Simulated network latency so loading states are visible/testable on mock data. */
const MOCK_LATENCY_MS = 400;

/**
 * Reads/writes project data. Backed by the mock store for now — swapped for
 * real `GET/POST /projects` HTTP calls in Phase 11 without changing this
 * service's public shape, so consuming components don't need to change.
 */
@Injectable({ providedIn: 'root' })
export class ProjectService {
  getAll(): Observable<Project[]> {
    return new Observable<Project[]>((subscriber) => {
      const timeout = setTimeout(() => {
        subscriber.next([...MOCK_PROJECTS]);
        subscriber.complete();
      }, MOCK_LATENCY_MS);
      return () => clearTimeout(timeout);
    });
  }

  getById(id: string): Observable<Project | undefined> {
    return new Observable<Project | undefined>((subscriber) => {
      const timeout = setTimeout(() => {
        subscriber.next(MOCK_PROJECTS.find((project) => project.id === id));
        subscriber.complete();
      }, MOCK_LATENCY_MS);
      return () => clearTimeout(timeout);
    });
  }
}
