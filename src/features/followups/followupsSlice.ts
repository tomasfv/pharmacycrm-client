import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { followupsApi } from '@/api/followups';
import type { FollowUp, FollowUpStatus } from '@/types';

interface FollowUpsState {
  followUps: FollowUp[];
  loading: boolean;
  viewMode: 'kanban' | 'table';
}

const columns: FollowUpStatus[] = [
  'pending_contact',
  'contacted',
  'order_received',
  'prepared',
  'delivered',
];

const initialState: FollowUpsState = {
  followUps: [],
  loading: false,
  viewMode: 'kanban',
};

export const fetchFollowUps = createAsyncThunk(
  'followups/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await followupsApi.getAll();
      return data.data as FollowUp[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch follow-ups');
    }
  },
);

export const moveFollowUp = createAsyncThunk(
  'followups/move',
  async ({ followUpId, newStatus }: { followUpId: string; newStatus: FollowUpStatus }, { rejectWithValue }) => {
    try {
      const { data } = await followupsApi.update(followUpId, { status: newStatus } as any);
      return data.data as FollowUp;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update follow-up');
    }
  },
);

export const addFollowUp = createAsyncThunk(
  'followups/add',
  async (followUpData: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const { data } = await followupsApi.create(followUpData);
      return data.data as FollowUp;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create follow-up');
    }
  },
);

const followupsSlice = createSlice({
  name: 'followups',
  initialState,
  reducers: {
    setViewMode(state, action: PayloadAction<'kanban' | 'table'>) {
      state.viewMode = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowUps.pending, (state) => { state.loading = true; })
      .addCase(fetchFollowUps.fulfilled, (state, action) => { state.loading = false; state.followUps = action.payload; })
      .addCase(fetchFollowUps.rejected, (state) => { state.loading = false; })
      .addCase(moveFollowUp.pending, (state, action) => {
        const { followUpId, newStatus } = action.meta.arg;
        const followUp = state.followUps.find((f) => f.id === followUpId);
        if (followUp) followUp.status = newStatus;
      })
      .addCase(moveFollowUp.fulfilled, (state, action) => {
        const idx = state.followUps.findIndex((f) => f.id === action.payload.id);
        if (idx >= 0) state.followUps[idx] = action.payload;
      })
      .addCase(moveFollowUp.rejected, (state) => { state.loading = false; })
      .addCase(addFollowUp.fulfilled, (state, action) => { state.followUps.unshift(action.payload); });
  },
});

export const { setViewMode } = followupsSlice.actions;

export const selectFollowUpsByStatus = (status: FollowUpStatus) => (state: { followups: FollowUpsState }) =>
  state.followups.followUps.filter((f) => f.status === status);

export const selectAllFollowUps = (state: { followups: FollowUpsState }) =>
  state.followups.followUps;

export const { columns: FOLLOWUP_COLUMNS } = { columns };

export default followupsSlice.reducer;
