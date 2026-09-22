import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Notification } from '../models';
import { MOCK_NOTIFICATIONS } from '../mock/notifications.mock';
import { AuthService } from './auth.service';

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

/**
 * Notification center state, shared by the navbar's unread badge and the
 * full notification list page — both read the same signal, so marking one
 * read anywhere updates the badge everywhere immediately.
 *
 * Backed by the mock store for now; designed to be swappable for a real-time
 * SignalR connection later (Phase 11+) without changing what components read
 * — `notifications`/`unreadCount` stay the same, only how they get
 * populated changes (push instead of poll/fetch).
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly authService = inject(AuthService);

  private readonly notificationsSignal = signal<Notification[]>([]);
  private readonly loadingSignal = signal(false);

  readonly notifications = this.notificationsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly unreadCount = computed(
    () => this.notificationsSignal().filter((n) => !n.isRead).length,
  );

  constructor() {
    // Reload whenever the logged-in user changes (login/logout/switch).
    effect(() => {
      const userId = this.authService.currentUser()?.id;
      if (userId) {
        this.load(userId);
      } else {
        this.notificationsSignal.set([]);
      }
    });
  }

  reload(): void {
    const userId = this.authService.currentUser()?.id;
    if (userId) {
      this.load(userId);
    }
  }

  markAsRead(id: string): void {
    const notification = this.notificationsSignal().find((n) => n.id === id);
    if (!notification || notification.isRead) {
      return;
    }
    // Optimistic — mock latency would make the unread badge lag visibly otherwise.
    this.notificationsSignal.update((list) =>
      list.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    delayed(() => undefined).subscribe();
  }

  markAllAsRead(): void {
    this.notificationsSignal.update((list) => list.map((n) => ({ ...n, isRead: true })));
    delayed(() => undefined).subscribe();
  }

  clear(id: string): void {
    this.notificationsSignal.update((list) => list.filter((n) => n.id !== id));
    delayed(() => undefined).subscribe();
  }

  private load(userId: string): void {
    this.loadingSignal.set(true);
    delayed(() => MOCK_NOTIFICATIONS.filter((n) => n.userId === userId)).subscribe(
      (notifications) => {
        this.notificationsSignal.set(notifications);
        this.loadingSignal.set(false);
      },
    );
  }
}
