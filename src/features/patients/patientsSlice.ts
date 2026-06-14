import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { patientsApi } from '@/api/patients';
import type { Patient } from '@/types';

interface PatientsState {
  patients: Patient[];
  selectedPatient: Patient | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: string;
}

const initialState: PatientsState = {
  patients: [],
  selectedPatient: null,
  loading: false,
  error: null,
  searchQuery: '',
  statusFilter: '',
};

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await patientsApi.getAll();
      return data.data as Patient[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch patients');
    }
  },
);

export const fetchPatientById = createAsyncThunk(
  'patients/fetchPatientById',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await patientsApi.getById(id);
      return data.data as Patient;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch patient');
    }
  },
);

export const addPatient = createAsyncThunk(
  'patients/addPatient',
  async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const { data } = await patientsApi.create(patientData as Record<string, unknown>);
      return data.data as Patient;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create patient');
    }
  },
);

export const updatePatientAsync = createAsyncThunk(
  'patients/updatePatient',
  async ({ id, data: patientData }: { id: string; data: Partial<Patient> }, { rejectWithValue }) => {
    try {
      const { data } = await patientsApi.update(id, patientData as Record<string, unknown>);
      return data.data as Patient;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update patient');
    }
  },
);

export const deletePatient = createAsyncThunk(
  'patients/deletePatient',
  async (id: string, { rejectWithValue }) => {
    try {
      await patientsApi.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete patient');
    }
  },
);

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setStatusFilter(state, action: PayloadAction<string>) {
      state.statusFilter = action.payload;
    },
    selectPatient(state, action: PayloadAction<string>) {
      state.selectedPatient = state.patients.find((p) => p.id === action.payload) || null;
    },
    clearSelectedPatient(state) {
      state.selectedPatient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchPatients.fulfilled, (state, action) => { state.loading = false; state.patients = action.payload; })
      .addCase(fetchPatients.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(fetchPatientById.pending, (state) => { state.loading = true; })
      .addCase(fetchPatientById.fulfilled, (state, action) => { state.loading = false; state.selectedPatient = action.payload; })
      .addCase(fetchPatientById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })
      .addCase(addPatient.fulfilled, (state, action) => { state.patients.unshift(action.payload); })
      .addCase(updatePatientAsync.fulfilled, (state, action) => {
        const idx = state.patients.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.patients[idx] = action.payload;
      })
      .addCase(deletePatient.fulfilled, (state, action) => {
        state.patients = state.patients.filter((p) => p.id !== action.payload);
      });
  },
});

export const { setSearchQuery, setStatusFilter, selectPatient, clearSelectedPatient } = patientsSlice.actions;

export const selectFilteredPatients = (state: { patients: PatientsState }) => {
  const { patients, searchQuery, statusFilter } = state.patients;
  return patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(q) ||
      p.dni.toLowerCase().includes(q) ||
      p.phone.includes(searchQuery) ||
      p.memberNumber.toLowerCase().includes(q);
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

export default patientsSlice.reducer;
