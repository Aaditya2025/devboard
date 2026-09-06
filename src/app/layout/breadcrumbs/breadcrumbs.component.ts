import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

export interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbsComponent {
  private readonly router = inject(Router);

  readonly crumbs = signal<Breadcrumb[]>(this.buildCrumbs());

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.crumbs.set(this.buildCrumbs()));
  }

  /**
   * Walks the fully-resolved RouterStateSnapshot (not the live ActivatedRoute tree).
   * The live tree's nested-outlet children aren't attached yet when this component
   * constructs (it renders alongside <router-outlet> inside MainLayoutComponent,
   * before that outlet's own child route activates) — the snapshot, by contrast,
   * is resolved for the whole tree up front during navigation.
   */
  private buildCrumbs(): Breadcrumb[] {
    const crumbs: Breadcrumb[] = [];
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let url = '';

    while (route) {
      const segments = route.url.map((segment) => segment.path).filter(Boolean);
      if (segments.length > 0) {
        url += `/${segments.join('/')}`;
      }
      if (route.title) {
        crumbs.push({ label: route.title.replace(/\s*—\s*DevBoard$/, ''), url });
      }
      route = route.firstChild;
    }

    return crumbs;
  }
}
