import { useEffect, useState } from 'react';
import { OwnerBar } from '../components/OwnerBar';
import { Timeline } from '../components/Timeline';
import { useOwnerAuth } from '../hooks/useOwnerAuth';
import { usePosts } from '../hooks/usePosts';
import styles from './App.module.css';

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
        <header className={styles.cover}>
          <div className={styles.coverShade}>
            <div className={styles.profile}>
              <div>
                <p className={styles.profileName}>站长的朋友圈</p>
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
                <div className={styles.avatar} aria-hidden="true">
                  朋
                </div>
                <span className={styles.avatarHint}>资料</span>
              </button>
            </div>
          </div>
        </header>

        <Timeline postsState={posts} isOwner={ownerAuth.isOwner} />
      </section>

      {isProfileOpen ? (
        <div className={styles.profileSheet} role="dialog" aria-modal="true" aria-label="个人资料与作者入口">
          <button type="button" className={styles.profileBackdrop} onClick={() => setIsProfileOpen(false)} aria-label="关闭资料层" />
          <div className={styles.profileCard}>
            <div className={styles.profileCardHeader}>
              <div className={styles.profileCardIdentity}>
                <div className={styles.profileCardAvatar} aria-hidden="true">
                  朋
                </div>
                <div>
                  <p className={styles.profileCardName}>站长的朋友圈</p>
                  <p className={styles.profileCardBio}>只记录真实发生的小事</p>
                </div>
              </div>
              <button type="button" className={styles.profileClose} onClick={() => setIsProfileOpen(false)}>
                关闭
              </button>
            </div>

            <p className={styles.profileCardNote}>这是一个长期记录日常片段的个人内容页，作者入口已收纳到这里。</p>

            <OwnerBar ownerAuth={ownerAuth} />
          </div>
        </div>
      ) : null}
    </main>
  );
};
