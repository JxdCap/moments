import { isPocketBaseEnabled } from './pocketbase';
import type { LikeState, MomentPost } from '../types/moment';

const likedStorageKey = 'moments.public-liked-posts';
const countStorageKey = 'moments.public-like-counts';

const readLikedPostIds = () => {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(likedStorageKey) ?? '[]'));
  } catch {
    return new Set<string>();
  }
};

const readLocalCounts = () => {
  try {
    return JSON.parse(localStorage.getItem(countStorageKey) ?? '{}') as Record<string, number>;
  } catch {
    return {};
  }
};

const persistLikeState = (likedPostIds: Set<string>, localCounts: Record<string, number>) => {
  localStorage.setItem(likedStorageKey, JSON.stringify([...likedPostIds]));
  localStorage.setItem(countStorageKey, JSON.stringify(localCounts));
};

export const applyPublicLikeState = (posts: MomentPost[]) => {
  const likedPostIds = readLikedPostIds();
  const localCounts = readLocalCounts();

  return posts.map((post) => ({
    ...post,
    likeCount: localCounts[post.id] ?? post.likeCount,
    hasLiked: likedPostIds.has(post.id),
  }));
};

export const togglePublicLike = async (post: MomentPost): Promise<LikeState> => {
  const likedPostIds = readLikedPostIds();
  const localCounts = readLocalCounts();
  const hasLiked = likedPostIds.has(post.id);
  const nextLiked = !hasLiked;
  const currentCount = localCounts[post.id] ?? post.likeCount;
  const nextCount = Math.max(0, currentCount + (nextLiked ? 1 : -1));

  if (nextLiked) {
    likedPostIds.add(post.id);
  } else {
    likedPostIds.delete(post.id);
  }

  localCounts[post.id] = nextCount;
  persistLikeState(likedPostIds, localCounts);

  if (isPocketBaseEnabled) {
    // PocketBase 接入位：后续可替换为 likes collection upsert，或 posts.like_count 的受控 RPC/云函数。
    // 当前公开点赞仍使用本地轻量状态，避免把匿名写规则和反刷逻辑硬塞进前端。
  }

  return {
    postId: post.id,
    likeCount: nextCount,
    hasLiked: nextLiked,
  };
};
