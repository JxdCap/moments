import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, ListFilter, X } from 'lucide-react';
import { Lightbox } from './Lightbox';
import { MomentCard } from './MomentCard';
import type { usePosts } from '../hooks/usePosts';
import type { MomentMedia, MomentPost } from '../types/moment';
import {
  loadFavoritePostIds,
  loadTimelinePreferences,
  saveFavoritePostIds,
  saveTimelinePreferences,
  type TimelineViewMode,
} from '../utils/timelineStorage';
import { formatDuration, formatMomentTime } from '../utils/date';
import styles from '../app/App.module.css';

type TimelineProps = {
  postsState: ReturnType<typeof usePosts>;
  isOwner: boolean;
};

type AlbumImage = {
  image: MomentMedia;
  post: MomentPost;
  imageIndex: number;
};

type ViewTransitionDirection = 'forward' | 'backward';

const collectTags = (posts: MomentPost[]) =>
  Array.from(new Set(posts.flatMap((post) => post.tags))).sort((first, second) => first.localeCompare(second, 'zh-Hans-CN'));

const collectAlbumImages = (posts: MomentPost[]): AlbumImage[] =>
  posts.flatMap((post) => post.images.map((image, imageIndex) => ({ image, post, imageIndex })));

const getArchiveMonth = (publishedAt: string) => publishedAt.slice(0, 7);

const collectArchiveMonths = (posts: MomentPost[]) =>
  Array.from(new Set(posts.map((post) => getArchiveMonth(post.publishedAt)))).sort((first, second) => second.localeCompare(first));

