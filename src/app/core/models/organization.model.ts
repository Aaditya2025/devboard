import { UserRole } from '../enums';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdDate: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: UserRole;
  joinedDate: string;
}
