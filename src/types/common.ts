export type FollowUpStatus =
  | 'pending_contact'
  | 'contacted'
  | 'order_received'
  | 'prepared'
  | 'delivered';

export type PatientStatus = 'active' | 'inactive';

export type NotificationType = 'contact_today' | 'overdue_followup' | 'upcoming_pickup';

export type ContactCategory = 'supplier' | 'delivery' | 'doctor' | 'lab' | 'other';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
