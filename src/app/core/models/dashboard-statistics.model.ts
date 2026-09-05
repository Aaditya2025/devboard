import { IssuePriority, IssueStatus } from '../enums';

export interface DashboardStatistics {
  totalIssues: number;
  completedIssues: number;
  inProgressIssues: number;
  highPriorityIssues: number;
  issuesByStatus: Record<IssueStatus, number>;
  issuesByPriority: Record<IssuePriority, number>;
  projectProgress: { projectId: string; projectName: string; progress: number }[];
  completionTrend: { date: string; completed: number }[];
}
