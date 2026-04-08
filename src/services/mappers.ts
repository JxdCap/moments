import { pb } from './pocketbase';
import type { MomentComment, MomentMedia, MomentPost, PostPatch } from '../types/moment';
import type { CommentRecord, PostRecord } from '../types/pocketbase';

const getFileUrl = (record: PostRecord, field: keyof PostRecord, value?: string) => {
  if (!value) {
    return undefined;
  }

  if (/^https?:\/\//i.test(value) || value.startsWith('/')) {
    return value;
  }

  return pb?.files.getUrl(record, value) ?? value;
};

const mapMedia = (record: PostRecord): MomentMedia[] => {
  if (!record.images) {
    return [];
  }

  return record.images.map((item) => {
    if (typeof item !== 'string') {
      return item;
    }

    return {
      url: getFileUrl(record, 'images', item) ?? item,
      alt: record.content.slice(0, 30),
    };
  });
};

export const mapPostRecord = (record: PostRecord): MomentPost => ({
  id: record.id,
  type: record.type,
  content: record.content,
  images: mapMedia(record),
  video: getFileUrl(record, 'video', record.video),
  videoCover: getFileUrl(record, 'video_cover', record.video_cover),
  videoDuration: record.video_duration,
  articleTitle: record.article_title,
  articleDesc: record.article_desc,
  articleUrl: record.article_url,
  articleCover: getFileUrl(record, 'article_cover', record.article_cover),
  articleSite: record.article_site,
  musicTitle: record.music_title,
  musicArtist: record.music_artist,
  musicUrl: record.music_url,
  musicCover: getFileUrl(record, 'music_cover', record.music_cover),
  musicSource: record.music_source,
  tags: record.tags ?? [],
  isPinned: Boolean(record.is_pinned),
  pinnedAt: record.pinned_at,
  publishedAt: record.published_at ?? record.created ?? new Date().toISOString(),
  updatedAt: record.updated_at ?? record.updated,
  source: record.source,
});

export const mapPostPatchToRecord = (patch: PostPatch) => ({
  content: patch.content,
  tags: patch.tags,
  is_pinned: patch.isPinned,
  pinned_at: patch.pinnedAt,
  article_title: patch.articleTitle,
  article_desc: patch.articleDesc,
  article_url: patch.articleUrl,
  article_site: patch.articleSite,
  music_title: patch.musicTitle,
  music_artist: patch.musicArtist,
  music_url: patch.musicUrl,
  music_source: patch.musicSource,
  updated_at: new Date().toISOString(),
});

export const mapCommentRecord = (record: CommentRecord): MomentComment => ({
  id: record.id,
  postId: record.post,
  name: record.name,
  email: record.email,
  gravatarHash: record.gravatar_hash,
  website: record.website,
  content: record.content,
  status: record.status ?? 'approved',
  created: record.created,
});
