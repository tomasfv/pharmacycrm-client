import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { prescriptionsApi } from '@/api/prescriptions';
import type { Prescription } from '@/types';

interface PrescriptionsState {
  prescriptions: Prescription[];
  loading: boolean;
  error: string | null;
}

const initialState: PrescriptionsState = {
  prescriptions: [],
  loading: false,
  error: null,
};

export const fetchPrescriptions = createAsyncThunk<Prescription[], string | undefined>(
  'prescriptions/fetchPrescriptions',
  async (patientId, { rejectWithValue }) => {
    try {
      const { data } = await prescriptionsApi.getByPatientId(patientId ?? '');
      return data.data as Prescription[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch prescriptions');
    }
  },
);

export const addPrescription = createAsyncThunk(
  'prescriptions/addPrescription',
  async (prescriptionData: Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const { data } = await prescriptionsApi.create(prescriptionData as Record<string, unknown>);
      return data.data as Prescription;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create prescription');
    }
  },
);

const prescriptionsSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptions.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => { state.loading = false; state.prescriptions = action.payload; })
      .addCase(fetchPrescriptions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(addPrescription.fulfilled, (state, action) => { state.prescriptions.unshift(action.payload); });
  },
});

export default prescriptionsSlice.reducer;
