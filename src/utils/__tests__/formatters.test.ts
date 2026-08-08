import { describe, it, expect } from '@jest/globals';
import {
  getInitials,
  formatPhone,
  statusLabels,
  statusColors,
  statusChartColors,
} from '../formatters';

describe('getInitials', () => {
  it('returns the first letters of each word', () => {
    expect(getInitials('Maria Lopez')).toBe('ML');
  });

  it('handles a single name', () => {
    expect(getInitials('maria')).toBe('M');
  });

  it('only uses the first two words', () => {
    expect(getInitials('Maria De Lopez')).toBe('MD');
  });

  it('returns an empty string for an empty name', () => {
    expect(getInitials('')).toBe('');
  });
});

describe('formatPhone', () => {
  it('returns the phone number unchanged', () => {
    expect(formatPhone('+52 55 1234 5678')).toBe('+52 55 1234 5678');
  });
});

describe('status maps', () => {
  const expectedStatuses = [
    'pending_contact',
    'contacted',
    'order_received',
    'prepared',
    'delivered',
    'cancelled',
  ];

  it('statusLabels covers every status with a label', () => {
    expect(Object.keys(statusLabels).sort()).toEqual(expectedStatuses.sort());
    for (const s of expectedStatuses) {
      expect(statusLabels[s as keyof typeof statusLabels]).toBeTruthy();
    }
  });

  it('statusColors covers every status', () => {
    expect(Object.keys(statusColors).sort()).toEqual(expectedStatuses.sort());
    for (const s of expectedStatuses) {
      expect(statusColors[s as keyof typeof statusColors]).toMatch(/^bg-/);
    }
  });

  it('statusChartColors maps each status to its semantic color', () => {
    expect(Object.keys(statusChartColors).sort()).toEqual(expectedStatuses.sort());
    expect(statusChartColors.delivered).toBe('#22C55E');
    expect(statusChartColors.cancelled).toBe('#EF4444');
    expect(statusChartColors.prepared).toBe('#F97316');
    expect(statusChartColors.contacted).toBe('#3B82F6');
    expect(statusChartColors.pending_contact).toBe('#EAB308');
    expect(statusChartColors.order_received).toBe('#A855F7');
  });
});