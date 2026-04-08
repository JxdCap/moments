import { useState } from 'react';
import { ArticleCard } from './ArticleCard';
import { CommentThread } from './CommentThread';
import { EditPostDialog } from './EditPostDialog';
import { MediaGrid } from './MediaGrid';
import { MusicCard } from './MusicCard';
import { VideoBlock } from './VideoBlock';
import type { MomentPost, PostPatch } from '../types/moment';
import { formatMomentTime } from '../utils/date';
import styles from './MomentCard.module.css';

type MomentCardProps = {
  post: MomentPost;
  isOwner: boolean;
  onSave: (postId: string, patch: PostPatch) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onTogglePinned: (post: MomentPost) => Promise<void>;
};

export const MomentCard = ({ post, isOwner, onSave, onDelete, onTogglePinned }: MomentCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('确定删除这条动态吗？')) {
      return;
    }

    setIsBusy(true);
    await onDelete(post.id);
    setIsBusy(false);
  };

  const handleTogglePinned = async () => {
    setIsBusy(true);
    await onTogglePinned(post);
    setIsBusy(false);
  };

  return (
    <article className={styles.card}>
      <div className={styles.authorAvatar} aria-hidden="true">
        站
      </div>
      <div className={styles.body}>
        <div className={styles.topLine}>
          <h2 className={styles.author}>站长</h2>
          {post.isPinned ? <span className={styles.pinned}>置顶</span> : null}
        </div>

        <p className={styles.content}>{post.content}</p>

        {post.type === 'image' ? <MediaGrid images={post.images} /> : null}
        {post.type === 'video' ? <VideoBlock post={post} /> : null}
        {post.type === 'article' ? <ArticleCard post={post} /> : null}
        {post.type === 'music' ? <MusicCard post={post} /> : null}

        {post.tags.length > 0 ? (
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        ) : null}

        <footer className={styles.meta}>
          <span>{formatMomentTime(post.publishedAt)}</span>
          {post.source ? <span>来自 {post.source}</span> : null}
        </footer>

        {isOwner ? (
          <div className={styles.ownerActions}>
            <button type="button" onClick={() => setIsEditing(true)} disabled={isBusy}>
              编辑
            </button>
            <button type="button" onClick={handleTogglePinned} disabled={isBusy}>
              {post.isPinned ? '取消置顶' : '置顶'}
            </button>
            <button type="button" onClick={handleDelete} disabled={isBusy}>
              删除
            </button>
          </div>
        ) : null}

        <CommentThread postId={post.id} />
      </div>

      {isEditing ? (
        <EditPostDialog
          post={post}
          onClose={() => setIsEditing(false)}
          onSave={async (patch) => {
            await onSave(post.id, patch);
            setIsEditing(false);
          }}
        />
      ) : null}
    </article>
  );
};
