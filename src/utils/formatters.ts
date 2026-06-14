import type { FollowUpStatus } from '@/types';

export const statusLabels: Record<FollowUpStatus, string> = {
  pending_contact: 'Pending Contact',
  contacted: 'Contacted',
  prescription_received: 'Prescription Received',
  prepared: 'Prepared',
  delivered: 'Delivered',
};

export const statusColors: Record<FollowUpStatus, string> = {
  pending_contact: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  prescription_received: 'bg-purple-100 text-purple-800',
  prepared: 'bg-orange-100 text-orange-800',
  delivered: 'bg-primary-100 text-primary-800',
};

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function formatPhone(phone: string): string {
  return phone;
}
