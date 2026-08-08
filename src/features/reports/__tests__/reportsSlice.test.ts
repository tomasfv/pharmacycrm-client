import { describe, it, expect } from '@jest/globals';
import { selectReportsData } from '../reportsSlice';
import { getLocalDateDaysFromNow, getLocalDateString } from '@/utils';

describe('selectReportsData', () => {
  it('computes KPIs excluding cancelled and delivered follow-ups', () => {
    const yesterday = getLocalDateDaysFromNow(-1);
    const today = getLocalDateString();
    const tomorrow = getLocalDateDaysFromNow(1);

    const cancelledOrderId = 'order-cancelled';
    const activeOrderId = 'order-active';

    const state = {
      patients: {
        patients: [
          { id: 'p1', status: 'active', createdAt: `${new Date().getFullYear()}-01-15T10:00:00.000Z` },
          { id: 'p2', status: 'active', createdAt: new Date().toISOString() },
          { id: 'p3', status: 'inactive', createdAt: new Date().toISOString() },
        ],
      },
      orders: {
        orders: [
          { id: activeOrderId, nextPickupDate: yesterday },
          { id: cancelledOrderId, nextPickupDate: yesterday },
          { id: 'order-1', nextPickupDate: tomorrow },
          { id: 'order-2', nextPickupDate: yesterday },
          { id: 'order-3', nextPickupDate: null },
          { id: 'order-4', nextPickupDate: tomorrow },
          { id: 'order-5', nextPickupDate: yesterday },
        ],
      },
      followups: {
        followUps: [
          { patientId: 'p1', status: 'pending_contact', orderId: 'order-2', scheduledDate: yesterday },
          { patientId: 'p2', status: 'order_received', orderId: activeOrderId, scheduledDate: yesterday },
          { patientId: 'p3', status: 'cancelled', orderId: cancelledOrderId, scheduledDate: yesterday },
          { patientId: 'p4', status: 'delivered', orderId: 'order-1', scheduledDate: yesterday },
          { patientId: 'p5', status: 'prepared', orderId: 'order-3', scheduledDate: today },
          { patientId: 'p6', status: 'contacted', orderId: 'order-4', scheduledDate: tomorrow },
        ],
      },
    };

    const result = selectReportsData(state);

    expect(result.activePatients).toBe(2);
    expect(result.activeOrders).toBe(6);
    expect(result.overduePatients).toBe(2);
    expect(result.patientsThisMonth).toBe(2);
    expect(result.statusDistribution).toEqual([
      { status: 'pending_contact', count: 1 },
      { status: 'contacted', count: 1 },
      { status: 'order_received', count: 1 },
      { status: 'prepared', count: 1 },
      { status: 'delivered', count: 1 },
      { status: 'cancelled', count: 1 },
    ]);
  });
});