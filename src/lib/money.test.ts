import { describe, expect, it } from 'vitest';
import { centsToInput, formatCents, parseReaisToCents } from './money';

describe('formatCents', () => {
  it('shows cents as BRL', () => {
    expect(formatCents(4550)).toBe('R$ 45,50');
    expect(formatCents(123456)).toBe('R$ 1.234,56');
    expect(formatCents(0)).toBe('R$ 0,00');
  });
});

describe('centsToInput', () => {
  it('fills the price field with a comma decimal', () => {
    expect(centsToInput(4550)).toBe('45,50');
    expect(centsToInput(4505)).toBe('45,05');
    expect(centsToInput(7)).toBe('0,07');
  });
});

describe('parseReaisToCents', () => {
  it.each([
    ['45', 4500],
    ['45,5', 4550],
    ['45,50', 4550],
    ['R$ 45,50', 4550],
    ['1.234,56', 123456],
    ['1.234', 123400],
    ['45.50', 4550],
    ['0,07', 7],
    ['0', 0],
  ])('reads %s as %i cents', (input, cents) => {
    expect(parseReaisToCents(input)).toBe(cents);
  });

  it.each(['', 'abc', '-10', '45,555', '1,2,3', '12.34.5'])(
    'rejects %s',
    (input) => {
      expect(parseReaisToCents(input)).toBeNull();
    },
  );
});
