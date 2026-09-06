import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { SidebarComponent } from './sidebar.component';
import { PRIMARY_NAV_ITEMS, SECONDARY_NAV_ITEMS } from '../../core/constants/nav-items.constants';

describe('SidebarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([{ path: '**', component: SidebarComponent }])],
    }).compileComponents();
  });

  it('should create', async () => {
    const harness = await RouterTestingHarness.create();
    const sidebar = await harness.navigateByUrl('/', SidebarComponent);
    expect(sidebar).toBeTruthy();
  });

  it('renders a link for every primary and secondary nav item', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/', SidebarComponent);
    harness.detectChanges();

    const links = harness.routeNativeElement?.querySelectorAll('a[mat-list-item]');
    const expectedCount = PRIMARY_NAV_ITEMS.length + SECONDARY_NAV_ITEMS.length;
    expect(links?.length).toBe(expectedCount);
  });

  it('starts expanded (not collapsed)', async () => {
    const harness = await RouterTestingHarness.create();
    const sidebar = await harness.navigateByUrl('/', SidebarComponent);
    expect(sidebar.collapsed()).toBe(false);
  });
});
