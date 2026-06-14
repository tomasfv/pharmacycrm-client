import type { FollowUpStatus } from './common';

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  treatmentId: string;
  medication: string;
  status: FollowUpStatus;
  scheduledDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
