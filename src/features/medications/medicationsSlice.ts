import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { medicationsApi } from '@/api/medications';
import type { Medication } from '@/types';

interface MedicationsState {
  medications: Medication[];
  loading: boolean;
  error: string | null;
}

const initialState: MedicationsState = {
  medications: [],
  loading: false,
  error: null,
};

export const fetchMedications = createAsyncThunk(
  'medications/fetchMedications',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await medicationsApi.getAll();
      return data.data as Medication[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch medications');
    }
  },
);

export const addMedication = createAsyncThunk(
  'medications/addMedication',
  async (medicationData: Omit<Medication, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const { data } = await medicationsApi.create(medicationData as Record<string, unknown>);
      return data.data as Medication;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create medication');
    }
  },
);

export const updateMedication = createAsyncThunk(
  'medications/updateMedication',
  async (medication: Medication, { rejectWithValue }) => {
    try {
      const { id, ...rest } = medication;
      const { data } = await medicationsApi.update(id, rest as Record<string, unknown>);
      return data.data as Medication;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update medication');
    }
  },
);

export const deleteMedication = createAsyncThunk(
  'medications/deleteMedication',
  async (id: string, { rejectWithValue }) => {
    try {
      await medicationsApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete medication');
    }
  },
);

const medicationsSlice = createSlice({
  name: 'medications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMedications.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMedications.fulfilled, (state, action) => { state.loading = false; state.medications = action.payload; })
      .addCase(fetchMedications.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(addMedication.fulfilled, (state, action) => { state.medications.unshift(action.payload); })
      .addCase(updateMedication.fulfilled, (state, action) => {
        const idx = state.medications.findIndex((m) => m.id === action.payload.id);
        if (idx >= 0) state.medications[idx] = action.payload;
      })
      .addCase(deleteMedication.fulfilled, (state, action) => {
        state.medications = state.medications.filter((m) => m.id !== action.payload);
      });
  },
});

export const selectMedicationOptions = (state: { medications: MedicationsState }) =>
  state.medications.medications.map((m) => ({ value: m.id, label: m.name }));

export default medicationsSlice.reducer;
