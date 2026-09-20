import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserRole } from '../../../core/enums';
import { ProjectMember } from '../../../core/models';
import { ProjectService } from '../../../core/services/project.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AddMemberDialogComponent } from './add-member-dialog/add-member-dialog.component';

const ROLE_OPTIONS = [UserRole.Manager, UserRole.Developer, UserRole.Viewer];

@Component({
  selector: 'app-project-members',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, LoadingSpinnerComponent, EmptyStateComponent],
  templateUrl: './project-members.component.html',
  styleUrl: './project-members.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectMembersComponent {
  private readonly projectService = inject(ProjectService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  private projectIdValue = '';
  @Input({ required: true })
  set projectId(value: string) {
    this.projectIdValue = value;
    this.load();
  }
  get projectId(): string {
    return this.projectIdValue;
  }

  readonly roleOptions = ROLE_OPTIONS;
  readonly loading = signal(true);
  readonly members = signal<ProjectMember[]>([]);

  openAddMemberDialog(): void {
    this.dialog
      .open(AddMemberDialogComponent, { data: { projectId: this.projectId } })
      .afterClosed()
      .subscribe((added) => {
        if (added) {
          this.load();
          this.snackBar.open('Member added.', undefined, { duration: 3000 });
        }
      });
  }

  changeRole(member: ProjectMember, role: UserRole): void {
    if (role === member.role) {
      return;
    }
    this.projectService.updateMemberRole(member.id, role).subscribe(() => {
      this.members.update((list) =>
        list.map((m) => (m.id === member.id ? { ...m, role } : m)),
      );
      this.snackBar.open(`${member.name}'s role updated to ${role}.`, undefined, {
        duration: 3000,
      });
    });
  }

  removeMember(member: ProjectMember): void {
    const data: ConfirmDialogData = {
      title: 'Remove member?',
      message: `${member.name} will lose access to this project.`,
      confirmLabel: 'Remove',
      danger: true,
    };

    this.dialog
      .open(ConfirmDialogComponent, { data })
      .afterClosed()
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }
        this.projectService.removeMember(member.id).subscribe(() => {
          this.members.update((list) => list.filter((m) => m.id !== member.id));
          this.snackBar.open(`${member.name} removed.`, undefined, { duration: 3000 });
        });
      });
  }

  private load(): void {
    this.loading.set(true);
    this.projectService.getMembers(this.projectId).subscribe((members) => {
      this.members.set(members);
      this.loading.set(false);
    });
  }
}
