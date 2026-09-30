import { describe, expect, it } from 'vitest';
import { mapWeek, readWeekHours, weekErrors } from './week-hours';

describe('readWeekHours', () => {
  it('reads open days, breaks and closed days from the form', () => {
    const formData = new FormData();
    formData.append('monday.open', 'on');
    formData.append('monday.start', '09:00');
    formData.append('monday.end', '19:00');
    formData.append('monday.hasBreak', 'on');
    formData.append('monday.breakStart', '12:00');
    formData.append('monday.breakEnd', '13:00');
    formData.append('tuesday.open', 'on');
    formData.append('tuesday.start', '10:00');
    formData.append('tuesday.end', '18:00');
    // Break times left in the form are ignored without the checkbox.
    formData.append('tuesday.breakStart', '12:00');
    // Sunday times without the "open" checkbox mean closed.
    formData.append('sunday.start', '09:00');

    const week = readWeekHours(formData);

    expect(week.monday).toEqual({
      start: '09:00',
      end: '19:00',
      break: { start: '12:00', end: '13:00' },
    });
    expect(week.tuesday).toEqual({ start: '10:00', end: '18:00', break: null });
    expect(week.wednesday).toBeNull();
    expect(week.sunday).toBeNull();
  });
});

describe('mapWeek', () => {
  it('maps open days and keeps closed days as null', () => {
    const week = {
      monday: { opensAt: '09:00', closesAt: '18:00' },
      tuesday: null,
      wednesday: null,
      thursday: null,
      friday: null,
      saturday: { opensAt: '08:00', closesAt: '12:00' },
      sunday: null,
    };

    const mapped = mapWeek(week, (day) => `${day.opensAt}-${day.closesAt}`);

    expect(mapped.monday).toBe('09:00-18:00');
    expect(mapped.saturday).toBe('08:00-12:00');
    expect(mapped.tuesday).toBeNull();
  });
});

describe('weekErrors', () => {
  it('groups API field errors by day under the route prefix', () => {
    expect(
      weekErrors(
        {
          name: 'Nome curto.',
          'openingHours.monday.closesAt':
            'O fechamento deve ser depois da abertura.',
          'openingHours.monday.break.startsAt': 'Intervalo inválido.',
          'openingHours.friday': 'Informe o horário do dia.',
          'workingHours.tuesday.startsAt': 'Outro prefixo.',
        },
        'openingHours',
      ),
    ).toEqual({
      monday: 'O fechamento deve ser depois da abertura.',
      friday: 'Informe o horário do dia.',
    });
  });
});
