import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityLogsApi } from '@/api/activityLogs';
import type { ActivityLog } from '@/types/activityLog';

interface ActivityLogsState {
  logs: ActivityLog[];
  loading: boolean;
}

const initialState: ActivityLogsState = {
  logs: [],
  loading: false,
};

export const fetchActivityLogs = createAsyncThunk(
  'activityLogs/fetchByPatient',
  async (patientId: string, { rejectWithValue }) => {
    try {
      const { data } = await activityLogsApi.getByPatient(patientId);
      return data.data as ActivityLog[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch activity logs');
    }
  },
);

const activityLogsSlice = createSlice({
  name: 'activityLogs',
  initialState,
  reducers: {
    clearLogs: (state) => { state.logs = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivityLogs.pending, (state) => { state.loading = true; })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => { state.loading = false; state.logs = action.payload; })
      .addCase(fetchActivityLogs.rejected, (state) => { state.loading = false; });
  },
});

export const { clearLogs } = activityLogsSlice.actions;
export default activityLogsSlice.reducer;
