import { FormEvent, useState } from 'react';
import type { useOwnerAuth } from '../hooks/useOwnerAuth';
import styles from './OwnerBar.module.css';

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
    return <div className={styles.bar}>检查作者状态...</div>;
  }

  if (ownerAuth.owner) {
    return (
      <div className={styles.bar}>
        <span>作者模式：{ownerAuth.owner.email}</span>
        <button type="button" onClick={ownerAuth.logout}>
          退出
        </button>
      </div>
    );
  }

  return (
    <div className={styles.bar}>
      {isOpen ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="owner email" />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="password"
          />
          <button type="submit">登录</button>
          <button type="button" onClick={() => setIsOpen(false)}>
            取消
          </button>
          {error ? <small>{error}</small> : null}
        </form>
      ) : (
        <button type="button" onClick={() => setIsOpen(true)}>
          作者登录
        </button>
      )}
    </div>
  );
};
