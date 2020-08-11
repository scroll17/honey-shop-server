import {withSchema} from "../sql";

export const BLOG_TABLE = 'Blog';
export const $BlogTable = withSchema(BLOG_TABLE);

enum BlogContent {
  TEXT = 'text',
  IMG = 'img'
}

// TODO: is feature
export interface Blog {
  id: string;
  roleId: string;

  title: string;
  text: string[];
  img: string[];
  sequence: BlogContent[];

  moderate: boolean;
  published: boolean;

  createdAt: Date;
  updatedAt: Date;
}
