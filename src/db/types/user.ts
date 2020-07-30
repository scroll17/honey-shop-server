import { withSchema } from '../sql';

export const USER_TABLE = 'User';
export const $UserTable = withSchema(USER_TABLE);

export type UserRole = 'user' | 'vendor' | 'admin';

export interface User {
  id: string;
}
