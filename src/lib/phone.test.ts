import { describe, expect, it } from 'vitest';
import { formatPhone } from './phone';

describe('formatPhone', () => {
  it('masks Brazilian mobile and landline numbers', () => {
    expect(formatPhone('+5511987654321')).toBe('(11) 98765-4321');
    expect(formatPhone('+551134567890')).toBe('(11) 3456-7890');
  });

  it('keeps anything else as it came', () => {
    expect(formatPhone('+14155550100')).toBe('+14155550100');
  });
});
