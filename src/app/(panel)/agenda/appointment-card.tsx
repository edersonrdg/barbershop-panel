import Link from 'next/link';
import { ActionButton } from '@/components/action-button';
import { AppointmentBadges } from '@/components/appointment-badges';
import { formatTime } from '@/lib/datetime';
import { formatPhone } from '@/lib/phone';
import { markAttendance } from './actions';
import { hasStarted, type Appointment } from './schedule';

interface AppointmentCardProps {
  appointment: Appointment;
  timeZone: string;
  showBarber: boolean;
  now: Date;
}

// CA-08.3: client, services, time, status and origin of each appointment.
export function AppointmentCard({
  appointment,
  timeZone,
  showBarber,
  now,
}: AppointmentCardProps) {
  const { client, status } = appointment;
  const canMark = hasStarted(appointment, now);
  const fields = { appointmentId: appointment.id };

  return (
    <article className="flex flex-col gap-3 rounded-xl border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-sm font-semibold tabular-nums">
            {formatTime(appointment.startsAt, timeZone)} –{' '}
            {formatTime(appointment.endsAt, timeZone)}
          </p>
          {client ? (
            <Link
              href={`/clientes/${client.id}`}
              className="truncate font-medium underline-offset-4 hover:underline"
            >
              {client.name}
            </Link>
          ) : (
            <p className="font-medium text-muted-foreground">Sem cliente</p>
          )}
          {client && (
            <p className="text-sm text-muted-foreground">
              {formatPhone(client.phone)}
            </p>
          )}
        </div>
        <AppointmentBadges status={status} origin={appointment.origin} />
      </div>

      <p className="text-sm">
        {appointment.services.map((service) => service.name).join(' + ')}
        {showBarber && (
          <span className="text-muted-foreground">
            {' '}
            · {appointment.barber.name}
          </span>
        )}
      </p>

      {canMark && (
        <div className="grid grid-cols-2 gap-2">
          {status !== 'attended' && (
            <ActionButton
              action={markAttendance}
              fields={{ ...fields, status: 'attended' }}
              pendingLabel="Salvando…"
            >
              {status === 'no_show' ? 'Corrigir: atendido' : 'Atendido'}
            </ActionButton>
          )}
          {status !== 'no_show' && (
            <ActionButton
              action={markAttendance}
              fields={{ ...fields, status: 'no_show' }}
              variant="destructive"
              pendingLabel="Salvando…"
            >
              {status === 'attended' ? 'Corrigir: faltou' : 'Faltou'}
            </ActionButton>
          )}
        </div>
      )}
    </article>
  );
}
