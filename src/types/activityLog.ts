export interface ActivityLog {
  id: string;
  patientId: string;
  type: 'patient_registered' | 'order_created' | 'order_picked_up' | 'follow_up_status_changed';
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
