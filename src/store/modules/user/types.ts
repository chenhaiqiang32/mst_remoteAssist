export type RoleType = '' | '*' | 'admin' | 'user';
export interface UserState {
  name?: string;
  alias?: string;
  avatarUrl?: string;
  userId?: number | null;
}