const TimelineControls = ({
  tags,
  activeTag,
  viewMode,
  archiveMonths,
  activeMonth,
  favoritesOnly,
  favoriteCount,
  onSelectTag,
  onClearTag,
  onChangeMode,
  onSelectMonth,
  onClearMonth,
  onToggleFavoritesOnly,
}: {
  tags: string[];
  activeTag: string | null;
  viewMode: TimelineViewMode;
  archiveMonths: string[];
  activeMonth: string | null;
  favoritesOnly: boolean;
  favoriteCount: number;
  onSelectTag: (tag: string) => void;
  onClearTag: () => void;
  onChangeMode: (mode: TimelineViewMode) => void;
  onSelectMonth: (month: string) => void;
  onClearMonth: () => void;
  onToggleFavoritesOnly: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeFilterCount = Number(favoritesOnly) + Number(Boolean(activeMonth)) + Number(Boolean(activeTag));
  const modeTabsClassName = `${styles.modeTabs} ${
    viewMode === 'timeline' ? styles.modeTabsTimeline : viewMode === 'photos' ? styles.modeTabsPhotos : styles.modeTabsVideos
  }`;

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  const handleSelectTag = (tag: string) => {
    onSelectTag(tag);
    setIsExpanded(false);
  };

  const handleClearTag = () => {
    onClearTag();
    setIsExpanded(false);
  };

  const handleSelectMonth = (month: string) => {
    onSelectMonth(month);
    setIsExpanded(false);
  };

  const handleClearMonth = () => {
    onClearMonth();
    setIsExpanded(false);
  };

  const handleToggleFavorites = () => {
    onToggleFavoritesOnly();
    setIsExpanded(false);
  };

  return (
    <div className={styles.timelineTools}>
      <div className={styles.toolRow}>
        <div className={modeTabsClassName} aria-label="浏览模式">
          <button type="button" className={viewMode === 'timeline' ? styles.activeMode : ''} onClick={() => onChangeMode('timeline')}>
            全部
          </button>
          <button type="button" className={viewMode === 'photos' ? styles.activeMode : ''} onClick={() => onChangeMode('photos')}>
            照片
          </button>
          <button type="button" className={viewMode === 'videos' ? styles.activeMode : ''} onClick={() => onChangeMode('videos')}>
            视频
          </button>
          <span className={styles.modeIndicator} aria-hidden="true" />
        </div>

        <button
          type="button"
          className={`${styles.filterTrigger} ${activeFilterCount > 0 ? styles.activeTrigger : ''}`}
          onClick={() => setIsExpanded((current) => !current)}
          aria-expanded={isExpanded}
        >
          <div className={styles.filterIconWrap}>
            <ListFilter size={18} strokeWidth={1.5} />
            {activeFilterCount > 0 ? <span className={styles.filterDot} /> : null}
          </div>
        </button>
      </div>

      {isExpanded ? (
        <>
          <button type="button" className={styles.filterBackdrop} onClick={() => setIsExpanded(false)} aria-label="关闭筛选层" />
          <div id="timeline-filter-panel" className={styles.filterPanel}>
            <div className={styles.filterPanelHeader}>
              <span className={styles.filterPanelTitle}>筛选</span>
              <button type="button" className={styles.filterClose} onClick={() => setIsExpanded(false)} aria-label="关闭筛选层">
                <X size={16} strokeWidth={1.8} />
              </button>
            </div>
            <div className={styles.filterSection}>
              <span className={styles.filterLabel}>类型</span>
              <div className={styles.filterOptions}>
                <button
                  type="button"
                  className={`${styles.filterChip} ${favoritesOnly ? styles.activeChip : ''}`}
                  onClick={handleToggleFavorites}
                >
                  仅收藏
                </button>
              </div>
            </div>

            {archiveMonths.length > 0 && (
              <div className={styles.filterSection}>
                <span className={styles.filterLabel}>月份</span>
                <div className={styles.filterOptions}>
                  <button type="button" className={`${styles.filterChip} ${!activeMonth ? styles.activeChip : ''}`} onClick={handleClearMonth}>
                    全部
                  </button>
                  {archiveMonths.map((month) => (
                    <button key={month} type="button" className={`${styles.filterChip} ${activeMonth === month ? styles.activeChip : ''}`} onClick={() => handleSelectMonth(month)}>
                      {month}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tags.length > 0 && (
              <div className={styles.filterSection}>
                <span className={styles.filterLabel}>标签</span>
                <div className={styles.filterOptions}>
                  <button type="button" className={`${styles.filterChip} ${!activeTag ? styles.activeChip : ''}`} onClick={handleClearTag}>
                    全部
                  </button>
                  {tags.map((tag) => (
                    <button key={tag} type="button" className={`${styles.filterChip} ${activeTag === tag ? styles.activeChip : ''}`} onClick={() => handleSelectTag(tag)}>
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

const AlbumView = ({ images }: { images: AlbumImage[] }) => {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const lightboxImages = useMemo(() => images.map((item) => item.image), [images]);

  if (images.length === 0) {
    return <div className={styles.state}>这个范围里还没有留下照片。</div>;
  }

  // 简单的两列瀑布流分配
  const column1: AlbumImage[] = [];
  const column2: AlbumImage[] = [];
  images.forEach((item, index) => {
    if (index % 2 === 0) column1.push(item);
    else column2.push(item);
  });

  return (
    <section className={styles.album} aria-label="照片画廊">
      <div className={styles.masonryGrid}>
        <div className={styles.masonryColumn}>
          {column1.map((item) => {
            const originalIndex = images.indexOf(item);
            return (
              <button
                key={`${item.post.id}-${item.image.url}-${item.imageIndex}`}
                type="button"
                className={styles.masonryItem}
                onClick={() => setPreviewIndex(originalIndex)}
                aria-label={`查看 ${formatMomentTime(item.post.publishedAt)} 的照片`}
              >
                <img src={item.image.thumbUrl || item.image.url} alt={item.image.alt ?? ''} loading="lazy" />
                <div className={styles.masonryOverlay}>
                  <span>{formatMomentTime(item.post.publishedAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className={styles.masonryColumn}>
          {column2.map((item) => {
            const originalIndex = images.indexOf(item);
            return (
              <button
                key={`${item.post.id}-${item.image.url}-${item.imageIndex}`}
                type="button"
                className={styles.masonryItem}
                onClick={() => setPreviewIndex(originalIndex)}
                aria-label={`查看 ${formatMomentTime(item.post.publishedAt)} 的照片`}
              >
                <img src={item.image.thumbUrl || item.image.url} alt={item.image.alt ?? ''} loading="lazy" />
                <div className={styles.masonryOverlay}>
                  <span>{formatMomentTime(item.post.publishedAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {previewIndex !== null ? (
        <Lightbox images={lightboxImages} activeIndex={previewIndex} onChange={setPreviewIndex} onClose={() => setPreviewIndex(null)} />
      ) : null}
    </section>
  );
};

const VideoView = ({
  posts,
}: {
  posts: MomentPost[];
}) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  if (posts.length === 0) {
    return <div className={styles.state}>这个范围里还没有留下视频。</div>;
  }

  return (
    <section className={styles.videoMode} aria-label="电影流模式">
      <div className={styles.cinematicFeed}>
        {posts.map((post) => {
          const isPlaying = activeVideoId === post.id;

          return (
            <article key={post.id} className={styles.cinematicCard}>
              <div className={styles.cinematicMedia}>
                {isPlaying && post.video ? (
                  <video className={styles.cinematicPlayer} src={post.video} controls autoPlay poster={post.videoCover}>
                    当前浏览器不支持视频播放。
                  </video>
                ) : (
                  <button type="button" className={styles.cinematicPreview} onClick={() => setActiveVideoId(post.id)}>
                    {post.videoCover ? <img src={post.videoCover} alt="" loading="lazy" /> : null}
                    <span className={styles.cinematicPlay}><Play size={48} fill="currentColor" strokeWidth={1} /></span>
                    {post.videoDuration ? <span className={styles.cinematicDuration}>{formatDuration(post.videoDuration)}</span> : null}
                  </button>
                )}
              </div>

              <div className={styles.cinematicBody}>
                <div className={styles.cinematicTop}>
                  <div className={styles.cinematicAuthorWrap}>
                    <h2 className={styles.cinematicAuthor}>枫叶</h2>
                    <span className={styles.cinematicTimestamp}>· {formatMomentTime(post.publishedAt)}</span>
                  </div>
                  {post.location ? <span className={styles.cinematicLocation}>{post.location}</span> : null}
                </div>
                {post.content ? <p className={styles.cinematicContent}>{post.content}</p> : null}
                {post.tags.length > 0 ? (
                  <div className={styles.cinematicTags}>
                    {post.tags.map((tag) => (
                      <span key={tag} className={styles.cinematicTag}>#{tag}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const Timeline = ({ postsState, isOwner }: TimelineProps) => {
  const viewModeOrder: Record<TimelineViewMode, number> = {
    timeline: 0,
    photos: 1,
    videos: 2,
  };
  const initialPreferences = useMemo(() => loadTimelinePreferences(), []);
  const [activeTag, setActiveTag] = useState<string | null>(initialPreferences.activeTag);
  const [activeMonth, setActiveMonth] = useState<string | null>(initialPreferences.activeMonth);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<TimelineViewMode>(initialPreferences.viewMode);
  const [exitingViewMode, setExitingViewMode] = useState<TimelineViewMode | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<ViewTransitionDirection>('forward');
  const [favoritePostIds, setFavoritePostIds] = useState<Set<string>>(() => new Set(loadFavoritePostIds()));
  const tags = useMemo(() => collectTags(postsState.posts), [postsState.posts]);
  const archiveMonths = useMemo(() => collectArchiveMonths(postsState.posts), [postsState.posts]);
  const favoriteCount = useMemo(
    () => postsState.posts.filter((post) => favoritePostIds.has(post.id)).length,
    [favoritePostIds, postsState.posts],
  );
  const filteredPosts = useMemo(
    () =>
      postsState.posts.filter((post) => {
        if (favoritesOnly && !favoritePostIds.has(post.id)) {
          return false;
        }

        if (activeTag && !post.tags.includes(activeTag)) {
          return false;
        }

        if (activeMonth && getArchiveMonth(post.publishedAt) !== activeMonth) {
          return false;
        }

        return true;
      }),
    [activeMonth, activeTag, favoritePostIds, favoritesOnly, postsState.posts],
  );
  const albumImages = useMemo(() => collectAlbumImages(filteredPosts), [filteredPosts]);
  const videoPosts = useMemo(() => filteredPosts.filter((post) => post.type === 'video'), [filteredPosts]);

  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && postsState.hasMore && !postsState.isLoadingMore) {
          postsState.loadMore();
        }
      },
      { rootMargin: '100px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [postsState.hasMore, postsState.isLoadingMore, postsState.loadMore]);

  useEffect(() => {
    saveTimelinePreferences({ viewMode, activeTag, activeMonth });
  }, [activeMonth, activeTag, viewMode]);

  useEffect(() => {
    if (activeTag && !tags.includes(activeTag)) {
      setActiveTag(null);
    }
  }, [activeTag, tags]);

  useEffect(() => {
    if (activeMonth && !archiveMonths.includes(activeMonth)) {
      setActiveMonth(null);
    }
  }, [activeMonth, archiveMonths]);

  useEffect(() => {
    if (favoriteCount > 0 || !favoritesOnly) {
      return;
    }

    setFavoritesOnly(false);
  }, [favoriteCount, favoritesOnly]);

  useEffect(() => {
    if (!exitingViewMode) {
      return;
    }

    const timeout = window.setTimeout(() => setExitingViewMode(null), 300);
    return () => window.clearTimeout(timeout);
  }, [exitingViewMode, viewMode]);

  const handleToggleFavorite = (postId: string) => {
    setFavoritePostIds((current) => {
      const next = new Set(current);

      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }

      saveFavoritePostIds(next);
      return next;
    });
  };

  const handleChangeMode = (nextMode: TimelineViewMode) => {
    if (nextMode === viewMode) {
      return;
    }

    setTransitionDirection(viewModeOrder[nextMode] > viewModeOrder[viewMode] ? 'forward' : 'backward');
    setExitingViewMode(viewMode);
    setViewMode(nextMode);
  };

  const renderView = (mode: TimelineViewMode) => {
    if (mode === 'photos') {
      return <AlbumView images={albumImages} />;
    }

    if (mode === 'videos') {
      return <VideoView posts={videoPosts} />;
    }

    if (filteredPosts.length > 0) {
      return (
        <div className={styles.timeline}>
          {filteredPosts.map((post) => (
            <MomentCard
              key={post.id}
              post={post}
              isOwner={isOwner}
              isFavorited={favoritePostIds.has(post.id)}
              onSave={postsState.savePost}
              onDelete={postsState.removePost}
              onTogglePinned={postsState.togglePinned}
              onToggleLike={postsState.toggleLike}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      );
    }

    return <div className={styles.state}>{emptyMessage}</div>;
  };

  const emptyMessage = favoritesOnly ? '收藏夹里暂时还没有这一段记录。' : '这一段筛选里还没有新的记录。';

  if (postsState.isLoading) {
    return <div className={styles.state}>正在整理这段时间的记录...</div>;
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
    return <div className={styles.state}>这里还没有留下记录。</div>;
  }

  return (
    <>
      <TimelineControls
        tags={tags}
        activeTag={activeTag}
        viewMode={viewMode}
        archiveMonths={archiveMonths}
        activeMonth={activeMonth}
        favoritesOnly={favoritesOnly}
        favoriteCount={favoriteCount}
        onSelectTag={setActiveTag}
        onClearTag={() => setActiveTag(null)}
        onChangeMode={handleChangeMode}
        onSelectMonth={setActiveMonth}
        onClearMonth={() => setActiveMonth(null)}
        onToggleFavoritesOnly={() => setFavoritesOnly((current) => !current)}
      />

      <div className={styles.contentViewport}>
        {exitingViewMode ? (
          <div
            className={`${styles.contentPane} ${
              transitionDirection === 'forward' ? styles.paneExitForward : styles.paneExitBackward
            }`}
          >
            {renderView(exitingViewMode)}
          </div>
        ) : null}

        <div
          className={`${styles.contentPane} ${
            exitingViewMode
              ? transitionDirection === 'forward'
                ? styles.paneEnterForward
                : styles.paneEnterBackward
              : styles.paneActive
          }`}
        >
          {renderView(viewMode)}
        </div>
      </div>

      {postsState.hasMore ? (
        <div ref={observerRef} className={styles.loadMoreTarget}>
          {postsState.isLoadingMore ? (
            <span className={styles.loadingDots}>
              <span />
              <span />
              <span />
            </span>
          ) : null}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className={styles.endIndicator}>
          <span className={styles.endDot} />
        </div>
      ) : null}
    </>
  );
};
