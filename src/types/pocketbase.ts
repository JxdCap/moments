import type { MomentMedia, PostType } from './moment';

export type PostRecord = {
  id: string;
  type: PostType;
  content: string;
  images?: string[] | MomentMedia[];
  video?: string;
  video_cover?: string;
  video_duration?: number;
  article_title?: string;
  article_desc?: string;
  article_url?: string;
  article_cover?: string;
  article_site?: string;
  music_title?: string;
  music_artist?: string;
  music_url?: string;
  music_cover?: string;
  music_source?: string;
  tags?: string[];
  is_pinned?: boolean;
  pinned_at?: string;
  published_at?: string;
  updated_at?: string;
  source?: string;
  created?: string;
  updated?: string;
};

export type CommentRecord = {
  id: string;
  post: string;
  name: string;
  email?: string;
  gravatar_hash: string;
  website?: string;
  content: string;
  status?: 'pending' | 'approved' | 'spam';
  created: string;
};
