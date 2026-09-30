import { describe, expect, it } from 'vitest';
import {
  addDays,
  datesBetween,
  formatDateTime,
  formatDayHeading,
  formatShortDate,
  formatTime,
  isCalendarDate,
  localDateOf,
  todayIn,
} from './datetime';

const SAO_PAULO = 'America/Sao_Paulo';

describe('isCalendarDate', () => {
  it('accepts real dates and rejects impossible or malformed ones', () => {
    expect(isCalendarDate('2026-09-28')).toBe(true);
    expect(isCalendarDate('2026-02-30')).toBe(false);
    expect(isCalendarDate('28/09/2026')).toBe(false);
    expect(isCalendarDate('')).toBe(false);
  });
});

describe('local dates in the barbershop timezone', () => {
  it('uses the barbershop day, not the UTC day', () => {
    // 01:30 UTC is still the previous evening in São Paulo (UTC-3).
    expect(localDateOf('2026-09-29T01:30:00.000Z', SAO_PAULO)).toBe(
      '2026-09-28',
    );
    expect(todayIn(SAO_PAULO, new Date('2026-09-29T02:59:00.000Z'))).toBe(
      '2026-09-28',
    );
    expect(
      todayIn('America/Manaus', new Date('2026-09-29T03:30:00.000Z')),
    ).toBe('2026-09-28');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2026-09-28', 7)).toBe('2026-10-05');
  });

  it('lists every day of an inclusive period', () => {
    expect(datesBetween('2026-09-28', '2026-10-01')).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
    ]);
  });
});

describe('display formats', () => {
  it('shows times and date-times in the barbershop timezone', () => {
    expect(formatTime('2026-09-28T13:00:00.000Z', SAO_PAULO)).toBe('10:00');
    expect(formatDateTime('2026-09-28T13:05:00.000Z', SAO_PAULO)).toBe(
      '28/09/2026, 10:05',
    );
  });

  it('shows local dates without shifting the day', () => {
    expect(formatDayHeading('2026-09-28')).toBe(
      'segunda-feira, 28 de setembro',
    );
    expect(formatShortDate('2026-10-04')).toBe('04/10');
  });
});
