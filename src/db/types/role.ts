import { withSchema } from '../sql';

export const ROLE_TABLE = 'Role';
export const $RoleTable = withSchema(ROLE_TABLE);

export enum UserRole {
  Buyer = 'Buyer',
  Vendor = 'Vendor',
  Admin = 'Admin',
}

export interface Role<TData = any> {
  id: string;
  name: UserRole;

  userId: string;

  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
