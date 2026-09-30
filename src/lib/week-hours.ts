import type { FieldErrors } from '@/lib/api/errors';
import { WEEKDAYS, type Weekday } from '@/lib/weekdays';

// Neutral shape of a week of hours, shared by the barbershop opening hours
// (opensAt/closesAt) and the barber working hours (startsAt/endsAt). Each form
// maps it to the field names of its own route.
export interface TimeRange {
  start: string;
  end: string;
}

export interface DayHours extends TimeRange {
  break: TimeRange | null;
}

export type WeekHours = Record<Weekday, DayHours | null>;

export const weekFieldNames = (day: Weekday) => ({
  open: `${day}.open`,
  start: `${day}.start`,
  end: `${day}.end`,
  hasBreak: `${day}.hasBreak`,
  breakStart: `${day}.breakStart`,
  breakEnd: `${day}.breakEnd`,
});

// Converts each open day and keeps closed days as null, in both directions
// (API shape to form shape and back).
export function mapWeek<In, Out>(
  week: Record<Weekday, In | null>,
  toDay: (hours: In) => Out,
): Record<Weekday, Out | null> {
  const mapped = {} as Record<Weekday, Out | null>;
  for (const day of WEEKDAYS) {
    const hours = week[day];
    mapped[day] = hours === null ? null : toDay(hours);
  }
  return mapped;
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

// Times are sent as typed: the API validates the format and the order
// (e.g. CA-03.2, closing before opening), so the panel does not repeat it.
export function readWeekHours(formData: FormData): WeekHours {
  const week = {} as WeekHours;
  for (const day of WEEKDAYS) {
    const names = weekFieldNames(day);
    if (!formData.has(names.open)) {
      week[day] = null;
      continue;
    }
    week[day] = {
      start: text(formData, names.start),
      end: text(formData, names.end),
      break: formData.has(names.hasBreak)
        ? {
            start: text(formData, names.breakStart),
            end: text(formData, names.breakEnd),
          }
        : null,
    };
  }
  return week;
}

// API errors point at paths like `openingHours.monday.break.startsAt`; the
// form shows the first one of each day under that day.
export function weekErrors(
  fieldErrors: FieldErrors | undefined,
  prefix: string,
): Partial<Record<Weekday, string>> {
  const errors: Partial<Record<Weekday, string>> = {};
  for (const [field, message] of Object.entries(fieldErrors ?? {})) {
    const day = WEEKDAYS.find(
      (weekday) =>
        field === `${prefix}.${weekday}` ||
        field.startsWith(`${prefix}.${weekday}.`),
    );
    if (day) errors[day] ??= message;
  }
  return errors;
}
