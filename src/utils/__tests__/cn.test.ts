import { describe, it, expect } from '@jest/globals';
import { cn } from '../cn';

describe('cn', () => {
  it('joins class names with spaces', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, null, undefined, 0, 'b')).toBe('a b');
  });

  it('merges conflicting tailwind classes keeping the last', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles conditional objects', () => {
    expect(cn('base', { active: true, 'inactive': false })).toBe('base active');
  });
});