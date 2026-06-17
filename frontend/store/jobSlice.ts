import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Job, JobFilters } from '@/types';

interface JobState {
  listings: Job[];
  filters: JobFilters;
}

const initialState: JobState = {
  listings: [],
  filters: {},
};

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setListings: (state, action: PayloadAction<Job[]>) => {
      state.listings = action.payload;
    },
    setFilters: (state, action: PayloadAction<JobFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const { setListings, setFilters, clearFilters } = jobSlice.actions;
export default jobSlice.reducer;
