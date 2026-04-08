import { CommentForm } from './CommentForm';
import { useComments } from '../hooks/useComments';
import { formatMomentTime } from '../utils/date';
import { getGravatarUrl } from '../utils/gravatar';
import styles from './CommentThread.module.css';

type CommentThreadProps = {
  postId: string;
};

export const CommentThread = ({ postId }: CommentThreadProps) => {
  const { comments, error, isLoading, submit } = useComments(postId);

  return (
    <section className={styles.comments} aria-label="评论">
      {isLoading ? <p className={styles.state}>评论加载中...</p> : null}
      {error ? <p className={styles.state}>{error}</p> : null}

      {comments.length > 0 ? (
        <div className={styles.list}>
          {comments.map((comment) => (
            <article key={comment.id} className={styles.comment}>
              <img src={getGravatarUrl(comment.gravatarHash, 64)} alt="" loading="lazy" />
              <div>
                <p>
                  {comment.website ? (
                    <a href={comment.website} target="_blank" rel="noreferrer">
                      {comment.name}
                    </a>
                  ) : (
                    <strong>{comment.name}</strong>
                  )}
                  <span>{formatMomentTime(comment.created)}</span>
                </p>
                <div>{comment.content}</div>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      <CommentForm onSubmit={submit} />
    </section>
  );
};
