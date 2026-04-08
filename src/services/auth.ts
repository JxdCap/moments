import { pb } from './pocketbase';
import type { OwnerSession } from '../types/moment';

const localOwnerKey = 'moments:demo-owner';

export const getOwnerSession = (): OwnerSession | null => {
  if (pb?.authStore.isValid && pb.authStore.model?.email) {
    return {
      email: String(pb.authStore.model.email),
      token: pb.authStore.token,
    };
  }

  const email = localStorage.getItem(localOwnerKey);
  if (email) {
    return {
      email,
      token: 'demo-owner-session',
    };
  }

  return null;
};

export const loginOwner = async (email: string, password: string) => {
  if (!pb) {
    if (email.trim() && password.trim()) {
      localStorage.setItem(localOwnerKey, email.trim());
      return getOwnerSession();
    }

    throw new Error('请输入邮箱和密码');
  }

  await pb.collection('owners').authWithPassword(email.trim(), password);
  return getOwnerSession();
};

export const logoutOwner = () => {
  pb?.authStore.clear();
  localStorage.removeItem(localOwnerKey);
};
