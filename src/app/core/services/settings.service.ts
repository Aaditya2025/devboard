import { Injectable, signal } from '@angular/core';

export interface NotificationPreferences {
  email: boolean;
  issueAssignment: boolean;
  comments: boolean;
}

const DARK_MODE_KEY = 'devboard.settings.darkMode';
const NOTIFICATION_PREFS_KEY = 'devboard.settings.notifications';

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  email: true,
  issueAssignment: true,
  comments: true,
};

/**
 * Frontend-only preferences (spec: "Persist frontend-only preferences
 * locally until the backend exists"). Everything here is read from and
 * written to localStorage directly — there's no backend endpoint for
 * settings yet, so unlike the other services this one has no mock HTTP
 * latency to simulate; the "request" IS the local write.
 *
 * Instantiated eagerly in AppComponent (see app.component.ts) so dark mode
 * applies before the first paint, not only once someone visits Settings.
 */
@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly darkModeSignal = signal<boolean>(this.readDarkMode());
  private readonly notificationPrefsSignal = signal<NotificationPreferences>(
    this.readNotificationPrefs(),
  );

  readonly darkMode = this.darkModeSignal.asReadonly();
  readonly notificationPreferences = this.notificationPrefsSignal.asReadonly();

  constructor() {
    this.applyTheme(this.darkModeSignal());
  }

  setDarkMode(enabled: boolean): void {
    this.darkModeSignal.set(enabled);
    localStorage.setItem(DARK_MODE_KEY, String(enabled));
    this.applyTheme(enabled);
  }

  setNotificationPreference(key: keyof NotificationPreferences, value: boolean): void {
    const next = { ...this.notificationPrefsSignal(), [key]: value };
    this.notificationPrefsSignal.set(next);
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(next));
  }

  private applyTheme(darkMode: boolean): void {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }

  private readDarkMode(): boolean {
    return localStorage.getItem(DARK_MODE_KEY) === 'true';
  }

  private readNotificationPrefs(): NotificationPreferences {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (!raw) {
      return DEFAULT_NOTIFICATION_PREFS;
    }
    try {
      return { ...DEFAULT_NOTIFICATION_PREFS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_NOTIFICATION_PREFS;
    }
  }
}
