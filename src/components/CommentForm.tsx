import { FormEvent, useState } from 'react';
import type { CommentInput } from '../types/moment';
import { validateComment } from '../utils/commentValidation';
import styles from './MomentCard.module.css';

type CommentFormProps = {
  onSubmit: (input: Omit<CommentInput, 'postId'>) => Promise<unknown>;
  onSuccess?: () => void;
};

const initialForm = {
  name: '',
  email: '',
  website: '',
  content: '',
};

export const CommentForm = ({ onSubmit, onSuccess }: CommentFormProps) => {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateComment({ ...form, postId: 'preview' });

    if (Object.keys(errors).length > 0) {
      setMessage(Object.values(errors)[0] ?? '请检查评论内容');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      await onSubmit(form);
      setForm(initialForm);
      setMessage('评论已提交，若开启审核会在通过后显示。');
      onSuccess?.();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : '评论提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="昵称"
          maxLength={24}
        />
        <input
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="邮箱"
          type="email"
        />
      </div>
      <input
        value={form.website}
        onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
        placeholder="网址，可空"
        type="url"
      />
      <textarea
        value={form.content}
        onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
        placeholder="写评论..."
        rows={3}
        maxLength={500}
      />
      <div className={styles.actions}>
        <small>{message ?? '邮箱仅用于生成 Gravatar，不会公开展示。'}</small>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '提交中' : '评论'}
        </button>
      </div>
    </form>
  );
};
