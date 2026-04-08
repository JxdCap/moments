import { FormEvent, useState } from 'react';
import type { MomentPost, PostPatch } from '../types/moment';
import styles from './EditPostDialog.module.css';

type EditPostDialogProps = {
  post: MomentPost;
  onClose: () => void;
  onSave: (patch: PostPatch) => Promise<void>;
};

export const EditPostDialog = ({ post, onClose, onSave }: EditPostDialogProps) => {
  const [content, setContent] = useState(post.content);
  const [tags, setTags] = useState(post.tags.join(', '));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!content.trim()) {
      setError('正文不能为空');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave({
        content: content.trim(),
        tags: tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} role="presentation">
      <form className={styles.dialog} onSubmit={handleSubmit} aria-label="编辑动态">
        <h3>编辑动态</h3>
        <label>
          正文
          <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={5} />
        </label>
        <label>
          标签
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="用英文逗号分隔" />
        </label>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.actions}>
          <button type="button" onClick={onClose} disabled={isSaving}>
            取消
          </button>
          <button type="submit" disabled={isSaving}>
            {isSaving ? '保存中' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
};
