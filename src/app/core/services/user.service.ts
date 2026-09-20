import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models';
import { MOCK_USERS } from '../mock/users.mock';

const MOCK_LATENCY_MS = 300;

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
export class UserService {
  getAll(): Observable<User[]> {
    return delayed(() => [...MOCK_USERS]);
  }

  getById(id: string): Observable<User | undefined> {
    return delayed(() => MOCK_USERS.find((user) => user.id === id));
  }
}
