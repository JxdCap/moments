import { useEffect, useMemo, useState } from 'react';
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
}) => (
  <div className={styles.timelineTools}>
    <div className={styles.toolRow}>
      <div className={styles.modeSwitch} aria-label="浏览模式">
        <button type="button" className={viewMode === 'timeline' ? styles.activeMode : ''} onClick={() => onChangeMode('timeline')}>
          全部
        </button>
        <button type="button" className={viewMode === 'photos' ? styles.activeMode : ''} onClick={() => onChangeMode('photos')}>
          照片
        </button>
        <button type="button" className={viewMode === 'videos' ? styles.activeMode : ''} onClick={() => onChangeMode('videos')}>
          视频
        </button>
      </div>

      <button
        type="button"
        className={`${styles.utilityButton} ${favoritesOnly ? styles.activeUtility : ''}`}
        onClick={onToggleFavoritesOnly}
        aria-pressed={favoritesOnly}
      >
        {favoritesOnly ? '查看全部' : '仅收藏'}
        {favoriteCount > 0 ? <span>{favoriteCount}</span> : null}
      </button>
    </div>

    {archiveMonths.length > 0 ? (
      <div className={styles.archiveFilter} aria-label="按月份归档筛选">
        <button type="button" className={!activeMonth ? styles.activeTag : ''} onClick={onClearMonth}>
          全部月份
        </button>
        {archiveMonths.map((month) => (
          <button
            key={month}
            type="button"
            className={activeMonth === month ? styles.activeTag : ''}
            onClick={() => onSelectMonth(month)}
          >
            {month}
          </button>
        ))}
      </div>
    ) : null}

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

const VideoView = ({ posts }: { posts: MomentPost[] }) => {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const heroPost = posts[0];
  const listPosts = posts.slice(1);

  if (!heroPost) {
    return <div className={styles.state}>这个范围里还没有视频。</div>;
  }

  return (
    <section className={styles.videoMode} aria-label="视频模式">
      <header className={styles.videoHero}>
        <div className={styles.videoHeroCopy}>
          <p className={styles.videoHeroEyebrow}>视频</p>
          <h2>把会动的片段单独留出来</h2>
          <span>{posts.length} 条视频动态</span>
        </div>

        <div className={styles.videoHeroMedia}>
          {activeVideoId === heroPost.id && heroPost.video ? (
            <video className={styles.videoHeroPlayer} src={heroPost.video} controls autoPlay poster={heroPost.videoCover}>
              当前浏览器不支持视频播放。
            </video>
          ) : (
            <button type="button" className={styles.videoHeroPreview} onClick={() => setActiveVideoId(heroPost.id)}>
              {heroPost.videoCover ? <img src={heroPost.videoCover} alt="" loading="lazy" /> : null}
              <span className={styles.videoHeroPlay}>播放视频</span>
              {heroPost.videoDuration ? <span className={styles.videoHeroDuration}>{formatDuration(heroPost.videoDuration)}</span> : null}
            </button>
          )}
        </div>
      </header>

      {listPosts.length > 0 ? (
        <div className={styles.videoList}>
          {listPosts.map((post) => {
            const isPlaying = activeVideoId === post.id;

            return (
              <article key={post.id} className={styles.videoCard}>
                <div className={styles.videoCardMedia}>
                  {isPlaying && post.video ? (
                    <video className={styles.videoCardPlayer} src={post.video} controls autoPlay poster={post.videoCover}>
                      当前浏览器不支持视频播放。
                    </video>
                  ) : (
                    <button type="button" className={styles.videoCardPreview} onClick={() => setActiveVideoId(post.id)}>
                      {post.videoCover ? <img src={post.videoCover} alt="" loading="lazy" /> : null}
                      <span className={styles.videoCardPlay}>播放</span>
                      {post.videoDuration ? <span className={styles.videoCardDuration}>{formatDuration(post.videoDuration)}</span> : null}
                    </button>
                  )}
                </div>

                <div className={styles.videoCardBody}>
                  {post.content ? <p className={styles.videoCardContent}>{post.content}</p> : null}
                  <div className={styles.videoCardMeta}>
                    <span>{formatMomentTime(post.publishedAt)}</span>
                    {post.location ? <span>{post.location}</span> : null}
                  </div>
                  {post.tags.length > 0 ? (
                    <div className={styles.videoCardTags}>
                      {post.tags.map((tag) => (
                        <span key={tag}>#{tag}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export const Timeline = ({ postsState, isOwner }: TimelineProps) => {
  const initialPreferences = useMemo(() => loadTimelinePreferences(), []);
  const [activeTag, setActiveTag] = useState<string | null>(initialPreferences.activeTag);
  const [activeMonth, setActiveMonth] = useState<string | null>(initialPreferences.activeMonth);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [viewMode, setViewMode] = useState<TimelineViewMode>(initialPreferences.viewMode);
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

  const emptyMessage = favoritesOnly ? '收藏夹里还没有这个范围的动态。' : '这个筛选范围里还没有动态。';

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
        archiveMonths={archiveMonths}
        activeMonth={activeMonth}
        favoritesOnly={favoritesOnly}
        favoriteCount={favoriteCount}
        onSelectTag={setActiveTag}
        onClearTag={() => setActiveTag(null)}
        onChangeMode={setViewMode}
        onSelectMonth={setActiveMonth}
        onClearMonth={() => setActiveMonth(null)}
        onToggleFavoritesOnly={() => setFavoritesOnly((current) => !current)}
      />

      {viewMode === 'photos' ? (
        <AlbumView images={albumImages} />
      ) : viewMode === 'videos' ? (
        <VideoView posts={videoPosts} />
      ) : filteredPosts.length > 0 ? (
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
      ) : (
        <div className={styles.state}>{emptyMessage}</div>
      )}
    </>
  );
};
