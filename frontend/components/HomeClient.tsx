'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import FilterBar from '@/components/FilterBar';
import JobCard from '@/components/JobCard';
import { api } from '@/lib/api';
import { setFilters, setListings } from '@/store/jobSlice';
import { setLoading, showToast } from '@/store/uiSlice';
import type { Job, JobFilters } from '@/types';

function HomeClient({ initialJobs }: { initialJobs: Job[] }) {
  const dispatch = useDispatch();
  const [jobs, setJobs] = useState(initialJobs);

  useEffect(() => {
    dispatch(setListings(initialJobs));
  }, [dispatch, initialJobs]);

  const handleFilterChange = useCallback(
    async (filters: JobFilters) => {
      dispatch(setFilters(filters));
      dispatch(setLoading(true));
      try {
        const results = await api.getJobs(filters);
        setJobs(results);
        dispatch(setListings(results));
      } catch (error) {
        dispatch(showToast({ message: error instanceof Error ? error.message : 'Failed to load jobs', type: 'error' }));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  return (
    <div className="space-y-6">
      <FilterBar onChange={handleFilterChange} />
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
      {jobs.length === 0 && (
        <div className="wh-card !py-16 text-center">
          <p className="text-base font-semibold text-slate-900">No jobs match your filters</p>
          <p className="mt-2 text-sm text-slate-500">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
}

export default function HomeClientWrapper({ initialJobs }: { initialJobs: Job[] }) {
  return (
    <Suspense fallback={<p className="text-center text-slate-500">Loading filters...</p>}>
      <HomeClient initialJobs={initialJobs} />
    </Suspense>
  );
}
