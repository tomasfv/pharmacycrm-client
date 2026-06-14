import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { mockPrescriptions } from '@/mock';
import type { Prescription } from '@/types';

interface PrescriptionsState {
  prescriptions: Prescription[];
}

const initialState: PrescriptionsState = {
  prescriptions: mockPrescriptions,
};

const prescriptionsSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {
    addPrescription(state, action: PayloadAction<Prescription>) {
      state.prescriptions.unshift(action.payload);
    },
  },
});

export const { addPrescription } = prescriptionsSlice.actions;

export default prescriptionsSlice.reducer;
