import { ProjectStatus, UserRole } from '../enums';

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  key: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  progress: number;
  memberCount: number;
  issueCount: number;
  createdDate: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  joinedDate: string;
}

export interface CreateProjectPayload {
  name: string;
  key: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
}
