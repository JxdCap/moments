import { useMemo, useState } from 'react';
import { Lightbox } from './Lightbox';
import { MomentCard } from './MomentCard';
import type { usePosts } from '../hooks/usePosts';
import type { MomentMedia, MomentPost } from '../types/moment';
import { formatMomentTime } from '../utils/date';
import styles from '../app/App.module.css';

type TimelineProps = {
  postsState: ReturnType<typeof usePosts>;
  isOwner: boolean;
};

type ViewMode = 'timeline' | 'photos';

type AlbumImage = {
  image: MomentMedia;
  post: MomentPost;
  imageIndex: number;
};

const collectTags = (posts: MomentPost[]) =>
  Array.from(new Set(posts.flatMap((post) => post.tags))).sort((first, second) => first.localeCompare(second, 'zh-Hans-CN'));

const collectAlbumImages = (posts: MomentPost[]): AlbumImage[] =>
  posts.flatMap((post) => post.images.map((image, imageIndex) => ({ image, post, imageIndex })));

const TimelineControls = ({
  tags,
  activeTag,
  viewMode,
  onSelectTag,
  onClearTag,
  onChangeMode,
}: {
  tags: string[];
  activeTag: string | null;
  viewMode: ViewMode;
  onSelectTag: (tag: string) => void;
  onClearTag: () => void;
  onChangeMode: (mode: ViewMode) => void;
}) => (
  <div className={styles.timelineTools}>
    <div className={styles.modeSwitch} aria-label="浏览模式">
      <button type="button" className={viewMode === 'timeline' ? styles.activeMode : ''} onClick={() => onChangeMode('timeline')}>
        全部
      </button>
      <button type="button" className={viewMode === 'photos' ? styles.activeMode : ''} onClick={() => onChangeMode('photos')}>
        照片
      </button>
    </div>

    {tags.length > 0 ? (
      <div className={styles.tagFilter} aria-label="按标签筛选">
        <button type="button" className={!activeTag ? styles.activeTag : ''} onClick={onClearTag}>
          全部标签
        </button>
        {tags.map((tag) => (
          <button key={tag} type="button" className={activeTag === tag ? styles.activeTag : ''} onClick={() => onSelectTag(tag)}>
            #{tag}
          </button>
        ))}
      </div>
    ) : null}
  </div>
);

const AlbumView = ({ images }: { images: AlbumImage[] }) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const lightboxImages = useMemo(() => images.map((item) => item.image), [images]);

  if (images.length === 0) {
    return <div className={styles.state}>这个范围里还没有照片。</div>;
  }

  return (
    <section className={styles.album} aria-label="照片模式">
      <div className={styles.albumHeader}>
        <p>照片模式</p>
        <span>{images.length} 张</span>
      </div>
      <div className={styles.albumGrid}>
        {images.map((item, index) => (
          <button
            key={`${item.post.id}-${item.image.url}-${item.imageIndex}`}
            type="button"
            className={styles.albumItem}
            onClick={() => setPreviewIndex(index)}
            aria-label={`查看 ${formatMomentTime(item.post.publishedAt)} 的第 ${item.imageIndex + 1} 张照片`}
          >
            <img src={item.image.url} alt={item.image.alt ?? ''} loading="lazy" />
            <span>{formatMomentTime(item.post.publishedAt)}</span>
          </button>
        ))}
      </div>

      {previewIndex !== null ? (
        <Lightbox images={lightboxImages} activeIndex={previewIndex} onChange={setPreviewIndex} onClose={() => setPreviewIndex(null)} />
      ) : null}
    </section>
  );
};

export const Timeline = ({ postsState, isOwner }: TimelineProps) => {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const tags = useMemo(() => collectTags(postsState.posts), [postsState.posts]);
  const filteredPosts = useMemo(
    () => (activeTag ? postsState.posts.filter((post) => post.tags.includes(activeTag)) : postsState.posts),
    [activeTag, postsState.posts],
  );
  const albumImages = useMemo(() => collectAlbumImages(filteredPosts), [filteredPosts]);

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
    <>
      <TimelineControls
        tags={tags}
        activeTag={activeTag}
        viewMode={viewMode}
        onSelectTag={setActiveTag}
        onClearTag={() => setActiveTag(null)}
        onChangeMode={setViewMode}
      />

      {viewMode === 'photos' ? (
        <AlbumView images={albumImages} />
      ) : filteredPosts.length > 0 ? (
        <div className={styles.timeline}>
          {filteredPosts.map((post) => (
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
      ) : (
        <div className={styles.state}>这个标签下还没有动态。</div>
      )}
    </>
  );
};
