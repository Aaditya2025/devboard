import { TestBed } from '@angular/core/testing';
import { LayoutService } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(LayoutService);
  });

  it('starts with the sidebar expanded and the mobile drawer closed', () => {
    expect(service.sidebarCollapsed()).toBe(false);
    expect(service.mobileDrawerOpen()).toBe(false);
  });

  it('toggles sidebarCollapsed and persists the choice', () => {
    service.toggleSidebarCollapsed();
    expect(service.sidebarCollapsed()).toBe(true);
    expect(localStorage.getItem('devboard.sidebar.collapsed')).toBe('true');

    service.toggleSidebarCollapsed();
    expect(service.sidebarCollapsed()).toBe(false);
    expect(localStorage.getItem('devboard.sidebar.collapsed')).toBe('false');
  });

  it('toggles and closes the mobile drawer', () => {
    service.toggleMobileDrawer();
    expect(service.mobileDrawerOpen()).toBe(true);

    service.closeMobileDrawer();
    expect(service.mobileDrawerOpen()).toBe(false);
  });
});
