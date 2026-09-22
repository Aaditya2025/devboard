import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('starts empty when no user is logged in', () => {
    expect(service.notifications()).toEqual([]);
    expect(service.unreadCount()).toBe(0);
  });

  it('loads notifications for the current user once logged in', (done) => {
    authService
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: true })
      .subscribe(() => {
        setTimeout(() => {
          expect(service.notifications().length).toBeGreaterThan(0);
          expect(service.notifications().every((n) => n.userId === 'user-1')).toBe(true);
          done();
        }, 500);
      });
  });

  it('computes unreadCount from the loaded notifications', (done) => {
    authService
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: true })
      .subscribe(() => {
        setTimeout(() => {
          const expectedUnread = service.notifications().filter((n) => !n.isRead).length;
          expect(service.unreadCount()).toBe(expectedUnread);
          expect(service.unreadCount()).toBeGreaterThan(0);
          done();
        }, 500);
      });
  });

  it('marks a single notification as read and decrements unreadCount', (done) => {
    authService
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: true })
      .subscribe(() => {
        setTimeout(() => {
          const before = service.unreadCount();
          const target = service.notifications().find((n) => !n.isRead);
          expect(target).toBeTruthy();

          service.markAsRead(target!.id);

          expect(service.unreadCount()).toBe(before - 1);
          expect(service.notifications().find((n) => n.id === target!.id)?.isRead).toBe(true);
          done();
        }, 500);
      });
  });

  it('marking an already-read notification as read again is a no-op', (done) => {
    authService
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: true })
      .subscribe(() => {
        setTimeout(() => {
          const read = service.notifications().find((n) => n.isRead);
          expect(read).toBeTruthy();
          const before = service.unreadCount();

          service.markAsRead(read!.id);

          expect(service.unreadCount()).toBe(before);
          done();
        }, 500);
      });
  });

  it('marks every notification as read via markAllAsRead', (done) => {
    authService
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: true })
      .subscribe(() => {
        setTimeout(() => {
          expect(service.unreadCount()).toBeGreaterThan(0);

          service.markAllAsRead();

          expect(service.unreadCount()).toBe(0);
          expect(service.notifications().every((n) => n.isRead)).toBe(true);
          done();
        }, 500);
      });
  });

  it('removes a notification via clear()', (done) => {
    authService
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: true })
      .subscribe(() => {
        setTimeout(() => {
          const before = service.notifications().length;
          const target = service.notifications()[0];

          service.clear(target.id);

          expect(service.notifications().length).toBe(before - 1);
          expect(service.notifications().find((n) => n.id === target.id)).toBeUndefined();
          done();
        }, 500);
      });
  });

  it('clears notifications on logout', (done) => {
    authService
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: true })
      .subscribe(() => {
        setTimeout(() => {
          expect(service.notifications().length).toBeGreaterThan(0);

          authService.logout();

          setTimeout(() => {
            expect(service.notifications()).toEqual([]);
            expect(service.unreadCount()).toBe(0);
            done();
          }, 50);
        }, 500);
      });
  });
});
