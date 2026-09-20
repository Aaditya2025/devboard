import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProjectStatus } from '../../../core/enums';
import { ProjectService } from '../../../core/services/project.service';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { projectKeyValidator, dateRangeValidator } from '../../../shared/utils/project-validators';

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: ProjectStatus.Planning, label: 'Planning' },
  { value: ProjectStatus.Active, label: 'Active' },
  { value: ProjectStatus.OnHold, label: 'On Hold' },
  { value: ProjectStatus.Completed, label: 'Completed' },
  { value: ProjectStatus.Archived, label: 'Archived' },
];

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormErrorComponent,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly statusOptions = STATUS_OPTIONS;

  private readonly projectId = this.activatedRoute.snapshot.paramMap.get('id');
  readonly isEditMode = this.projectId !== null;

  readonly loadingExisting = signal(this.isEditMode);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      name: ['', [Validators.required]],
      key: ['', [Validators.required, projectKeyValidator()]],
      description: ['', [Validators.maxLength(500)]],
      startDate: [null as Date | null, [Validators.required]],
      endDate: [null as Date | null, [Validators.required]],
      status: [ProjectStatus.Planning, [Validators.required]],
    },
    { validators: [dateRangeValidator()] },
  );

  constructor() {
    if (this.isEditMode && this.projectId) {
      this.projectService.getById(this.projectId).subscribe({
        next: (project) => {
          if (!project) {
            this.errorMessage.set('Project not found.');
            this.loadingExisting.set(false);
            return;
          }
          this.form.patchValue({
            name: project.name,
            key: project.key,
            description: project.description,
            startDate: new Date(project.startDate),
            endDate: new Date(project.endDate),
            status: project.status,
          });
          this.loadingExisting.set(false);
        },
        error: () => {
          this.errorMessage.set("We couldn't load this project.");
          this.loadingExisting.set(false);
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name,
      key: raw.key.toUpperCase(),
      description: raw.description,
      startDate: this.toIsoDate(raw.startDate),
      endDate: this.toIsoDate(raw.endDate),
      status: raw.status,
    };

    const request =
      this.isEditMode && this.projectId
        ? this.projectService.update(this.projectId, payload)
        : this.projectService.create(payload);

    request.subscribe({
      next: (project) => {
        this.submitting.set(false);
        this.router.navigate(['/projects', project.id]);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Unable to save this project. Please try again.');
      },
    });
  }

  private toIsoDate(value: Date | null): string {
    return value ? value.toISOString().slice(0, 10) : '';
  }
}
