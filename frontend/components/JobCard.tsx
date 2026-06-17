import Link from 'next/link';
import type { Job } from '@/types';

export default function JobCard({ job }: { job: Job }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -top-24 right-0 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl" />
        <div className="absolute -bottom-24 left-0 h-48 w-48 rounded-full bg-sky-500/10 blur-2xl" />
      </div>

      <div className="relative mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{job.employer.name}</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
          {job.category}
        </span>
      </div>

      <p className="relative mb-5 line-clamp-3 text-sm leading-relaxed text-slate-600">
        {job.description}
      </p>

      <div className="relative mb-6 flex flex-wrap gap-2 text-xs font-semibold text-slate-700">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">
          <LocationIcon />
          {job.location}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 ring-1 ring-slate-200">
          <MoneyIcon />
          ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}
        </span>
      </div>

      <Link
        href={`/jobs/${job.id}`}
        className="relative inline-flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-black/5 transition hover:brightness-110"
      >
        View Job
      </Link>
    </article>
  );
}

function LocationIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-slate-500">
      <path
        d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 10.5a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-slate-500">
      <path
        d="M4 8.5h16v7H4v-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M7 12a2.5 2.5 0 0 1-2.5 2.5M17 12a2.5 2.5 0 0 0 2.5 2.5M7 12a2.5 2.5 0 0 0-2.5-2.5M17 12a2.5 2.5 0 0 1 2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M12 13.9a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}
