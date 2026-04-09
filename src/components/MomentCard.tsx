import { useEffect, useState } from 'react';
import { Heart, Star, MapPin, MessageCircle, MoreHorizontal, Play, FileText, Music, Pin } from 'lucide-react';
import { CommentForm } from './CommentForm';
import { EditPostDialog } from './EditPostDialog';
import { Lightbox } from './Lightbox';
import { useComments } from '../hooks/useComments';
import type { MomentMedia, MomentPost, PostPatch } from '../types/moment';
import { formatDuration, formatMomentTime } from '../utils/date';
import { getGravatarHash, getGravatarUrl } from '../utils/gravatar';
import styles from './MomentCard.module.css';

type MomentCardProps = {
  post: MomentPost;
  isOwner: boolean;
  isFavorited: boolean;
  onSave: (postId: string, patch: PostPatch) => Promise<void>;
  onDelete: (postId: string) => Promise<void>;
  onTogglePinned: (post: MomentPost) => Promise<void>;
  onToggleLike: (post: MomentPost) => Promise<void>;
  onToggleFavorite: (postId: string) => void;
};

const ownerAvatarUrl = getGravatarUrl(getGravatarHash('mrjucn@qq.com'), 96);

const MediaGrid = ({ images, onPreview }: { images: MomentMedia[]; onPreview: (index: number) => void }) => {
  if (images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    const [image] = images;

    return (
      <button type="button" className={styles.mediaLeadSingle} onClick={() => onPreview(0)} aria-label="查看图片">
        <img src={image.thumbUrl || image.url} alt={image.alt ?? ''} loading="lazy" />
      </button>
    );
  }

  return (
    <div className={styles.mediaGrid} aria-label={`共 ${images.length} 张图片`}>
      <div className={`${styles.mediaGridTrack} ${styles[`mediaGridCount${Math.min(images.length, 9)}`]}`}>
        {images.slice(0, 9).map((image, index) => (
          <button
            key={`${image.url}-${index}`}
            type="button"
            className={styles.mediaGridItem}
            onClick={() => onPreview(index)}
            aria-label={`查看第 ${index + 1} 张图片`}
          >
            <img src={image.thumbUrl || image.url} alt={image.alt ?? ''} loading="lazy" />
          </button>
        ))}
      </div>
      <div className={styles.mediaGridMeta}>
        <span>{images.length} 张图片</span>
      </div>
    </div>
  );
};

const StoryCaption = ({ post }: { post: MomentPost }) => (
  <>
    {post.content ? <p className={styles.content}>{post.content}</p> : null}

    {post.tags.length > 0 ? (
      <div className={styles.tags}>
        {post.tags.map((tag) => (
          <span key={tag} className={styles.tag}>#{tag}</span>
        ))}
      </div>
    ) : null}
  </>
);

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
      <span className={styles.play}><Play size={32} fill="currentColor" strokeWidth={1} /></span>
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
      {post.articleCover ? <img src={post.articleCover} alt="" loading="lazy" /> : <span className={styles.articleFallback}><FileText size={24} strokeWidth={1.5} /></span>}
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
    {post.musicCover ? <img src={post.musicCover} alt="" loading="lazy" /> : <span className={styles.musicCover}><Music size={24} strokeWidth={1.5} /></span>}
    <span className={styles.richText}>
      <strong>{post.musicTitle ?? '未命名音乐'}</strong>
      <small>{post.musicArtist ?? '未知作者'}</small>
      {post.musicSource ? <em>{post.musicSource}</em> : null}
    </span>
  </div>
);

export const MomentCard = ({ post, isOwner, isFavorited, onSave, onDelete, onTogglePinned, onToggleLike, onToggleFavorite }: MomentCardProps) => {
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
  const isMediaLead = showImageGrid || showVideoBlock;
  const hasEmbed = showArticleBlock || showMusicBlock;
  const cardVariantClassName = isMediaLead ? styles.cardMediaLead : hasEmbed ? styles.cardEmbed : styles.cardTextLead;

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

  const handleToggleFavorite = () => {
    setIsActionMenuOpen(false);
    onToggleFavorite(post.id);
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
    <article className={`${styles.card} ${cardVariantClassName}`}>
      <div className={styles.body}>
        <header className={styles.signature}>
          <img className={styles.authorAvatar} src={ownerAvatarUrl} alt="枫叶头像" />
          <div className={styles.signatureText}>
            <div className={styles.topLine}>
              <div className={styles.authorWrap}>
                <h2 className={styles.author}>枫叶</h2>
                <span className={styles.timestamp}>{formatMomentTime(post.publishedAt)}</span>
              </div>
              {post.isPinned ? (
                <span className={styles.pinned}>
                  <Pin size={12} strokeWidth={2} aria-hidden="true" />
                  置顶
                </span>
              ) : null}
              {isFavorited ? <span className={styles.favoriteMark}>已收藏</span> : null}
            </div>

            {post.location ? (
              <div className={styles.location} aria-label={`位置：${post.location}`}>
                <MapPin size={14} strokeWidth={1.5} aria-hidden="true" />
                <span>{post.location}</span>
              </div>
            ) : null}
          </div>
        </header>

        <section className={`${styles.story} ${isMediaLead ? styles.storyMediaLead : styles.storyTextLead}`}>
          {isMediaLead ? (
            <>
              {showImageGrid ? <MediaGrid images={post.images} onPreview={setPreviewIndex} /> : null}
              {showVideoBlock ? <VideoBlock post={post} /> : null}
              <StoryCaption post={post} />
            </>
          ) : (
            <>
              <StoryCaption post={post} />
              {showArticleBlock ? <ArticleBlock post={post} /> : null}
              {showMusicBlock ? <MusicBlock post={post} /> : null}
            </>
          )}
        </section>

        <footer className={styles.meta}>
          <div className={styles.metaInfo}>
            {post.source ? <span>来自 {post.source}</span> : null}
            {hasEmbed ? <span>内容卡片</span> : null}
          </div>
          <div className={styles.actionWrap}>
            <button
              type="button"
              className={styles.moreButton}
              onClick={() => setIsActionMenuOpen((current) => !current)}
              aria-label="打开操作菜单"
              aria-expanded={isActionMenuOpen}
            >
              <MoreHorizontal size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
            {isActionMenuOpen ? (
              <div className={styles.actionMenu}>
                <button type="button" onClick={handleToggleFavorite}>
                  <span className={styles.actionFavoriteIcon} aria-hidden="true">
                    <Star size={14} fill={isFavorited ? "currentColor" : "none"} strokeWidth={1.5} />
                  </span>
                  {isFavorited ? '取消收藏' : '收藏'}
                </button>
                <button type="button" onClick={handleToggleLike} disabled={isBusy}>
                  <span className={styles.actionLikeIcon} aria-hidden="true">
                    <Heart size={14} fill={post.hasLiked ? "currentColor" : "none"} strokeWidth={1.5} />
                  </span>
                  {post.hasLiked ? '取消' : '赞'}
                </button>
                <button type="button" onClick={handleComment}>
                  <span className={styles.actionCommentIcon} aria-hidden="true">
                    <MessageCircle size={14} strokeWidth={1.5} />
                  </span>
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
                <Heart size={14} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
                <strong>{likeText}</strong>
              </div>
            ) : null}

            {isLoading ? <p className={styles.state}>评论正在慢慢展开...</p> : null}
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
                  setCommentNotice(comment.status === 'approved' ? '评论已经贴在这里。' : '已经收到，审核后会出现在这里。');
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
