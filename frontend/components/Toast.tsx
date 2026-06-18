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

  const styles = {
    success: 'border-emerald-200 bg-white text-emerald-900 ring-emerald-100',
    error: 'border-red-200 bg-white text-red-900 ring-red-100',
    info: 'border-slate-200 bg-white text-slate-900 ring-slate-100',
  };

  const icons = {
    success: '✓',
    error: '!',
    info: 'i',
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_8px_32px_rgba(0,0,0,0.12)] ring-1 ${styles[toast.type]}`}
      role="status"
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-current/10 text-xs font-bold">
        {icons[toast.type]}
      </span>
      <span>{toast.message}</span>
    </div>
  );
}
