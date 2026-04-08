import { OwnerBar } from '../components/OwnerBar';
import { Timeline } from '../components/Timeline';
import { useOwnerAuth } from '../hooks/useOwnerAuth';
import { usePosts } from '../hooks/usePosts';
import styles from './App.module.css';

export const App = () => {
  const ownerAuth = useOwnerAuth();
  const posts = usePosts();

  return (
    <main className={styles.shell}>
      <section className={styles.phoneFrame} aria-label="个人朋友圈时间流">
        <header className={styles.cover}>
          <div className={styles.coverShade}>
            <OwnerBar ownerAuth={ownerAuth} />
            <div className={styles.profile}>
              <div>
                <p className={styles.profileName}>站长的朋友圈</p>
                <p className={styles.profileBio}>只记录真实发生的小事</p>
              </div>
              <div className={styles.avatar} aria-hidden="true">
                朋
              </div>
            </div>
          </div>
        </header>

        <Timeline postsState={posts} isOwner={ownerAuth.isOwner} />
      </section>
    </main>
  );
};
