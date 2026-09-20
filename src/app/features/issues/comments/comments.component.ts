import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommentService } from '../../../core/services/comment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Comment } from '../../../core/models';
import { RelativeTimePipe } from '../../../shared/pipes/relative-time.pipe';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    RelativeTimePipe,
    LoadingSpinnerComponent,
    EmptyStateComponent,
  ],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommentsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly commentService = inject(CommentService);
  private readonly authService = inject(AuthService);

  private issueIdValue = '';
  @Input({ required: true })
  set issueId(value: string) {
    this.issueIdValue = value;
    this.load();
  }
  get issueId(): string {
    return this.issueIdValue;
  }

  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly comments = signal<Comment[]>([]);
  readonly editingCommentId = signal<string | null>(null);

  readonly currentUser = this.authService.currentUser;

  readonly form = this.fb.nonNullable.group({
    content: ['', [Validators.required]],
  });

  readonly editForm = this.fb.nonNullable.group({
    content: ['', [Validators.required]],
  });

  isOwn(comment: Comment): boolean {
    return comment.userId === this.currentUser()?.id;
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    const user = this.currentUser();
    if (!user) {
      return;
    }
    this.submitting.set(true);
    this.commentService
      .create(this.issueId, user.id, `${user.firstName} ${user.lastName}`, this.form.controls.content.value)
      .subscribe({
        next: (comment) => {
          this.comments.update((list) => [...list, comment]);
          this.form.reset({ content: '' });
          this.submitting.set(false);
        },
        error: () => {
          this.submitting.set(false);
        },
      });
  }

  startEdit(comment: Comment): void {
    this.editingCommentId.set(comment.id);
    this.editForm.setValue({ content: comment.content });
  }

  cancelEdit(): void {
    this.editingCommentId.set(null);
  }

  saveEdit(comment: Comment): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.commentService.update(comment.id, this.editForm.controls.content.value).subscribe((updated) => {
      this.comments.update((list) => list.map((c) => (c.id === updated.id ? updated : c)));
      this.editingCommentId.set(null);
    });
  }

  deleteComment(comment: Comment): void {
    this.commentService.delete(comment.id).subscribe(() => {
      this.comments.update((list) => list.filter((c) => c.id !== comment.id));
    });
  }

  private load(): void {
    this.loading.set(true);
    this.commentService.getByIssueId(this.issueId).subscribe((comments) => {
      this.comments.set(comments);
      this.loading.set(false);
    });
  }
}
