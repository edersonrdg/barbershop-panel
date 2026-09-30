import { describe, expect, it } from 'vitest';
import {
  groupByDay,
  hasStarted,
  parseScheduleQuery,
  scheduleHref,
  shiftDate,
  type Appointment,
  type Block,
} from './schedule';

const TZ = 'America/Sao_Paulo';
const NOW = new Date('2026-09-30T15:00:00.000Z');
const BARBER_ID = '7d3c2f7e-5b1a-4c8e-9f2d-1a2b3c4d5e6f';

function appointment(id: string, startsAt: string): Appointment {
  return {
    id,
    barber: { id: BARBER_ID, name: 'Ana' },
    client: { id: 'c1', name: 'João', phone: '+5511987654321' },
    services: [{ id: 's1', name: 'Corte' }],
    startsAt,
    endsAt: startsAt,
    status: 'confirmed',
    origin: 'manual',
  };
}

function block(id: string, startsAt: string, kind: Block['kind']): Block {
  return {
    id,
    barber: { id: BARBER_ID, name: 'Ana' },
    kind,
    startsAt,
    endsAt: startsAt,
    reason: null,
  };
}

describe('parseScheduleQuery', () => {
  it('defaults to today in the barbershop timezone, day view', () => {
    expect(parseScheduleQuery({}, TZ, NOW)).toEqual({
      view: 'day',
      date: '2026-09-30',
      barberId: undefined,
    });
  });

  it('keeps a valid view, date and barber filter', () => {
    expect(
      parseScheduleQuery(
        { view: 'week', date: '2026-10-05', barberId: BARBER_ID },
        TZ,
        NOW,
      ),
    ).toEqual({ view: 'week', date: '2026-10-05', barberId: BARBER_ID });
  });

  it('ignores invalid values instead of sending them to the API', () => {
    expect(
      parseScheduleQuery(
        { view: 'month', date: '2026-02-30', barberId: 'abc' },
        TZ,
        NOW,
      ),
    ).toEqual({ view: 'day', date: '2026-09-30', barberId: undefined });
  });
});

describe('navigation', () => {
  it('moves one day or one week and builds the link', () => {
    const day = { view: 'day' as const, date: '2026-09-30' };
    const week = { view: 'week' as const, date: '2026-09-30' };
    expect(shiftDate(day, 1)).toBe('2026-10-01');
    expect(shiftDate(week, -1)).toBe('2026-09-23');
    expect(scheduleHref({ ...week, barberId: BARBER_ID })).toBe(
      `/agenda?view=week&date=2026-09-30&barberId=${BARBER_ID}`,
    );
  });
});

describe('groupByDay (CA-08.1)', () => {
  it('puts each item on its local day, in time order, blocks included', () => {
    const late = appointment('a2', '2026-09-30T20:00:00.000Z');
    const early = appointment('a1', '2026-09-30T12:00:00.000Z');
    // 01:00 UTC on Oct 1st is still Sep 30th in São Paulo.
    const night = appointment('a3', '2026-10-01T01:00:00.000Z');
    const lunch = block('b1', '2026-09-30T15:00:00.000Z', 'block');
    const dayOff = block('b2', '2026-10-01T03:00:00.000Z', 'day_off');

    const days = groupByDay(
      ['2026-09-30', '2026-10-01'],
      [late, early, night],
      [lunch, dayOff],
      TZ,
    );

    expect(days[0].items.map((item) => item.startsAt)).toEqual([
      early.startsAt,
      lunch.startsAt,
      late.startsAt,
      night.startsAt,
    ]);
    expect(days[1].items).toEqual([
      { kind: 'block', startsAt: dayOff.startsAt, block: dayOff },
    ]);
  });
});

describe('hasStarted (CA-11.1)', () => {
  it('offers attendance only after the start time', () => {
    expect(hasStarted(appointment('a', '2026-09-30T14:59:00.000Z'), NOW)).toBe(
      true,
    );
    expect(hasStarted(appointment('a', '2026-09-30T15:30:00.000Z'), NOW)).toBe(
      false,
    );
  });
});
