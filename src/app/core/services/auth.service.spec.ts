import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts unauthenticated with no stored session', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('logs in a valid mock user and sets auth state', (done) => {
    service
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: true })
      .subscribe((user) => {
        expect(user.email).toBe('admin@devboard.dev');
        expect(service.isAuthenticated()).toBe(true);
        expect(service.currentUser()?.email).toBe('admin@devboard.dev');
        expect(service.getToken()).toBeTruthy();
        done();
      });
  });

  it('persists the session to localStorage when rememberMe is true', (done) => {
    service
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: true })
      .subscribe(() => {
        expect(localStorage.getItem('devboard.auth.token')).toBeTruthy();
        expect(sessionStorage.getItem('devboard.auth.token')).toBeNull();
        done();
      });
  });

  it('persists the session to sessionStorage when rememberMe is false', (done) => {
    service
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: false })
      .subscribe(() => {
        expect(sessionStorage.getItem('devboard.auth.token')).toBeTruthy();
        expect(localStorage.getItem('devboard.auth.token')).toBeNull();
        done();
      });
  });

  it('rejects an invalid password without changing auth state', (done) => {
    service.login({ email: 'admin@devboard.dev', password: 'wrong', rememberMe: true }).subscribe({
      next: () => fail('expected login to error'),
      error: (error: Error) => {
        expect(error.message).toContain('Invalid email or password');
        expect(service.isAuthenticated()).toBe(false);
        done();
      },
    });
  });

  it('rejects an unknown email', (done) => {
    service
      .login({ email: 'nobody@devboard.dev', password: 'Password123!', rememberMe: true })
      .subscribe({
        next: () => fail('expected login to error'),
        error: (error: Error) => {
          expect(error.message).toContain('Invalid email or password');
          done();
        },
      });
  });

  it('registers a new user and logs them in', (done) => {
    const email = `new-${Date.now()}@devboard.dev`;
    service
      .register({ firstName: 'Test', lastName: 'User', email, password: 'Password123!' })
      .subscribe((user) => {
        expect(user.email).toBe(email);
        expect(service.isAuthenticated()).toBe(true);
        done();
      });
  });

  it('rejects registration with an email that is already taken', (done) => {
    service
      .register({
        firstName: 'Dup',
        lastName: 'User',
        email: 'admin@devboard.dev',
        password: 'Password123!',
      })
      .subscribe({
        next: () => fail('expected register to error'),
        error: (error: Error) => {
          expect(error.message).toContain('already exists');
          done();
        },
      });
  });

  it('clears auth state and storage on logout', (done) => {
    service
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: true })
      .subscribe(() => {
        service.logout();
        expect(service.isAuthenticated()).toBe(false);
        expect(service.currentUser()).toBeNull();
        expect(service.getToken()).toBeNull();
        expect(localStorage.getItem('devboard.auth.token')).toBeNull();
        done();
      });
  });
});
