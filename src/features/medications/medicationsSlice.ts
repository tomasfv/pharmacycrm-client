import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { mockMedications } from '@/mock';
import type { Medication } from '@/types';

interface MedicationsState {
  medications: Medication[];
}

const initialState: MedicationsState = {
  medications: mockMedications,
};

const medicationsSlice = createSlice({
  name: 'medications',
  initialState,
  reducers: {
    addMedication(state, action: PayloadAction<Medication>) {
      state.medications.unshift(action.payload);
    },
    updateMedication(state, action: PayloadAction<Medication>) {
      const idx = state.medications.findIndex((m) => m.id === action.payload.id);
      if (idx >= 0) state.medications[idx] = action.payload;
    },
    deleteMedication(state, action: PayloadAction<string>) {
      state.medications = state.medications.filter((m) => m.id !== action.payload);
    },
  },
});

export const { addMedication, updateMedication, deleteMedication } = medicationsSlice.actions;

export const selectMedicationOptions = (state: { medications: MedicationsState }) =>
  state.medications.medications.map((m) => ({ value: m.id, label: m.name }));

export default medicationsSlice.reducer;
