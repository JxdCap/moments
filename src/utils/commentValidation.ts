import type { CommentInput } from '../types/moment';

export const COMMENT_LIMITS = {
  nameMax: 24,
  contentMin: 2,
  contentMax: 500,
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateComment = (input: CommentInput) => {
  const errors: Partial<Record<keyof CommentInput, string>> = {};

  if (!input.name.trim()) {
    errors.name = '请填写昵称';
  } else if (input.name.trim().length > COMMENT_LIMITS.nameMax) {
    errors.name = `昵称最多 ${COMMENT_LIMITS.nameMax} 个字符`;
  }

  if (!emailPattern.test(input.email.trim())) {
    errors.email = '请填写有效邮箱，用于生成 Gravatar';
  }

  if (input.website && !/^https?:\/\//i.test(input.website)) {
    errors.website = '网址需要以 http:// 或 https:// 开头';
  }

  const contentLength = input.content.trim().length;
  if (contentLength < COMMENT_LIMITS.contentMin) {
    errors.content = `评论至少 ${COMMENT_LIMITS.contentMin} 个字符`;
  } else if (contentLength > COMMENT_LIMITS.contentMax) {
    errors.content = `评论最多 ${COMMENT_LIMITS.contentMax} 个字符`;
  }

  return errors;
};
