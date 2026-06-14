import type { NotificationType } from './common';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  patientId?: string;
  read: boolean;
  createdAt: string;
}
