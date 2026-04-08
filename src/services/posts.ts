import { pb } from './pocketbase';
import { demoPosts } from './demoData';
import { mapPostPatchToRecord, mapPostRecord } from './mappers';
import type { MomentPost, PostPatch } from '../types/moment';
import type { PostRecord } from '../types/pocketbase';

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
