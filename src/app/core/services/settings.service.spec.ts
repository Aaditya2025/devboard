import { TestBed } from '@angular/core/testing';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    TestBed.configureTestingModule({});
    service = TestBed.inject(SettingsService);
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light mode with no stored preference', () => {
    expect(service.darkMode()).toBe(false);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('enables dark mode, persists it, and applies the data-theme attribute', () => {
    service.setDarkMode(true);

    expect(service.darkMode()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('devboard.settings.darkMode')).toBe('true');
  });

  it('restores a previously saved dark mode preference on construction', () => {
    localStorage.setItem('devboard.settings.darkMode', 'true');

    // Re-inject to simulate a fresh app load reading the stored preference.
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshService = TestBed.inject(SettingsService);

    expect(freshService.darkMode()).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('defaults every notification preference to true', () => {
    expect(service.notificationPreferences()).toEqual({
      email: true,
      issueAssignment: true,
      comments: true,
    });
  });

  it('updates and persists a single notification preference without affecting the others', () => {
    service.setNotificationPreference('comments', false);

    expect(service.notificationPreferences()).toEqual({
      email: true,
      issueAssignment: true,
      comments: false,
    });

    const stored = JSON.parse(localStorage.getItem('devboard.settings.notifications') ?? '{}');
    expect(stored.comments).toBe(false);
    expect(stored.email).toBe(true);
  });

  it('restores previously saved notification preferences on construction', () => {
    localStorage.setItem(
      'devboard.settings.notifications',
      JSON.stringify({ email: false, issueAssignment: true, comments: false }),
    );

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const freshService = TestBed.inject(SettingsService);

    expect(freshService.notificationPreferences()).toEqual({
      email: false,
      issueAssignment: true,
      comments: false,
    });
  });
});
