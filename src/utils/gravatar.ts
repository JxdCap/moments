import { md5 } from './md5';

export const getGravatarHash = (email: string) => md5(email.trim().toLowerCase());

export const getGravatarUrl = (hash: string, size = 80) =>
  `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon&r=g`;
