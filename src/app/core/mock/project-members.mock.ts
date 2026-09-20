import { UserRole } from '../enums';
import { ProjectMember } from '../models';

export const MOCK_PROJECT_MEMBERS: ProjectMember[] = [
  {
    id: 'pm-1',
    projectId: 'proj-1',
    userId: 'user-1',
    name: 'Aditya Sharma',
    email: 'admin@devboard.dev',
    role: UserRole.Admin,
    joinedDate: '2025-11-01',
  },
  {
    id: 'pm-2',
    projectId: 'proj-1',
    userId: 'user-2',
    name: 'Rahul Verma',
    email: 'dev@devboard.dev',
    role: UserRole.Developer,
    joinedDate: '2025-11-05',
  },
  {
    id: 'pm-3',
    projectId: 'proj-2',
    userId: 'user-2',
    name: 'Rahul Verma',
    email: 'dev@devboard.dev',
    role: UserRole.Manager,
    joinedDate: '2025-12-01',
  },
  {
    id: 'pm-4',
    projectId: 'proj-2',
    userId: 'user-1',
    name: 'Aditya Sharma',
    email: 'admin@devboard.dev',
    role: UserRole.Developer,
    joinedDate: '2025-12-03',
  },
  {
    id: 'pm-5',
    projectId: 'proj-3',
    userId: 'user-1',
    name: 'Aditya Sharma',
    email: 'admin@devboard.dev',
    role: UserRole.Manager,
    joinedDate: '2026-01-20',
  },
  {
    id: 'pm-6',
    projectId: 'proj-4',
    userId: 'user-3',
    name: 'Priya Nair',
    email: 'viewer@devboard.dev',
    role: UserRole.Viewer,
    joinedDate: '2025-09-01',
  },
];
