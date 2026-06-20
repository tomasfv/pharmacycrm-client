import type { PatientStatus } from './common';

export interface Patient {
  id: string;
  name: string;
  dni: string;
  phone: string;
  email: string;
  healthInsurance: string;
  memberNumber: string;
  status: PatientStatus;
  nextFollowUpDate: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
