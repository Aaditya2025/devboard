import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { LayoutService } from '../../core/services/layout.service';
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '../../core/constants/nav-items.constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatListModule,
    MatTooltipModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly layout = inject(LayoutService);

  readonly primaryItems = PRIMARY_NAV_ITEMS;
  readonly secondaryItems = SECONDARY_NAV_ITEMS;
  readonly collapsed = this.layout.sidebarCollapsed;
  readonly isMobile = this.layout.isMobile;
  /** Icon-only collapse only makes sense for the fixed desktop column, never the mobile overlay. */
  readonly effectiveCollapsed = computed(() => !this.isMobile() && this.collapsed());

  toggleCollapsed(): void {
    this.layout.toggleSidebarCollapsed();
  }

  /** Closes the mobile drawer after a nav item is picked, so it doesn't stay open. */
  onNavItemClick(): void {
    this.layout.closeMobileDrawer();
  }
}
