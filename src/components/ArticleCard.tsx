import type { MomentPost } from '../types/moment';
import styles from './ArticleCard.module.css';

type ArticleCardProps = {
  post: MomentPost;
};

export const ArticleCard = ({ post }: ArticleCardProps) => {
  if (!post.articleTitle && !post.articleUrl) {
    return null;
  }

  return (
    <a className={styles.card} href={post.articleUrl} target="_blank" rel="noreferrer">
      {post.articleCover ? <img src={post.articleCover} alt="" loading="lazy" /> : <span className={styles.fallback}>文</span>}
      <span className={styles.text}>
        <strong>{post.articleTitle}</strong>
        {post.articleDesc ? <small>{post.articleDesc}</small> : null}
        {post.articleSite ? <em>{post.articleSite}</em> : null}
      </span>
    </a>
  );
};
