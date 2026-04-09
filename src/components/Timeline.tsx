import { useMemo, useState } from 'react';
import { Lightbox } from './Lightbox';
import { MomentCard } from './MomentCard';
import type { usePosts } from '../hooks/usePosts';
import type { MomentMedia, MomentPost } from '../types/moment';
import { formatDuration, formatMomentTime } from '../utils/date';
import styles from '../app/App.module.css';

type TimelineProps = {
  postsState: ReturnType<typeof usePosts>;
  isOwner: boolean;
};

type ViewMode = 'timeline' | 'photos' | 'videos';

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
      <button type="button" className={viewMode === 'videos' ? styles.activeMode : ''} onClick={() => onChangeMode('videos')}>
        视频
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
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const tags = useMemo(() => collectTags(postsState.posts), [postsState.posts]);
  const filteredPosts = useMemo(
    () => (activeTag ? postsState.posts.filter((post) => post.tags.includes(activeTag)) : postsState.posts),
    [activeTag, postsState.posts],
  );
  const albumImages = useMemo(() => collectAlbumImages(filteredPosts), [filteredPosts]);
  const videoPosts = useMemo(() => filteredPosts.filter((post) => post.type === 'video'), [filteredPosts]);

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
      ) : viewMode === 'videos' ? (
        <VideoView posts={videoPosts} />
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
