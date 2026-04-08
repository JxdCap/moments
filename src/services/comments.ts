import { pb } from './pocketbase';
import { demoComments } from './demoData';
import { mapCommentRecord } from './mappers';
import type { CommentInput, MomentComment } from '../types/moment';
import type { CommentRecord } from '../types/pocketbase';
import { validateComment } from '../utils/commentValidation';
import { getGravatarHash } from '../utils/gravatar';

const submitTimestamps = new Map<string, number>();
let localComments = [...demoComments];

export const listCommentsByPost = async (postId: string) => {
  if (!pb) {
    return localComments.filter((comment) => comment.postId === postId && comment.status === 'approved');
  }

  const records = await pb.collection('comments').getFullList<CommentRecord>({
    filter: `post = "${postId}" && status = "approved"`,
    sort: 'created',
  });

  return records.map(mapCommentRecord);
};

export const submitComment = async (input: CommentInput) => {
  const errors = validateComment(input);
  if (Object.keys(errors).length > 0) {
    throw new Error(Object.values(errors)[0] ?? '评论内容不完整');
  }

  const key = `${input.postId}:${input.email.trim().toLowerCase()}`;
  const now = Date.now();
  const lastSubmitAt = submitTimestamps.get(key) ?? 0;

  if (now - lastSubmitAt < 30_000) {
    throw new Error('提交太频繁，请稍后再试');
  }

  submitTimestamps.set(key, now);

  const payload = {
    post: input.postId,
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    gravatar_hash: getGravatarHash(input.email),
    website: input.website?.trim() || '',
    content: input.content.trim(),
    status: 'pending',
  };

  if (!pb) {
    const comment: MomentComment = {
      id: crypto.randomUUID(),
      postId: payload.post,
      name: payload.name,
      email: payload.email,
      gravatarHash: payload.gravatar_hash,
      website: payload.website,
      content: payload.content,
      status: 'approved',
      created: new Date().toISOString(),
    };
    localComments = [...localComments, comment];
    return comment;
  }

  const record = await pb.collection('comments').create<CommentRecord>(payload);
  return mapCommentRecord(record);
};
