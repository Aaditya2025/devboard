import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProjectStatusBadgeComponent } from '../../../shared/components/project-status-badge/project-status-badge.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    PageHeaderComponent,
    ProjectStatusBadgeComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    EmptyStateComponent,
  ],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent {
  private readonly projectService = inject(ProjectService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly projects = signal<Project[]>([]);

  constructor() {
    this.load();
  }

  navigateToNew(): void {
    this.router.navigateByUrl('/projects/new');
  }

  retry(): void {
    this.load();
  }

  archive(project: Project, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const data: ConfirmDialogData = {
      title: 'Archive project?',
      message: `"${project.name}" will be archived. You can still view it, but it will be marked as archived.`,
      confirmLabel: 'Archive',
      danger: true,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.projectService.archive(project.id).subscribe({
          next: (updated) => {
            this.projects.update((list) =>
              list.map((p) => (p.id === updated.id ? updated : p)),
            );
            this.snackBar.open(`${project.name} archived.`, undefined, { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Unable to archive project.', undefined, { duration: 3000 });
          },
        });
      });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        this.loading.set(false);
      },
      error: () => {
        this.error.set("We couldn't load your projects.");
        this.loading.set(false);
      },
    });
  }
}
