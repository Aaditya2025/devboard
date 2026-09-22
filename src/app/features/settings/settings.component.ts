import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { NotificationPreferences, SettingsService } from '../../core/services/settings.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, MatSlideToggleModule, MatButtonModule, MatIconModule, PageHeaderComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly settingsService = inject(SettingsService);
  private readonly authService = inject(AuthService);

  readonly currentUser = this.authService.currentUser;
  readonly darkMode = this.settingsService.darkMode;
  readonly notificationPreferences = this.settingsService.notificationPreferences;

  readonly securityNote = signal<string | null>(null);

  toggleDarkMode(enabled: boolean): void {
    this.settingsService.setDarkMode(enabled);
  }

  toggleNotificationPreference(key: keyof NotificationPreferences, enabled: boolean): void {
    this.settingsService.setNotificationPreference(key, enabled);
  }

  /**
   * "Sign out of all devices" needs a backend session store to actually do
   * anything (there's nothing here to revoke beyond this browser's own
   * token). Surfaces that plainly instead of pretending to do something it
   * can't yet — same pattern as login's forgot-password stub.
   */
  signOutAllDevices(): void {
    this.securityNote.set("Signing out of other devices isn't available yet.");
  }
}
