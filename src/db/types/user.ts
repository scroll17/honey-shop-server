import { withSchema } from '../sql';

export const USER_TABLE = 'User';
export const $UserTable = withSchema(USER_TABLE);

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  about?: string;
  avatarId?: string;

  email: string;
  emailConfirmed: boolean;

  // auth
  failedLoginAttempts: number;
  locked: boolean;
  deleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}
