import { Injectable, computed, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { UserRole } from '../enums';
import { User } from '../models';
import { MOCK_CREDENTIALS, MOCK_USERS } from '../mock/users.mock';

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const TOKEN_KEY = 'devboard.auth.token';
const USER_KEY = 'devboard.auth.user';
/** Simulated network latency so loading states are visible/testable on mock data. */
const MOCK_LATENCY_MS = 500;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(this.restoreUser());
  private readonly tokenSignal = signal<string | null>(this.restoreToken());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  getToken(): string | null {
    return this.tokenSignal();
  }

  login(payload: LoginPayload): Observable<User> {
    const { email, password, rememberMe } = payload;
    const expectedPassword = MOCK_CREDENTIALS[email];
    const user = MOCK_USERS.find((candidate) => candidate.email === email);

    if (!user || expectedPassword !== password) {
      return new Observable<User>((subscriber) => {
        const timeout = setTimeout(() => {
          subscriber.error(new Error('Invalid email or password.'));
        }, MOCK_LATENCY_MS);
        return () => clearTimeout(timeout);
      });
    }

    return new Observable<User>((subscriber) => {
      const timeout = setTimeout(() => {
        this.setSession(user, `mock-token-${user.id}`, rememberMe);
        subscriber.next(user);
        subscriber.complete();
      }, MOCK_LATENCY_MS);
      return () => clearTimeout(timeout);
    });
  }

  register(payload: RegisterPayload): Observable<User> {
    const emailTaken = MOCK_USERS.some((candidate) => candidate.email === payload.email);
    if (emailTaken) {
      return new Observable<User>((subscriber) => {
        const timeout = setTimeout(() => {
          subscriber.error(new Error('An account with this email already exists.'));
        }, MOCK_LATENCY_MS);
        return () => clearTimeout(timeout);
      });
    }

    const newUser: User = {
      id: `user-${MOCK_USERS.length + 1}`,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      role: UserRole.Developer,
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    MOCK_USERS.push(newUser);
    MOCK_CREDENTIALS[payload.email] = payload.password;

    return new Observable<User>((subscriber) => {
      const timeout = setTimeout(() => {
        this.setSession(newUser, `mock-token-${newUser.id}`, true);
        subscriber.next(newUser);
        subscriber.complete();
      }, MOCK_LATENCY_MS);
      return () => clearTimeout(timeout);
    });
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  private setSession(user: User, token: string, rememberMe: boolean): void {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  private restoreUser(): User | null {
    const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private restoreToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  }
}
