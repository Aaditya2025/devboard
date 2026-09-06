import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly layout = inject(LayoutService);

  // Placeholder values — replaced by real AuthService / NotificationService in Phase 3 / 8.
  readonly currentUserName = signal('Aditya Sharma');
  readonly currentUserInitials = signal('AS');
  readonly unreadNotificationCount = signal(3);

  toggleMobileDrawer(): void {
    this.layout.toggleMobileDrawer();
  }

  logout(): void {
    // Phase 3 will call AuthService.logout() and redirect to /login here.
  }
}
