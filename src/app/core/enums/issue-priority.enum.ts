export enum IssuePriority {
  Low = 'LOW',
  Medium = 'MEDIUM',
  High = 'HIGH',
  Critical = 'CRITICAL',
}

export const ISSUE_PRIORITY_ORDER: IssuePriority[] = [
  IssuePriority.Low,
  IssuePriority.Medium,
  IssuePriority.High,
  IssuePriority.Critical,
];
