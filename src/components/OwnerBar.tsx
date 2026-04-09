import { FormEvent, useState } from 'react';
import type { useOwnerAuth } from '../hooks/useOwnerAuth';
import styles from '../app/App.module.css';

type OwnerBarProps = {
  ownerAuth: ReturnType<typeof useOwnerAuth>;
};

export const OwnerBar = ({ ownerAuth }: OwnerBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await ownerAuth.login(email, password);
      setIsOpen(false);
      setPassword('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '登录失败');
    }
  };

  if (ownerAuth.isChecking) {
    return (
      <section className={styles.ownerPanel}>
        <div className={styles.ownerIntro}>
          <p className={styles.ownerTitle}>作者模式</p>
          <p className={styles.ownerHint}>检查作者状态中...</p>
        </div>
      </section>
    );
  }

  if (ownerAuth.owner) {
    return (
      <section className={styles.ownerPanel}>
        <div className={styles.ownerIntro}>
          <p className={styles.ownerTitle}>作者模式</p>
          <p className={styles.ownerHint}>当前以 {ownerAuth.owner.email} 身份登录，可继续使用现有编辑与管理能力。</p>
        </div>
        <div className={styles.ownerActions}>
          <button type="button" className={styles.ownerSecondaryButton} onClick={ownerAuth.logout}>
            退出作者模式
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.ownerPanel}>
      <div className={styles.ownerIntro}>
        <p className={styles.ownerTitle}>作者模式</p>
        <p className={styles.ownerHint}>需要维护内容时，再从这里进入作者登录，不打扰日常浏览。</p>
      </div>
      {isOpen ? (
        <form className={styles.ownerForm} onSubmit={handleSubmit}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="owner email" />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="password"
          />
          <div className={styles.ownerActions}>
            <button type="submit" className={styles.ownerPrimaryButton}>
              进入作者模式
            </button>
            <button type="button" className={styles.ownerSecondaryButton} onClick={() => setIsOpen(false)}>
              取消
            </button>
          </div>
          {error ? <small>{error}</small> : null}
        </form>
      ) : (
        <div className={styles.ownerActions}>
          <button type="button" className={styles.ownerPrimaryButton} onClick={() => setIsOpen(true)}>
            打开作者入口
          </button>
        </div>
      )}
    </section>
  );
};
