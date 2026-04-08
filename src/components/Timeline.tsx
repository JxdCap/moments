import { MomentCard } from './MomentCard';
import type { usePosts } from '../hooks/usePosts';
import styles from '../app/App.module.css';

type TimelineProps = {
  postsState: ReturnType<typeof usePosts>;
  isOwner: boolean;
};

export const Timeline = ({ postsState, isOwner }: TimelineProps) => {
  if (postsState.isLoading) {
    return <div className={styles.state}>正在加载朋友圈...</div>;
  }

  if (postsState.error) {
    return (
      <div className={styles.state}>
        <p>{postsState.error}</p>
        <button type="button" onClick={postsState.refresh}>
          重试
        </button>
      </div>
    );
  }

  if (postsState.posts.length === 0) {
    return <div className={styles.state}>还没有动态。</div>;
  }

  return (
    <div className={styles.timeline}>
      {postsState.posts.map((post) => (
        <MomentCard
          key={post.id}
          post={post}
          isOwner={isOwner}
          onSave={postsState.savePost}
          onDelete={postsState.removePost}
          onTogglePinned={postsState.togglePinned}
          onToggleLike={postsState.toggleLike}
        />
      ))}
    </div>
  );
};
