import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    NavbarComponent,
    SidebarComponent,
    BreadcrumbsComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private readonly layout = inject(LayoutService);

  readonly isMobile = this.layout.isMobile;
  readonly mobileDrawerOpen = this.layout.mobileDrawerOpen;
  readonly sidebarCollapsed = this.layout.sidebarCollapsed;

  onDrawerOpenChange(open: boolean): void {
    if (!open) {
      this.layout.closeMobileDrawer();
    }
  }
}
