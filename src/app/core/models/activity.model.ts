export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: 'ISSUE' | 'PROJECT' | 'COMMENT' | 'SPRINT';
  entityId: string;
  entityLabel: string;
  detail?: string;
  createdDate: string;
}
