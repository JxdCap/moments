export type StoredCommentIdentity = {
  name: string;
  email: string;
  website: string;
};

const storageKey = 'moments.comment-identity';

const emptyIdentity: StoredCommentIdentity = {
  name: '',
  email: '',
  website: '',
};

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export const loadCommentIdentity = (): StoredCommentIdentity => {
  if (!canUseStorage()) {
    return emptyIdentity;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return emptyIdentity;
    }

    const parsed = JSON.parse(raw) as Partial<StoredCommentIdentity>;
    return {
      name: typeof parsed.name === 'string' ? parsed.name : '',
      email: typeof parsed.email === 'string' ? parsed.email : '',
      website: typeof parsed.website === 'string' ? parsed.website : '',
    };
  } catch {
    return emptyIdentity;
  }
};

export const saveCommentIdentity = (identity: StoredCommentIdentity) => {
  if (!canUseStorage()) {
    return;
  }

  const nextIdentity: StoredCommentIdentity = {
    name: identity.name.trim(),
    email: identity.email.trim(),
    website: identity.website?.trim() ?? '',
  };

  window.localStorage.setItem(storageKey, JSON.stringify(nextIdentity));
};
