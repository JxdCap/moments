import { useEffect, useState } from 'react';
import { OwnerBar } from '../components/OwnerBar';
import { Timeline } from '../components/Timeline';
import { getGravatarHash, getGravatarUrl } from '../utils/gravatar';
import { useOwnerAuth } from '../hooks/useOwnerAuth';
import { usePosts } from '../hooks/usePosts';
import styles from './App.module.css';

const ownerAvatarUrl = getGravatarUrl(getGravatarHash('mrjucn@qq.com'), 144);

export const App = () => {
  const ownerAuth = useOwnerAuth();
  const posts = usePosts();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    if (!isProfileOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileOpen]);

  return (
    <main className={styles.shell}>
      <section className={styles.phoneFrame} aria-label="个人朋友圈时间流">
        <header className={styles.cover} />
        <div className={styles.profileSection}>
          <div className={styles.profileInfo}>
            <div className={styles.profileHeaderRow}>
              <div className={styles.profileText}>
                <div className={styles.profileMeta}>个人记录</div>
                <h1 className={styles.profileName}>枫叶 - JxdCap</h1>
                <p className={styles.profileBio}>只记录真实发生的小事</p>
              </div>
              <button
                type="button"
                className={styles.avatarButton}
                onClick={() => setIsProfileOpen(true)}
                aria-label="打开个人资料与作者入口"
                aria-haspopup="dialog"
                aria-expanded={isProfileOpen}
              >
                <img className={styles.avatar} src={ownerAvatarUrl} alt="枫叶头像" />
              </button>
            </div>
          </div>
        </div>

        <Timeline postsState={posts} isOwner={ownerAuth.isOwner} />
      </section>

      {isProfileOpen ? (
        <div className={styles.profileSheet} role="dialog" aria-modal="true" aria-label="个人资料与作者入口">
          <button type="button" className={styles.profileBackdrop} onClick={() => setIsProfileOpen(false)} aria-label="关闭资料层" />
          <div className={styles.profileCard}>
            <div className={styles.profileCardHeader}>
              <div className={styles.profileCardIdentity}>
                <img className={styles.profileCardAvatar} src={ownerAvatarUrl} alt="枫叶头像" />
                <div>
                  <p className={styles.profileCardName}>枫叶 - JxdCap</p>
                  <p className={styles.profileCardBio}>只记录真实发生的小事</p>
                </div>
              </div>
            </div>

            <p className={styles.profileCardNote}>日常记录，慢慢更新。</p>

            <OwnerBar ownerAuth={ownerAuth} />

            <div className={styles.profileCardFooter}>
              <button type="button" className={styles.profileClose} onClick={() => setIsProfileOpen(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
};
