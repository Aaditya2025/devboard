import { UserRole } from '../enums';
import { User } from '../models';

/**
 * Mock user directory. Stands in for a `GET /users/me`-style response until
 * the real ASP.NET Core API exists (Phase 11).
 */
export const MOCK_USERS: User[] = [
  {
    id: 'user-1',
    firstName: 'Aditya',
    lastName: 'Sharma',
    email: 'admin@devboard.dev',
    role: UserRole.Admin,
    joinedDate: '2025-01-15',
  },
  {
    id: 'user-2',
    firstName: 'Rahul',
    lastName: 'Verma',
    email: 'dev@devboard.dev',
    role: UserRole.Developer,
    joinedDate: '2025-03-02',
  },
  {
    id: 'user-3',
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'viewer@devboard.dev',
    role: UserRole.Viewer,
    joinedDate: '2025-04-20',
  },
];

/**
 * Mock credential store, keyed by email. Only used by the mock AuthService —
 * a real backend would never expose plaintext passwords like this.
 */
export const MOCK_CREDENTIALS: Record<string, string> = {
  'admin@devboard.dev': 'Password123!',
  'dev@devboard.dev': 'Password123!',
  'viewer@devboard.dev': 'Password123!',
};
