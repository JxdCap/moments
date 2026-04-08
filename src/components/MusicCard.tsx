import type { MomentPost } from '../types/moment';
import styles from './MusicCard.module.css';

type MusicCardProps = {
  post: MomentPost;
};

export const MusicCard = ({ post }: MusicCardProps) => (
  <div className={styles.card}>
    {post.musicCover ? <img src={post.musicCover} alt="" loading="lazy" /> : <span className={styles.cover}>♪</span>}
    <span className={styles.text}>
      <strong>{post.musicTitle ?? '未命名音乐'}</strong>
      <small>{post.musicArtist ?? '未知作者'}</small>
      {post.musicSource ? <em>{post.musicSource}</em> : null}
    </span>
  </div>
);
