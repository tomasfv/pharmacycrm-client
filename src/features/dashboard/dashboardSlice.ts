import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardApi, type DashboardMetrics } from '@/api/dashboard';

interface DashboardState {
  metrics: DashboardMetrics;
  loading: boolean;
}

const initialState: DashboardState = {
  metrics: {
    patientsToContactToday: 0,
    pendingOrders: 0,
    readyForPickup: 0,
    overduePatients: 0,
  },
  loading: false,
};

export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await dashboardApi.getMetrics();
      return data.data as DashboardMetrics;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard metrics');
    }
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => { state.loading = false; state.metrics = action.payload; })
      .addCase(fetchDashboardMetrics.rejected, (state) => { state.loading = false; });
  },
});

export const selectDashboardMetrics = (state: { dashboard: DashboardState }) =>
  state.dashboard.metrics;

export default dashboardSlice.reducer;
