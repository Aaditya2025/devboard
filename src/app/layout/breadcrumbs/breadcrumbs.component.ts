import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, UrlSegment } from '@angular/router';
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
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly crumbs = signal<Breadcrumb[]>(this.buildCrumbs());

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.crumbs.set(this.buildCrumbs()));
  }

  private buildCrumbs(): Breadcrumb[] {
    const crumbs: Breadcrumb[] = [];
    let route: ActivatedRoute | null = this.activatedRoute.root;
    let url = '';

    while (route) {
      const child: ActivatedRoute | null = route.children[0] ?? null;
      if (child) {
        const segments = child.snapshot.url.map((segment: UrlSegment) => segment.path).filter(Boolean);
        if (segments.length > 0) {
          url += `/${segments.join('/')}`;
        }
        const title = child.snapshot.title;
        if (title) {
          crumbs.push({ label: title.replace(/\s*—\s*DevBoard$/, ''), url });
        }
      }
      route = child;
    }

    return crumbs;
  }
}
