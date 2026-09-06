import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Component } from '@angular/core';
import { BreadcrumbsComponent } from './breadcrumbs.component';

// Mirrors the real shape: a parent route with no title wrapping a lazily
// "nested" child route that does have a title, activated in the same
// navigation as BreadcrumbsComponent itself — the scenario that used to
// throw "Cannot read properties of undefined (reading 'url')".
@Component({ standalone: true, template: '<app-breadcrumbs />', imports: [BreadcrumbsComponent] })
class HostComponent {}

@Component({ standalone: true, template: '' })
class LeafComponent {}

describe('BreadcrumbsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        provideRouter([
          {
            path: 'dashboard',
            component: HostComponent,
            children: [{ path: '', component: LeafComponent, title: 'Dashboard — DevBoard' }],
          },
        ]),
      ],
    }).compileComponents();
  });

  it('does not throw when constructed alongside a route whose nested child has not attached yet', async () => {
    const harness = await RouterTestingHarness.create();
    await expectAsync(harness.navigateByUrl('/dashboard', HostComponent)).toBeResolved();
  });

  it('resolves the leaf route title into the crumbs signal', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/dashboard', HostComponent);

    const breadcrumbs = harness.routeDebugElement?.query(
      (debugEl) => debugEl.componentInstance instanceof BreadcrumbsComponent,
    )?.componentInstance as BreadcrumbsComponent;

    expect(breadcrumbs.crumbs().map((c) => c.label)).toEqual(['Dashboard']);
  });
});
