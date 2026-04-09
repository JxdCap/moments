import { useCallback, useEffect, useState } from 'react';
import { applyPublicLikeState, togglePublicLike } from '../services/likes';
import { deletePost, listPosts, setPostPinned, updatePost } from '../services/posts';
import type { MomentPost, PostPatch } from '../types/moment';

export const usePosts = () => {
  const [posts, setPosts] = useState<MomentPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listPosts(1, 10);
      setPosts(applyPublicLikeState(result.items));
      setPage(result.page);
      setHasMore(result.page < result.totalPages);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '动态加载失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const result = await listPosts(nextPage, 10);
      setPosts((current) => {
        const newItems = result.items.filter((item) => !current.find((c) => c.id === item.id));
        return applyPublicLikeState([...current, ...newItems]);
      });
      setPage(result.page);
      setHasMore(result.page < result.totalPages);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '加载更多失败');
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore]);

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
    isLoadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    savePost,
    removePost,
    togglePinned,
    toggleLike,
  };
};
