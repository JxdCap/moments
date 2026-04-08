import { useState } from 'react';
import type { MomentPost } from '../types/moment';
import { formatDuration } from '../utils/date';
import styles from './VideoBlock.module.css';

type VideoBlockProps = {
  post: MomentPost;
};

export const VideoBlock = ({ post }: VideoBlockProps) => {
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
    <button type="button" className={styles.preview} onClick={() => setIsPlaying(true)}>
      {post.videoCover ? <img src={post.videoCover} alt="" loading="lazy" /> : null}
      <span className={styles.play}>播放</span>
      {post.videoDuration ? <span className={styles.duration}>{formatDuration(post.videoDuration)}</span> : null}
    </button>
  );
};
