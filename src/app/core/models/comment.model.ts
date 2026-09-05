export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  content: string;
  createdDate: string;
  updatedDate?: string;
}
