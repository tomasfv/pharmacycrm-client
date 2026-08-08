import type { FollowUpStatus } from '@/types';

export const statusLabels: Record<FollowUpStatus, string> = {
  pending_contact: 'Pending Contact',
  contacted: 'Contacted',
  order_received: 'Order Received',
  prepared: 'Prepared',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const statusColors: Record<FollowUpStatus, string> = {
  pending_contact: 'bg-yellow-100 text-yellow-800',
  contacted: 'bg-blue-100 text-blue-800',
  order_received: 'bg-purple-100 text-purple-800',
  prepared: 'bg-orange-100 text-orange-800',
  delivered: 'bg-primary-100 text-primary-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const statusChartColors: Record<FollowUpStatus, string> = {
  pending_contact: '#EAB308',
  contacted: '#3B82F6',
  order_received: '#A855F7',
  prepared: '#F97316',
  delivered: '#22C55E',
  cancelled: '#EF4444',
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
