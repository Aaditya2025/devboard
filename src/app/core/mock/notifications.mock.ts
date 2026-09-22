import { NotificationType } from '../enums';
import { Notification } from '../models';

/** Minutes-ago offset from "now", so relative-time formatting always looks live regardless of when this app is actually run. */
function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: NotificationType.IssueAssigned,
    title: 'Issue assigned to you',
    message: 'Rahul Verma assigned DEV-101 "Login API returning 401" to you.',
    isRead: false,
    createdDate: minutesAgo(8),
    relatedEntityId: 'issue-1',
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: NotificationType.CommentAdded,
    title: 'New comment',
    message: 'Rahul Verma commented on DEV-101 "Login API returning 401".',
    isRead: false,
    createdDate: minutesAgo(35),
    relatedEntityId: 'issue-1',
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: NotificationType.IssueCompleted,
    title: 'Issue completed',
    message: 'DEV-103 "Breadcrumbs crash on nested lazy routes" was marked done.',
    isRead: false,
    createdDate: minutesAgo(120),
    relatedEntityId: 'issue-3',
  },
  {
    id: 'notif-4',
    userId: 'user-1',
    type: NotificationType.ProjectInvitation,
    title: 'Added to a project',
    message: 'You were added to Design System as a member.',
    isRead: true,
    createdDate: minutesAgo(60 * 6),
    relatedEntityId: 'proj-4',
  },
  {
    id: 'notif-5',
    userId: 'user-1',
    type: NotificationType.IssueUpdated,
    title: 'Issue updated',
    message: 'BILL-45 "Prorate plan upgrades mid-cycle" priority changed to High.',
    isRead: true,
    createdDate: minutesAgo(60 * 26),
    relatedEntityId: 'issue-4',
  },
];
