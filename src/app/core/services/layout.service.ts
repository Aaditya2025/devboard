import { Injectable, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

const COLLAPSED_STORAGE_KEY = 'devboard.sidebar.collapsed';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly breakpointObserver = inject(BreakpointObserver);

  /** True below the tablet breakpoint — sidebar becomes an overlay drawer. */
  readonly isMobile = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  /** Desktop: whether the sidebar is collapsed to icon-only width. */
  readonly sidebarCollapsed = signal<boolean>(this.readStoredCollapsed());

  /** Mobile: whether the sidebar drawer is currently open. */
  readonly mobileDrawerOpen = signal<boolean>(false);

  toggleSidebarCollapsed(): void {
    const next = !this.sidebarCollapsed();
    this.sidebarCollapsed.set(next);
    localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
  }

  toggleMobileDrawer(): void {
    this.mobileDrawerOpen.update((open) => !open);
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }

  private readStoredCollapsed(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true';
  }
}
