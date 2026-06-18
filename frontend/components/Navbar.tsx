'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

export default function Navbar() {
  const { data: session } = useSession();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const user = authUser || session?.user;
  const role = user?.role;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group inline-flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-blue-600 text-white shadow-sm ring-1 ring-black/[0.04] transition group-hover:bg-blue-700">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-95">
              <path
                d="M6 7.5C6 6.12 7.12 5 8.5 5h7C16.88 5 18 6.12 18 7.5V19l-3.2-1.6a2 2 0 0 0-1.79 0L10 19l-3.2-1.6A2 2 0 0 0 6 17.4V7.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M9 9h6M9 12h6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Work<span className="text-blue-600">Hive</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          <Link href="/" className="wh-nav-link">
            Jobs
          </Link>

          {!user && (
            <>
              <Link href="/auth/login" className="wh-nav-link">
                Login
              </Link>
              <Link href="/auth/register" className="wh-btn-primary ml-1 px-4 py-2">
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              <span className="hidden sm:inline wh-pill mx-1">
                {user.name} · <span className="capitalize">{role}</span>
              </span>

              {role === 'seeker' && (
                <Link href="/dashboard" className="wh-nav-link">
                  My Applications
                </Link>
              )}

              {role === 'employer' && (
                <>
                  <Link href="/employer/post" className="wh-nav-link">
                    Post Job
                  </Link>
                  <Link href="/employer/jobs" className="wh-nav-link">
                    My Jobs
                  </Link>
                </>
              )}

              {role === 'admin' && (
                <Link href="/admin" className="wh-nav-link">
                  Admin
                </Link>
              )}

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="wh-btn-secondary ml-1 px-4 py-2"
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
