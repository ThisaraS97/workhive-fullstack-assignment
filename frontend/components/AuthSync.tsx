'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { setCredentials, clearCredentials } from '@/store/authSlice';

export default function AuthSync() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === 'authenticated' && session?.user && session.accessToken) {
      dispatch(
        setCredentials({
          user: session.user,
          token: session.accessToken,
        })
      );
    }

    if (status === 'unauthenticated') {
      dispatch(clearCredentials());
    }
  }, [session, status, dispatch]);

  return null;
}
