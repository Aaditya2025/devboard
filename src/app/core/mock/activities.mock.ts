import { Activity } from '../models';

/** Minutes-ago offset from "now", so relative-time formatting always looks live regardless of when this app is actually run. */
function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'activity-1',
    userId: 'user-1',
    userName: 'Aditya Sharma',
    action: 'changed status',
    entityType: 'ISSUE',
    entityId: 'issue-1',
    entityLabel: 'DEV-101',
    detail: 'Todo → In Progress',
    createdDate: minutesAgo(4),
  },
  {
    id: 'activity-2',
    userId: 'user-2',
    userName: 'Rahul Verma',
    action: 'added a comment',
    entityType: 'ISSUE',
    entityId: 'issue-4',
    entityLabel: 'BILL-45',
    createdDate: minutesAgo(37),
  },
  {
    id: 'activity-3',
    userId: 'user-1',
    userName: 'Aditya Sharma',
    action: 'created the issue',
    entityType: 'ISSUE',
    entityId: 'issue-8',
    entityLabel: 'DEV-104',
    createdDate: minutesAgo(95),
  },
  {
    id: 'activity-4',
    userId: 'user-3',
    userName: 'Priya Nair',
    action: 'assigned issue to',
    entityType: 'ISSUE',
    entityId: 'issue-7',
    entityLabel: 'DS-8',
    detail: 'Priya Nair',
    createdDate: minutesAgo(60 * 5),
  },
  {
    id: 'activity-5',
    userId: 'user-1',
    userName: 'Aditya Sharma',
    action: 'marked issue as done',
    entityType: 'ISSUE',
    entityId: 'issue-3',
    entityLabel: 'DEV-103',
    createdDate: minutesAgo(60 * 26),
  },
  {
    id: 'activity-6',
    userId: 'user-2',
    userName: 'Rahul Verma',
    action: 'moved issue to review',
    entityType: 'ISSUE',
    entityId: 'issue-4',
    entityLabel: 'BILL-45',
    createdDate: minutesAgo(60 * 72),
  },
];
