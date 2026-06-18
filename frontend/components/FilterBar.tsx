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
    <div className="wh-card !p-5">
      <div className="grid gap-4 md:grid-cols-12 md:items-end">
        <div className="md:col-span-5">
          <label className="wh-label !mb-1.5 !text-xs !text-slate-600">Keyword</label>
          <input
            type="search"
            placeholder="e.g. frontend, node, designer..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="wh-input"
          />
        </div>

        <div className="md:col-span-3">
          <label className="wh-label !mb-1.5 !text-xs !text-slate-600">Location</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className="wh-select">
            {LOCATIONS.map((loc) => (
              <option key={loc || 'all'} value={loc}>
                {loc || 'All locations'}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="wh-label !mb-1.5 !text-xs !text-slate-600">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="wh-select">
            {CATEGORIES.map((cat) => (
              <option key={cat || 'all'} value={cat}>
                {cat || 'All categories'}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="wh-label !mb-1.5 !text-xs !text-slate-600">Min salary</label>
          <input
            type="number"
            placeholder="90000"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            className="wh-input"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <span>
          Search is <span className="font-semibold text-slate-800">debounced 300ms</span> for a smooth experience.
        </span>
        <button
          type="button"
          onClick={() => {
            setKeyword('');
            setLocation('');
            setCategory('');
            setSalaryMin('');
          }}
          className="wh-pill transition hover:bg-slate-200"
        >
          Clear filters
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
