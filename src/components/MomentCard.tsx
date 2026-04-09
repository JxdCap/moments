import { CSSProperties, useEffect, useState } from 'react';
import { CommentForm } from './CommentForm';
import { EditPostDialog } from './EditPostDialog';
import { Lightbox } from './Lightbox';
import { useComments } from '../hooks/useComments';
import type { MomentMedia, MomentPost, PostPatch } from '../types/moment';
import { formatDuration, formatMomentTime } from '../utils/date';
import { getGravatarUrl } from '../utils/gravatar';
import styles from './MomentCard.module.css';

type MomentCardProps = {
  post: MomentPost;
  isOwner: boolean;
  onSave: (postId: string, patch: PostPatch) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onTogglePinned: (post: MomentPost) => Promise<void>;
  onToggleLike: (post: MomentPost) => Promise<void>;
};

type MediaGridLayout = {
  variant: 'single' | 'double' | 'quad' | 'grid';
  columns: number;
};

const getMediaGridLayout = (count: number): MediaGridLayout => {
  if (count <= 1) {
    return { variant: 'single', columns: 1 };
  }
  if (count === 2) {
    return { variant: 'double', columns: 2 };
  }
  if (count === 4) {
    return { variant: 'quad', columns: 2 };
  }
  return { variant: 'grid', columns: 3 };
};

const MediaGrid = ({ images, onPreview }: { images: MomentMedia[]; onPreview: (index: number) => void }) => {
  if (images.length === 0) {
    return null;
  }

  const layout = getMediaGridLayout(images.length);

  return (
    <div className={`${styles.mediaGrid} ${styles[layout.variant]}`} style={{ '--columns': layout.columns } as CSSProperties}>
      {images.slice(0, 9).map((image, index) => (
        <button
          key={`${image.url}-${index}`}
          type="button"
          className={styles.mediaItem}
          onClick={() => onPreview(index)}
          aria-label={`查看第 ${index + 1} 张图片`}
        >
          <img src={image.url} alt={image.alt ?? ''} loading="lazy" />
        </button>
      ))}
    </div>
  );
};

const VideoBlock = ({ post }: { post: MomentPost }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!post.video) {
    return null;
  }

  if (isPlaying) {
    return (
      <video className={styles.video} src={post.video} controls autoPlay poster={post.videoCover}>
        当前浏览器不支持视频播放。
      </video>
    );
  }

  return (
    <button type="button" className={styles.videoPreview} onClick={() => setIsPlaying(true)}>
      {post.videoCover ? <img src={post.videoCover} alt="" loading="lazy" /> : null}
      <span className={styles.play}>播放</span>
      {post.videoDuration ? <span className={styles.duration}>{formatDuration(post.videoDuration)}</span> : null}
    </button>
  );
};

const ArticleBlock = ({ post }: { post: MomentPost }) => {
  if (!post.articleTitle && !post.articleUrl) {
    return null;
  }

  return (
    <a className={styles.articleCard} href={post.articleUrl} target="_blank" rel="noreferrer">
      {post.articleCover ? <img src={post.articleCover} alt="" loading="lazy" /> : <span className={styles.articleFallback}>文</span>}
      <span className={styles.richText}>
        <strong>{post.articleTitle}</strong>
        {post.articleDesc ? <small>{post.articleDesc}</small> : null}
        {post.articleSite ? <em>{post.articleSite}</em> : null}
      </span>
    </a>
  );
};

const MusicBlock = ({ post }: { post: MomentPost }) => (
  <div className={styles.musicCard}>
    {post.musicCover ? <img src={post.musicCover} alt="" loading="lazy" /> : <span className={styles.musicCover}>♪</span>}
    <span className={styles.richText}>
      <strong>{post.musicTitle ?? '未命名音乐'}</strong>
      <small>{post.musicArtist ?? '未知作者'}</small>
      {post.musicSource ? <em>{post.musicSource}</em> : null}
    </span>
  </div>
);

