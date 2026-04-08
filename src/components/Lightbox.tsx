import { useEffect } from 'react';
import type { MomentMedia } from '../types/moment';
import styles from './Lightbox.module.css';

type LightboxProps = {
  images: MomentMedia[];
  activeIndex: number;
  onChange: (index: number) => void;
  onClose: () => void;
};

export const Lightbox = ({ images, activeIndex, onChange, onClose }: LightboxProps) => {
  const image = images[activeIndex];
  const canGoPrevious = activeIndex > 0;
  const canGoNext = activeIndex < images.length - 1;

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === 'ArrowLeft' && canGoPrevious) {
        onChange(activeIndex - 1);
      }
      if (event.key === 'ArrowRight' && canGoNext) {
        onChange(activeIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, canGoNext, canGoPrevious, onChange, onClose]);

  if (!image) {
    return null;
  }

  return (
    <div className={styles.lightbox} role="dialog" aria-modal="true" aria-label="图片预览">
      <button type="button" className={styles.closeLayer} onClick={onClose} aria-label="关闭预览" />
      <div className={styles.counter}>
        {activeIndex + 1} / {images.length}
      </div>
      <img className={styles.image} src={image.url} alt={image.alt ?? ''} />
      {canGoPrevious ? (
        <button
          type="button"
          className={`${styles.nav} ${styles.previous}`}
          onClick={() => onChange(activeIndex - 1)}
          aria-label="上一张"
        >
          <span aria-hidden="true">‹</span>
        </button>
      ) : null}
      {canGoNext ? (
        <button
          type="button"
          className={`${styles.nav} ${styles.next}`}
          onClick={() => onChange(activeIndex + 1)}
          aria-label="下一张"
        >
          <span aria-hidden="true">›</span>
        </button>
      ) : null}
      <button type="button" className={styles.close} onClick={onClose} aria-label="关闭">
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
};
