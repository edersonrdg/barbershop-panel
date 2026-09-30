import type { ApiResponse } from '@/lib/api/types';
import { addDays, isCalendarDate, localDateOf, todayIn } from '@/lib/datetime';
import { isUuid, single } from '@/lib/search-params';

export type ScheduleView = 'day' | 'week';
export type Appointment = ApiResponse<
  '/appointments',
  'get'
>['appointments'][number];
export type Block = ApiResponse<'/blocks', 'get'>['blocks'][number];

export interface ScheduleQuery {
  view: ScheduleView;
  date: string;
  barberId?: string;
}

// Anything odd in the URL falls back to today's day view instead of an API
// validation error.
export function parseScheduleQuery(
  searchParams: Record<string, string | string[] | undefined>,
  timeZone: string,
  now: Date = new Date(),
): ScheduleQuery {
  const view = single(searchParams.view) === 'week' ? 'week' : 'day';
  const rawDate = single(searchParams.date);
  const date =
    rawDate && isCalendarDate(rawDate) ? rawDate : todayIn(timeZone, now);
  const rawBarber = single(searchParams.barberId);
  const barberId = isUuid(rawBarber) ? rawBarber : undefined;
  return { view, date, barberId };
}

export function scheduleHref(query: ScheduleQuery): string {
  const params = new URLSearchParams({ view: query.view, date: query.date });
  if (query.barberId) params.set('barberId', query.barberId);
  return `/agenda?${params}`;
}

export function shiftDate(query: ScheduleQuery, direction: 1 | -1): string {
  return addDays(query.date, direction * (query.view === 'week' ? 7 : 1));
}

export type ScheduleItem =
  | { kind: 'appointment'; startsAt: string; appointment: Appointment }
  | { kind: 'block'; startsAt: string; block: Block };

export interface ScheduleDay {
  date: string;
  items: ScheduleItem[];
}

// Groups what the API returned by local day of the barbershop, in time order,
// with a day-off (whole day) before the timed items of the same start.
export function groupByDay(
  dates: string[],
  appointments: Appointment[],
  blocks: Block[],
  timeZone: string,
): ScheduleDay[] {
  const items: ScheduleItem[] = [
    ...blocks.map((block) => ({
      kind: 'block' as const,
      startsAt: block.startsAt,
      block,
    })),
    ...appointments.map((appointment) => ({
      kind: 'appointment' as const,
      startsAt: appointment.startsAt,
      appointment,
    })),
  ].sort((a, b) => a.startsAt.localeCompare(b.startsAt));

  return dates.map((date) => ({
    date,
    items: items.filter(
      (item) => localDateOf(item.startsAt, timeZone) === date,
    ),
  }));
}

// Attendance only applies once the appointment started (RF-27). The API
// enforces it (422); this only avoids offering a button that will fail.
export function hasStarted(appointment: Appointment, now: Date): boolean {
  return new Date(appointment.startsAt).getTime() <= now.getTime();
}
