'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearToast } from '@/store/uiSlice';
import type { RootState } from '@/store';

export default function Toast() {
  const dispatch = useDispatch();
  const toast = useSelector((state: RootState) => state.ui.toast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch(clearToast()), 4000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const colors = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-slate-800',
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${colors[toast.type]}`}>
      {toast.message}
    </div>
  );
}
