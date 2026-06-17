'use client';

import { useEffect, useMemo, useState } from 'react';
import type { JobFilters } from '@/types';

const LOCATIONS = ['', 'Remote', 'New York, NY', 'San Francisco, CA', 'Austin, TX', 'London, UK'];
const CATEGORIES = ['', 'Engineering', 'Design', 'Marketing', 'Sales', 'Operations'];

interface FilterBarProps {
  onChange: (filters: JobFilters) => void;
}

export default function FilterBar({ onChange }: FilterBarProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [salaryMin, setSalaryMin] = useState('');

  const debouncedKeyword = useDebouncedValue(keyword, 300);

  const filters = useMemo(
    () => ({
      keyword: debouncedKeyword || undefined,
      location: location || undefined,
      category: category || undefined,
      salaryMin: salaryMin ? Number(salaryMin) : undefined,
    }),
    [debouncedKeyword, location, category, salaryMin]
  );

  useEffect(() => {
    onChange(filters);
  }, [filters, onChange]);

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/70 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
      <div className="grid gap-3 md:grid-cols-12 md:items-end">
        <div className="md:col-span-5">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Keyword</label>
          <input
            type="search"
            placeholder="e.g. frontend, node, designer..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-black/5 placeholder:text-slate-400 focus:border-indigo-300"
          />
        </div>

        <div className="md:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Location</label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-black/5 focus:border-indigo-300"
          >
            {LOCATIONS.map((loc) => (
              <option key={loc || 'all'} value={loc}>
                {loc || 'All locations'}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-black/5 focus:border-indigo-300"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat || 'all'} value={cat}>
                {cat || 'All categories'}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-600">Min salary</label>
          <input
            type="number"
            placeholder="90000"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm ring-1 ring-black/5 placeholder:text-slate-400 focus:border-indigo-300"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span className="font-medium">
          Tip: search is <span className="text-slate-900">debounced 300ms</span> to stay fast.
        </span>
        <button
          type="button"
          onClick={() => {
            setKeyword('');
            setLocation('');
            setCategory('');
            setSalaryMin('');
          }}
          className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-200"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
