import type { ApiResponse } from '@/lib/api/types';

export type Weekday = keyof ApiResponse<
  '/settings/barbershop',
  'get'
>['openingHours'];

// Monday first, like the API's week (US-08).
export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const satisfies readonly Weekday[];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};
