import type { FollowUpStatus } from './common';

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  prescriptionId: string | null;
  medication: string;
  status: FollowUpStatus;
  scheduledDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
