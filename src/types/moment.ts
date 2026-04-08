export type PostType = 'image' | 'video' | 'article' | 'music';

export type MomentMedia = {
  url: string;
  alt?: string;
};

export type MomentPost = {
  id: string;
  type: PostType;
  content: string;
  images: MomentMedia[];
  video?: string;
  videoCover?: string;
  videoDuration?: number;
  articleTitle?: string;
  articleDesc?: string;
  articleUrl?: string;
  articleCover?: string;
  articleSite?: string;
  musicTitle?: string;
  musicArtist?: string;
  musicUrl?: string;
  musicCover?: string;
  musicSource?: string;
  tags: string[];
  isPinned: boolean;
  likeCount: number;
  hasLiked: boolean;
  pinnedAt?: string;
  publishedAt: string;
  updatedAt?: string;
  source?: string;
};

export type MomentComment = {
  id: string;
  postId: string;
  name: string;
  email?: string;
  gravatarHash: string;
  website?: string;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  created: string;
};

export type CommentInput = {
  postId: string;
  name: string;
  email: string;
  website?: string;
  content: string;
};

export type LikeState = {
  postId: string;
  likeCount: number;
  hasLiked: boolean;
};

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
  like_count?: number;
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

export type OwnerSession = {
  email: string;
  token: string;
};

export type PostPatch = Partial<
  Pick<
    MomentPost,
    | 'content'
    | 'tags'
    | 'isPinned'
    | 'pinnedAt'
    | 'articleTitle'
    | 'articleDesc'
    | 'articleUrl'
    | 'articleSite'
    | 'musicTitle'
    | 'musicArtist'
    | 'musicUrl'
    | 'musicSource'
  >
>;
