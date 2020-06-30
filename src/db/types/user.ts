import {withSchema} from "../sql";

export const USER_TABLE = 'User';
export const $UserTable = withSchema(USER_TABLE)

export interface User {
  id: string;
}
