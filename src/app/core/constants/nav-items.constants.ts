import { UserRole } from '../enums';

export interface NavItem {
  label: string;
  icon: string;
  path: string;
  /** Roles allowed to see this item. Omit to show to everyone. */
  roles?: UserRole[];
}

/** Primary navigation — top group of the sidebar. */
export const PRIMARY_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { label: 'Projects', icon: 'folder', path: '/projects' },
  { label: 'Issues', icon: 'task_alt', path: '/issues' },
  { label: 'Kanban', icon: 'view_kanban', path: '/kanban' },
  { label: 'Notifications', icon: 'notifications', path: '/notifications' },
];

/** Secondary navigation — bottom group of the sidebar, below the divider. */
export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { label: 'Profile', icon: 'person', path: '/profile' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
];
