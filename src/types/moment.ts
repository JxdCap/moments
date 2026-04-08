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
