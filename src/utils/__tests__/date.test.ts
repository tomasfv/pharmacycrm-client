import { describe, it, expect } from '@jest/globals';
import {
  formatDate,
  formatDateTime,
  isOverdue,
  daysUntil,
  isToday,
  getLocalDateString,
  getLocalDateDaysFromNow,
} from '../date';

describe('formatDate', () => {
  it('formats a YYYY-MM-DD string', () => {
    expect(formatDate('2026-08-08')).toBe('Aug 8, 2026');
  });

  it('formats an ISO datetime string', () => {
    const result = formatDate('2026-08-08T10:30:00.000Z');
    expect(result).toContain('2026');
    expect(result).toMatch(/Aug/);
  });
});

describe('formatDateTime', () => {
  it('includes date with time', () => {
    const result = formatDateTime('2026-08-08T10:30:00');
    expect(result).toContain('2026');
    expect(result).toMatch(/Aug 8/);
    expect(result).toContain(':');
  });

  it('formats a YYYY-MM-DD string with midnight default', () => {
    const result = formatDateTime('2026-08-08');
    expect(result).toMatch(/Aug 8/);
  });
});

describe('isOverdue', () => {
  it('returns true for a past date', () => {
    expect(isOverdue(getLocalDateDaysFromNow(-1))).toBe(true);
  });

  it('returns false for today', () => {
    expect(isOverdue(getLocalDateString())).toBe(false);
  });

  it('returns false for a future date', () => {
    expect(isOverdue(getLocalDateDaysFromNow(1))).toBe(false);
  });
});

describe('daysUntil', () => {
  it('returns negative for a past date', () => {
    expect(daysUntil(getLocalDateDaysFromNow(-1))).toBe(-1);
  });

  it('returns 0 for today', () => {
    expect(daysUntil(getLocalDateString())).toBe(0);
  });

  it('returns positive for a future date', () => {
    expect(daysUntil(getLocalDateDaysFromNow(1))).toBe(1);
  });
});

describe('isToday', () => {
  it('returns true for today', () => {
    expect(isToday(getLocalDateString())).toBe(true);
  });

  it('returns false for a future date', () => {
    expect(isToday(getLocalDateDaysFromNow(1))).toBe(false);
  });
});

describe('getLocalDateString', () => {
  it('returns a date in YYYY-MM-DD format', () => {
    expect(getLocalDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('getLocalDateDaysFromNow', () => {
  it('returns a YYYY-MM-DD date offset by days', () => {
    const today = getLocalDateString();
    expect(getLocalDateDaysFromNow(1)).not.toBe(today);
    expect(getLocalDateDaysFromNow(0)).toBe(today);
  });
});