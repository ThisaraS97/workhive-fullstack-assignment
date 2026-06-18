import Link from 'next/link';
import type { Job } from '@/types';

export default function JobCard({ job }: { job: Job }) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -top-24 right-0 h-48 w-48 rounded-full bg-blue-500/8 blur-2xl" />
        <div className="absolute -bottom-24 left-0 h-48 w-48 rounded-full bg-sky-500/8 blur-2xl" />
      </div>

      <div className="relative mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{job.employer.name}</p>
        </div>
        <span className="wh-badge shrink-0">{job.category}</span>
      </div>

      <p className="relative mb-5 line-clamp-3 text-sm leading-relaxed text-slate-600">
        {job.description}
      </p>

      <div className="relative mb-6 flex flex-wrap gap-2">
        <span className="wh-pill inline-flex items-center gap-1.5">
          <LocationIcon />
          {job.location}
        </span>
        <span className="wh-pill inline-flex items-center gap-1.5">
          <MoneyIcon />
          ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}
        </span>
      </div>

      <Link href={`/jobs/${job.id}`} className="wh-btn-primary relative px-5 py-2.5">
        View job
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
