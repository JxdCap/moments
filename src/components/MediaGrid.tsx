import type { CSSProperties } from 'react';
import type { MomentMedia } from '../types/moment';
import { getMediaGridLayout } from '../utils/mediaLayout';
import styles from './MediaGrid.module.css';

type MediaGridProps = {
  images: MomentMedia[];
};

export const MediaGrid = ({ images }: MediaGridProps) => {
  if (images.length === 0) {
    return null;
  }

  const layout = getMediaGridLayout(images.length);

  return (
    <div
      className={`${styles.grid} ${styles[layout.variant]}`}
      style={{ '--columns': layout.columns } as CSSProperties}
    >
      {images.slice(0, 9).map((image, index) => (
        <button key={`${image.url}-${index}`} type="button" className={styles.item} aria-label="查看图片">
          <img src={image.url} alt={image.alt ?? ''} loading="lazy" />
        </button>
      ))}
    </div>
  );
};
