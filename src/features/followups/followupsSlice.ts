import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { FollowUp, FollowUpStatus } from '@/types';
import { mockFollowUps } from '@/mock';

interface FollowUpsState {
  followUps: FollowUp[];
  loading: boolean;
  viewMode: 'kanban' | 'table';
}

const columns: FollowUpStatus[] = [
  'pending_contact',
  'contacted',
  'prescription_received',
  'prepared',
  'delivered',
];

const initialState: FollowUpsState = {
  followUps: mockFollowUps,
  loading: false,
  viewMode: 'kanban',
};

const followupsSlice = createSlice({
  name: 'followups',
  initialState,
  reducers: {
    moveFollowUp(
      state,
      action: PayloadAction<{
        followUpId: string;
        newStatus: FollowUpStatus;
      }>,
    ) {
      const followUp = state.followUps.find(
        (f) => f.id === action.payload.followUpId,
      );
      if (followUp) {
        followUp.status = action.payload.newStatus;
        followUp.updatedAt = new Date().toISOString();
      }
    },
    setViewMode(state, action: PayloadAction<'kanban' | 'table'>) {
      state.viewMode = action.payload;
    },
    addFollowUp(state, action: PayloadAction<FollowUp>) {
      state.followUps.unshift(action.payload);
    },
  },
});

export const { moveFollowUp, setViewMode, addFollowUp } = followupsSlice.actions;

export const selectFollowUpsByStatus = (status: FollowUpStatus) => (state: { followups: FollowUpsState }) =>
  state.followups.followUps.filter((f) => f.status === status);

export const selectAllFollowUps = (state: { followups: FollowUpsState }) =>
  state.followups.followUps;

export const { columns: FOLLOWUP_COLUMNS } = { columns };

export default followupsSlice.reducer;
