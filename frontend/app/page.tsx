import { api } from '@/lib/api';
import HomeClientWrapper from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const jobs = await api.getJobs();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-14">
      <section className="mb-12">
        <div className="wh-card grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <div className="wh-badge gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Built for seekers, employers, and admins
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl md:leading-[1.1]">
              Discover roles you&apos;ll actually love.
            </h1>
            <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-slate-600">
              WorkHive is a modern job board with fast listings, secure applications, and role-based
              dashboards — designed with clarity and polish.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#jobs" className="wh-btn-primary">
                Browse jobs
              </a>
              <a href="/auth/register" className="wh-btn-secondary">
                Create account
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
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

      <section id="jobs" className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Open roles</h2>
        <p className="mt-1 text-[15px] text-slate-600">Search by keyword, location, category, and salary.</p>
      </section>

      <HomeClientWrapper initialJobs={jobs} />
    </main>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="wh-pill">{children}</span>;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="wh-stat-card">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-600">{hint}</div>
    </div>
  );
}
