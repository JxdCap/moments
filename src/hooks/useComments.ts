import { useCallback, useEffect, useState } from 'react';
import { listCommentsByPost, submitComment } from '../services/comments';
import type { CommentInput, MomentComment } from '../types/moment';

export const useComments = (postId: string) => {
  const [comments, setComments] = useState<MomentComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setComments(await listCommentsByPost(postId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '评论加载失败');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submit = useCallback(
    async (input: Omit<CommentInput, 'postId'>) => {
      const comment = await submitComment({
        ...input,
        postId,
      });
      if (comment.status === 'approved') {
        setComments((current) => (current.some((item) => item.id === comment.id) ? current : [...current, comment]));
      }
      return comment;
    },
    [postId],
  );

  return {
    comments,
    isLoading,
    error,
    submit,
  };
};
