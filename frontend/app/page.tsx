import { api } from '@/lib/api';
import HomeClientWrapper from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const jobs = await api.getJobs();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-10">
        <div className="grid gap-8 rounded-3xl border border-slate-200/70 bg-white/70 p-8 shadow-sm ring-1 ring-black/5 backdrop-blur-xl md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
              Built for seekers, employers, and admins
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
              Discover roles you’ll actually love.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              WorkHive is a modern job board with fast SSR listings, secure applications, and role-based
              dashboards—built to impress in a technical review.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#jobs"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-sm ring-1 ring-black/5 transition hover:brightness-110"
              >
                Browse jobs
              </a>
              <a
                href="/auth/register"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm ring-1 ring-black/5 transition hover:bg-slate-50"
              >
                Create account
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
              <Pill>SSR listings</Pill>
              <Pill>PDF resume upload</Pill>
              <Pill>Worker threads</Pill>
              <Pill>Admin moderation</Pill>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard label="Employers" value="5+" hint="Seeded for realistic demos" />
            <StatCard label="Seekers" value="15+" hint="Applications + statuses" />
            <StatCard label="Jobs" value="20+" hint="Filters by location/category" />
            <StatCard label="Apps" value="30+" hint="Pending / accepted / rejected" />
          </div>
        </div>
      </section>

      <section id="jobs" className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Open roles</h2>
          <p className="mt-1 text-sm text-slate-600">Search by keyword, location, category, and salary.</p>
        </div>
      </section>
      <HomeClientWrapper initialJobs={jobs} />
    </main>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">
      {children}
    </span>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="text-xs font-semibold text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-600">{hint}</div>
    </div>
  );
}
