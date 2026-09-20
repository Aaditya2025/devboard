import { ChangeDetectionStrategy, Component, Inject, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { UserRole } from '../../../../core/enums';
import { ProjectService } from '../../../../core/services/project.service';

export interface AddMemberDialogData {
  projectId: string;
}

export interface AddableUser {
  id: string;
  name: string;
  email: string;
}

const ROLE_OPTIONS = [UserRole.Manager, UserRole.Developer, UserRole.Viewer];

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMemberDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly projectService = inject(ProjectService);
  private readonly dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);

  readonly roleOptions = ROLE_OPTIONS;
  readonly addableUsers = signal<AddableUser[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);

  readonly form = this.fb.nonNullable.group({
    userId: ['', [Validators.required]],
    role: [UserRole.Developer, [Validators.required]],
  });

  constructor(@Inject(MAT_DIALOG_DATA) private readonly data: AddMemberDialogData) {
    this.projectService.getAddableUsers(this.data.projectId).subscribe((users) => {
      this.addableUsers.set(users);
      this.loading.set(false);
    });
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    const { userId, role } = this.form.getRawValue();
    this.projectService.addMember(this.data.projectId, userId, role).subscribe({
      next: (member) => {
        this.submitting.set(false);
        this.dialogRef.close(member);
      },
      error: () => {
        this.submitting.set(false);
      },
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
