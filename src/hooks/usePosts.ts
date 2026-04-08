import { useCallback, useEffect, useState } from 'react';
import { applyPublicLikeState, togglePublicLike } from '../services/likes';
import { deletePost, listPosts, setPostPinned, updatePost } from '../services/posts';
import type { MomentPost, PostPatch } from '../types/moment';

export const usePosts = () => {
  const [posts, setPosts] = useState<MomentPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setPosts(applyPublicLikeState(await listPosts()));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '动态加载失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const savePost = useCallback(
    async (postId: string, patch: PostPatch) => {
      await updatePost(postId, patch);
      await refresh();
    },
    [refresh],
  );

  const removePost = useCallback(
    async (postId: string) => {
      await deletePost(postId);
      await refresh();
    },
    [refresh],
  );

  const togglePinned = useCallback(
    async (post: MomentPost) => {
      await setPostPinned(post.id, !post.isPinned);
      await refresh();
    },
    [refresh],
  );

  const toggleLike = useCallback(async (post: MomentPost) => {
    const nextLike = await togglePublicLike(post);
    setPosts((current) =>
      current.map((item) =>
        item.id === nextLike.postId
          ? {
              ...item,
              likeCount: nextLike.likeCount,
              hasLiked: nextLike.hasLiked,
            }
          : item,
      ),
    );
  }, []);

  return {
    posts,
    isLoading,
    error,
    refresh,
    savePost,
    removePost,
    togglePinned,
    toggleLike,
  };
};
