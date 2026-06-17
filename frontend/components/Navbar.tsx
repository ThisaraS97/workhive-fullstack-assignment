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
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group inline-flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-sm ring-1 ring-black/5">
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
            Work<span className="text-indigo-600">Hive</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Jobs
          </Link>

          {!user && (
            <>
              <Link
                href="/auth/login"
                className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="ml-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 px-4 py-2 text-white shadow-sm ring-1 ring-black/5 transition hover:brightness-110"
              >
                Register
              </Link>
            </>
          )}

          {user && (
            <>
              <span className="hidden sm:inline rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                {user.name} · <span className="capitalize">{role}</span>
              </span>

              {role === 'seeker' && (
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  My Applications
                </Link>
              )}

              {role === 'employer' && (
                <>
                  <Link
                    href="/employer/post"
                    className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    Post Job
                  </Link>
                  <Link
                    href="/employer/jobs"
                    className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    My Jobs
                  </Link>
                </>
              )}

              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Admin
                </Link>
              )}

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="ml-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm ring-1 ring-black/5 transition hover:bg-slate-50 hover:text-slate-900"
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
