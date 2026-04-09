import { pb } from './pocketbase';
import { demoPosts } from './demoData';
import type { MomentMedia, MomentPost, PostPatch, PostRecord } from '../types/moment';

const getFileUrl = (record: PostRecord, value?: string) => {
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
      url: getFileUrl(record, item) ?? item,
      alt: record.content.slice(0, 30),
    };
  });
};

const mapPostRecord = (record: PostRecord): MomentPost => ({
  id: record.id,
  type: record.type,
  content: record.content,
  location: record.location,
  images: mapMedia(record),
  video: getFileUrl(record, record.video),
  videoCover: getFileUrl(record, record.video_cover),
  videoDuration: record.video_duration,
  articleTitle: record.article_title,
  articleDesc: record.article_desc,
  articleUrl: record.article_url,
  articleCover: getFileUrl(record, record.article_cover),
  articleSite: record.article_site,
  musicTitle: record.music_title,
  musicArtist: record.music_artist,
  musicUrl: record.music_url,
  musicCover: getFileUrl(record, record.music_cover),
  musicSource: record.music_source,
  tags: record.tags ?? [],
  isPinned: Boolean(record.is_pinned),
  likeCount: record.like_count ?? 0,
  hasLiked: false,
  pinnedAt: record.pinned_at,
  publishedAt: record.published_at ?? record.created ?? new Date().toISOString(),
  updatedAt: record.updated_at ?? record.updated,
  source: record.source,
});

const mapPostPatchToRecord = (patch: PostPatch) => ({
  content: patch.content,
  location: patch.location,
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

const sortPosts = (posts: MomentPost[]) =>
  [...posts].sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    const aTime = new Date(a.pinnedAt ?? a.publishedAt).getTime();
    const bTime = new Date(b.pinnedAt ?? b.publishedAt).getTime();
    return bTime - aTime;
  });

let localPosts = sortPosts(demoPosts);

export const listPosts = async () => {
  if (!pb) {
    return localPosts;
  }

  const records = await pb.collection('posts').getFullList<PostRecord>({
    sort: '-is_pinned,-pinned_at,-published_at',
  });

  return sortPosts(records.map(mapPostRecord));
};

export const updatePost = async (postId: string, patch: PostPatch) => {
  if (!pb) {
    localPosts = sortPosts(
      localPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : post,
      ),
    );
    return localPosts.find((post) => post.id === postId);
  }

  const record = await pb.collection('posts').update<PostRecord>(postId, mapPostPatchToRecord(patch));
  return mapPostRecord(record);
};

export const deletePost = async (postId: string) => {
  if (!pb) {
    localPosts = localPosts.filter((post) => post.id !== postId);
    return;
  }

  await pb.collection('posts').delete(postId);
};

export const setPostPinned = async (postId: string, nextPinned: boolean) => {
  const patch: PostPatch = {
    isPinned: nextPinned,
    pinnedAt: nextPinned ? new Date().toISOString() : '',
  };

  return updatePost(postId, patch);
};
