export enum IssueStatus {
  Backlog = 'BACKLOG',
  Todo = 'TODO',
  InProgress = 'IN_PROGRESS',
  InReview = 'IN_REVIEW',
  Done = 'DONE',
}

/** Ordered list of statuses, used to drive the Kanban board columns. */
export const ISSUE_STATUS_ORDER: IssueStatus[] = [
  IssueStatus.Backlog,
  IssueStatus.Todo,
  IssueStatus.InProgress,
  IssueStatus.InReview,
  IssueStatus.Done,
];
