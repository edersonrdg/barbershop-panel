import { AppointmentBadges } from '@/components/appointment-badges';
import { EmptyState } from '@/components/empty-state';
import type { ApiResponse } from '@/lib/api/types';
import { formatDateTime } from '@/lib/datetime';

type Appointment = ApiResponse<
  '/clients/{id}',
  'get'
>['pastAppointments'][number];

interface AppointmentListProps {
  title: string;
  appointments: Appointment[];
  timeZone: string;
  emptyMessage: string;
}

export function AppointmentList({
  title,
  appointments,
  timeZone,
  emptyMessage,
}: AppointmentListProps) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-medium">{title}</h2>
      {appointments.length === 0 ? (
        <EmptyState>{emptyMessage}</EmptyState>
      ) : (
        <ul className="flex flex-col divide-y rounded-xl border">
          {appointments.map((appointment) => (
            <li key={appointment.id} className="flex flex-col gap-1 px-4 py-3">
              <span className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium tabular-nums">
                  {formatDateTime(appointment.startsAt, timeZone)}
                </span>
                <AppointmentBadges
                  status={appointment.status}
                  origin={appointment.origin}
                />
              </span>
              <span className="text-sm text-muted-foreground">
                {appointment.services.map((s) => s.name).join(' + ')} ·{' '}
                {appointment.barber.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
