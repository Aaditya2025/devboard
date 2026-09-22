import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FormErrorComponent } from '../../shared/components/form-error/form-error.component';
import { passwordStrengthValidator, passwordsMatchValidator } from '../../shared/utils/password-validators';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    FormErrorComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  readonly currentUser = this.authService.currentUser;
  readonly initials = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '';
  });

  readonly savingProfile = signal(false);
  readonly profileError = signal<string | null>(null);

  readonly savingPassword = signal(false);
  readonly passwordError = signal<string | null>(null);
  readonly passwordSaved = signal(false);

  readonly avatarNote = signal<string | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    firstName: [this.currentUser()?.firstName ?? '', [Validators.required]],
    lastName: [this.currentUser()?.lastName ?? '', [Validators.required]],
    email: [this.currentUser()?.email ?? '', [Validators.required, Validators.email]],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: [passwordsMatchValidator('newPassword', 'confirmPassword')] },
  );

  saveProfile(): void {
    if (this.profileForm.invalid || this.savingProfile()) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.savingProfile.set(true);
    this.profileError.set(null);

    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.savingProfile.set(false);
        this.snackBar.open('Profile updated.', undefined, { duration: 3000 });
      },
      error: (error: Error) => {
        this.savingProfile.set(false);
        this.profileError.set(error.message);
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.savingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.savingPassword.set(true);
    this.passwordError.set(null);
    this.passwordSaved.set(false);

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.passwordSaved.set(true);
        this.passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
        this.snackBar.open('Password changed.', undefined, { duration: 3000 });
      },
      error: (error: Error) => {
        this.savingPassword.set(false);
        this.passwordError.set(error.message);
      },
    });
  }

  /**
   * Avatar upload isn't wired to real storage yet — no file upload backend
   * exists (Phase 11). The control is here so the UI architecture supports
   * it later without a rework: a real handler just needs to read the
   * selected File and POST it instead of showing this note.
   */
  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.avatarNote.set(`"${file.name}" selected — avatar upload isn't available yet.`);
    }
    input.value = '';
  }
}
