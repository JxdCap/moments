import { useCallback, useEffect, useState } from 'react';
import { getOwnerSession, loginOwner, logoutOwner } from '../services/auth';
import type { OwnerSession } from '../types/moment';

export const useOwnerAuth = () => {
  const [owner, setOwner] = useState<OwnerSession | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setOwner(getOwnerSession());
    setIsChecking(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await loginOwner(email, password);
    setOwner(session);
  }, []);

  const logout = useCallback(() => {
    logoutOwner();
    setOwner(null);
  }, []);

  return {
    owner,
    isChecking,
    isOwner: Boolean(owner),
    login,
    logout,
  };
};
