import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Patient } from '@/types';
import { mockPatients } from '@/mock';

interface PatientsState {
  patients: Patient[];
  selectedPatient: Patient | null;
  loading: boolean;
  searchQuery: string;
  statusFilter: string;
}

const initialState: PatientsState = {
  patients: mockPatients,
  selectedPatient: null,
  loading: false,
  searchQuery: '',
  statusFilter: '',
};

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
      state.selectedPatient =
        state.patients.find((p) => p.id === action.payload) || null;
    },
    clearSelectedPatient(state) {
      state.selectedPatient = null;
    },
    deletePatient(state, action: PayloadAction<string>) {
      state.patients = state.patients.filter((p) => p.id !== action.payload);
    },
    updatePatient(state, action: PayloadAction<Patient>) {
      const idx = state.patients.findIndex((p) => p.id === action.payload.id);
      if (idx >= 0) {
        state.patients[idx] = action.payload;
      }
    },
    addPatient(state, action: PayloadAction<Patient>) {
      state.patients.unshift(action.payload);
    },
  },
});

export const {
  setSearchQuery,
  setStatusFilter,
  selectPatient,
  clearSelectedPatient,
  deletePatient,
  updatePatient,
  addPatient,
} = patientsSlice.actions;

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
    const matchesStatus =
      !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
};

export default patientsSlice.reducer;
