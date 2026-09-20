import { Comment } from '../models';

/** Minutes-ago offset from "now", so relative-time formatting always looks live regardless of when this app is actually run. */
function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'comment-1',
    issueId: 'issue-1',
    userId: 'user-2',
    userName: 'Rahul Verma',
    content: "I can reproduce this on staging — looks like the token refresh is racing with the logout redirect.",
    createdDate: minutesAgo(180),
  },
  {
    id: 'comment-2',
    issueId: 'issue-1',
    userId: 'user-1',
    userName: 'Aditya Sharma',
    content: 'Good catch. Pushing a fix that debounces the refresh call now.',
    createdDate: minutesAgo(90),
  },
  {
    id: 'comment-3',
    issueId: 'issue-4',
    userId: 'user-1',
    userName: 'Aditya Sharma',
    content: 'What happens if the upgrade happens on the last day of the billing cycle?',
    createdDate: minutesAgo(45),
  },
];
