import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { IssuePriority, IssueStatus } from '../../../core/enums';
import { IssueService } from '../../../core/services/issue.service';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { Project, User } from '../../../core/models';
import { ALL_LABELS } from '../../../core/mock/labels.mock';
import { FormErrorComponent } from '../../../shared/components/form-error/form-error.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

const STATUS_OPTIONS = Object.values(IssueStatus);
const PRIORITY_OPTIONS = Object.values(IssuePriority);

@Component({
  selector: 'app-issue-form',
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
    MatChipsModule,
    FormErrorComponent,
    PageHeaderComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './issue-form.component.html',
  styleUrl: './issue-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly issueService = inject(IssueService);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly statusOptions = STATUS_OPTIONS;
  readonly priorityOptions = PRIORITY_OPTIONS;
  readonly allLabels = ALL_LABELS;

  readonly projects = signal<Project[]>([]);
  readonly users = signal<User[]>([]);

  private readonly issueId = this.activatedRoute.snapshot.paramMap.get('id');
  readonly isEditMode = this.issueId !== null;

  readonly loadingExisting = signal(this.isEditMode);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required]],
    description: ['', []],
    projectId: ['', [Validators.required]],
    status: [IssueStatus.Backlog, [Validators.required]],
    priority: [IssuePriority.Medium, [Validators.required]],
    assigneeId: [null as string | null],
    labelIds: [[] as string[]],
    dueDate: [null as Date | null],
  });

  constructor() {
    this.projectService.getAll().subscribe((projects) => this.projects.set(projects));
    this.userService.getAll().subscribe((users) => this.users.set(users));

    const preselectedProjectId = this.activatedRoute.snapshot.queryParamMap.get('projectId');
    if (preselectedProjectId && !this.isEditMode) {
      this.form.patchValue({ projectId: preselectedProjectId });
    }

    if (this.isEditMode && this.issueId) {
      this.issueService.getById(this.issueId).subscribe({
        next: (issue) => {
          if (!issue) {
            this.errorMessage.set('Issue not found.');
            this.loadingExisting.set(false);
            return;
          }
          this.form.patchValue({
            title: issue.title,
            description: issue.description,
            projectId: issue.projectId,
            status: issue.status,
            priority: issue.priority,
            assigneeId: issue.assigneeId,
            labelIds: issue.labels.map((l) => l.id),
            dueDate: issue.dueDate ? new Date(issue.dueDate) : null,
          });
          this.loadingExisting.set(false);
        },
        error: () => {
          this.errorMessage.set("We couldn't load this issue.");
          this.loadingExisting.set(false);
        },
      });
    }
  }

  toggleLabel(labelId: string): void {
    const current = this.form.controls.labelIds.value;
    const next = current.includes(labelId)
      ? current.filter((id) => id !== labelId)
      : [...current, labelId];
    this.form.controls.labelIds.setValue(next);
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
      title: raw.title,
      description: raw.description,
      projectId: raw.projectId,
      status: raw.status,
      priority: raw.priority,
      assigneeId: raw.assigneeId,
      labelIds: raw.labelIds,
      sprintId: null,
      dueDate: raw.dueDate ? raw.dueDate.toISOString().slice(0, 10) : null,
    };

    const request =
      this.isEditMode && this.issueId
        ? this.issueService.update(this.issueId, payload)
        : this.issueService.create(payload);

    request.subscribe({
      next: (issue) => {
        this.submitting.set(false);
        this.router.navigate(['/issues', issue.id]);
      },
      error: () => {
        this.submitting.set(false);
        this.errorMessage.set('Unable to save this issue. Please try again.');
      },
    });
  }
}
