import { withSchema } from '../sql';

export const SOCIAL_MEDIA_TABLE = 'SocialMedia';
export const $SocialMediaTable = withSchema(SOCIAL_MEDIA_TABLE);

export interface SocialMedia {
  userId: string;

  facebookId?: string;
  googleId?: string;
  linkedinId?: string;
}
