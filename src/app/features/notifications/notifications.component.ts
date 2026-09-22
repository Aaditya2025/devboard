import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationType } from '../../core/enums';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

const TYPE_ICONS: Record<NotificationType, string> = {
  [NotificationType.IssueAssigned]: 'assignment_ind',
  [NotificationType.IssueUpdated]: 'edit_note',
  [NotificationType.CommentAdded]: 'chat_bubble_outline',
  [NotificationType.IssueCompleted]: 'check_circle',
  [NotificationType.ProjectInvitation]: 'group_add',
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    RelativeTimePipe,
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  readonly notifications = this.notificationService.notifications;
  readonly loading = this.notificationService.loading;
  readonly unreadCount = this.notificationService.unreadCount;

  icon(type: NotificationType): string {
    return TYPE_ICONS[type];
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  open(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);
    if (notification.relatedEntityId && notification.type !== NotificationType.ProjectInvitation) {
      this.router.navigate(['/issues', notification.relatedEntityId]);
    } else if (notification.relatedEntityId && notification.type === NotificationType.ProjectInvitation) {
      this.router.navigate(['/projects', notification.relatedEntityId]);
    }
  }

  clear(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.clear(notification.id);
  }
}