export const MomentCard = ({ post, isOwner, onSave, onDelete, onTogglePinned, onToggleLike }: MomentCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentNotice, setCommentNotice] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const { comments, error, isLoading, submit } = useComments(post.id);
  const visitorLikeCount = post.hasLiked ? post.likeCount - 1 : post.likeCount;
  const likeText = post.hasLiked
    ? visitorLikeCount > 0
      ? `你、${visitorLikeCount} 位访客`
      : '你'
    : post.likeCount > 0
      ? `${post.likeCount} 位访客`
      : '';
  const showImageGrid = post.type === 'image' && post.images.length > 0;
  const showVideoBlock = post.type === 'video';
  const showArticleBlock = post.type === 'article';
  const showMusicBlock = post.type === 'music';

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

  const handleToggleLike = async () => {
    setIsActionMenuOpen(false);
    setIsBusy(true);
    await onToggleLike(post);
    setIsBusy(false);
  };

  const handleComment = () => {
    setIsActionMenuOpen(false);
    setCommentNotice(null);
    setIsCommenting(true);
  };

  useEffect(() => {
    if (!commentNotice) {
      return;
    }

    const timeout = window.setTimeout(() => setCommentNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [commentNotice]);

  const showSocialBox = post.likeCount > 0 || comments.length > 0 || isLoading || error || commentNotice;

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

        {showImageGrid ? <MediaGrid images={post.images} onPreview={setPreviewIndex} /> : null}
        {showVideoBlock ? <VideoBlock post={post} /> : null}
        {showArticleBlock ? <ArticleBlock post={post} /> : null}
        {showMusicBlock ? <MusicBlock post={post} /> : null}

        {post.tags.length > 0 ? (
          <div className={styles.tags}>
            {post.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        ) : null}

        {post.location ? (
          <div className={styles.location} aria-label={`位置：${post.location}`}>
            <span aria-hidden="true">⌖</span>
            <span>{post.location}</span>
          </div>
        ) : null}

        <footer className={styles.meta}>
          <span>{formatMomentTime(post.publishedAt)}</span>
          {post.source ? <span>来自 {post.source}</span> : null}
          <div className={styles.actionWrap}>
            <button
              type="button"
              className={styles.moreButton}
              onClick={() => setIsActionMenuOpen((current) => !current)}
              aria-label="打开操作菜单"
              aria-expanded={isActionMenuOpen}
            >
              <span aria-hidden="true" />
            </button>
            {isActionMenuOpen ? (
              <div className={styles.actionMenu}>
                <button type="button" onClick={handleToggleLike} disabled={isBusy}>
                  <span className={styles.actionLikeIcon} aria-hidden="true">
                    {post.hasLiked ? '♡' : '♥'}
                  </span>
                  {post.hasLiked ? '取消' : '赞'}
                </button>
                <button type="button" onClick={handleComment}>
                  <span className={styles.actionCommentIcon} aria-hidden="true" />
                  评论
                </button>
              </div>
            ) : null}
          </div>
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

        {showSocialBox || isCommenting ? (
          <section className={styles.comments} aria-label="互动">
            {post.likeCount > 0 ? (
              <div className={styles.likes}>
                <span aria-hidden="true">♥</span>
                <strong>{likeText}</strong>
              </div>
            ) : null}

            {isLoading ? <p className={styles.state}>评论加载中...</p> : null}
            {error ? <p className={styles.state}>{error}</p> : null}
            {commentNotice ? <p className={`${styles.state} ${styles.success}`}>{commentNotice}</p> : null}

            {comments.length > 0 ? (
              <div className={styles.commentList}>
                {comments.map((comment) => (
                  <article key={comment.id} className={styles.comment}>
                    <img src={getGravatarUrl(comment.gravatarHash, 64)} alt="" loading="lazy" />
                    <div>
                      <p>
                        {comment.website ? (
                          <a href={comment.website} target="_blank" rel="noreferrer">
                            {comment.name}
                          </a>
                        ) : (
                          <strong>{comment.name}</strong>
                        )}
                        <span>{formatMomentTime(comment.created)}</span>
                      </p>
                      <div>{comment.content}</div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {isCommenting ? (
              <CommentForm
                onSubmit={submit}
                onSuccess={(comment) => {
                  setCommentNotice(comment.status === 'approved' ? '评论已贴上来。' : '收到，审核后会在这里出现。');
                  setIsCommenting(false);
                }}
              />
            ) : null}
          </section>
        ) : null}
      </div>

      {previewIndex !== null ? (
        <Lightbox images={post.images} activeIndex={previewIndex} onChange={setPreviewIndex} onClose={() => setPreviewIndex(null)} />
      ) : null}

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
