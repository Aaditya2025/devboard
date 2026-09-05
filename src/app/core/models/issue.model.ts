import { IssuePriority, IssueStatus } from '../enums';

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Issue {
  id: string;
  key: string;
  title: string;
  description: string;
  projectId: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  reporterId: string;
  labels: Label[];
  sprintId: string | null;
  createdDate: string;
  updatedDate: string;
  dueDate: string | null;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  projectId: string;
  status: IssueStatus;
  priority: IssuePriority;
  assigneeId: string | null;
  labelIds: string[];
  sprintId: string | null;
  dueDate: string | null;
}

export type UpdateIssuePayload = Partial<CreateIssuePayload>;

export interface IssueFilters {
  search?: string;
  status?: IssueStatus | null;
  priority?: IssuePriority | null;
  assigneeId?: string | null;
  projectId?: string | null;
  page?: number;
  pageSize?: number;
  sortBy?: keyof Issue | null;
  sortDirection?: 'asc' | 'desc';
}
