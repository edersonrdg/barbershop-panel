import { BanIcon, PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ApiErrorState } from '@/components/api-error-state';
import { EmptyState } from '@/components/empty-state';
import { buttonVariants } from '@/components/ui/button';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireAccount } from '@/lib/auth/current-account';
import { datesBetween, formatDayHeading, todayIn } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import { AppointmentCard } from './appointment-card';
import { BarberFilter } from './barber-filter';
import { BlockCard } from './block-card';
import { groupByDay, parseScheduleQuery } from './schedule';
import { ScheduleToolbar } from './schedule-toolbar';

export const metadata: Metadata = { title: 'Agenda' };

// US-08: the API decides what each profile sees (CA-08.2: a barber only gets
// their own appointments); the panel just lists it by day.
export default async function SchedulePage({
  searchParams,
}: PageProps<'/agenda'>) {
  const { user, barbershop } = await requireAccount();
  const isOwner = user.role === 'owner';
  const timeZone = barbershop.timezone;
  const now = new Date();
  const query = parseScheduleQuery(await searchParams, timeZone, now);
  const params = { query: { ...query } };

  const api = await createSessionApiClient();
  const [appointments, blocks, barbers] = await Promise.all([
    api.GET('/appointments', { params }),
    api.GET('/blocks', { params }),
    isOwner ? api.GET('/settings/barbers') : null,
  ]);

  const activeBarbers =
    barbers?.data?.barbers.filter((barber) => barber.active) ?? [];
  const showBarber = isOwner && !query.barberId;
  // New appointments and blocks start from the day (and barber) on screen.
  const createParams = new URLSearchParams({ date: query.date });
  if (query.barberId) createParams.set('barberId', query.barberId);

  return (
    <section className="flex flex-col gap-5">
      <h1 className="sr-only">Agenda</h1>
      <ScheduleToolbar
        query={query}
        today={todayIn(timeZone, now)}
        startDate={appointments.data?.startDate ?? query.date}
        endDate={appointments.data?.endDate ?? query.date}
      />
      {isOwner && activeBarbers.length > 0 && (
        <BarberFilter query={query} barbers={activeBarbers} />
      )}

      {/* Creating needs the services list and the barber id, which the API
          only exposes to the owner for now (see README, pending items). */}
      {isOwner && (
        <div className="grid grid-cols-2 gap-2">
          <Link
            href={`/agenda/novo?${createParams}`}
            className={cn(buttonVariants(), 'h-12 text-base')}
          >
            <PlusIcon />
            Agendar
          </Link>
          <Link
            href={`/agenda/bloqueio?${createParams}`}
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-12 text-base',
            )}
          >
            <BanIcon />
            Bloquear
          </Link>
        </div>
      )}

      {!appointments.data || !blocks.data ? (
        <ApiErrorState error={appointments.error ?? blocks.error} />
      ) : (
        groupByDay(
          datesBetween(appointments.data.startDate, appointments.data.endDate),
          appointments.data.appointments,
          blocks.data.blocks,
          timeZone,
        ).map((day) => (
          <div key={day.date} className="flex flex-col gap-2">
            {query.view === 'week' && (
              <h2 className="text-sm font-medium text-muted-foreground first-letter:uppercase">
                {formatDayHeading(day.date)}
              </h2>
            )}
            {day.items.length === 0 ? (
              <EmptyState>Nenhum agendamento.</EmptyState>
            ) : (
              day.items.map((item) =>
                item.kind === 'appointment' ? (
                  <AppointmentCard
                    key={item.appointment.id}
                    appointment={item.appointment}
                    timeZone={timeZone}
                    showBarber={showBarber}
                    now={now}
                  />
                ) : (
                  <BlockCard
                    key={item.block.id}
                    block={item.block}
                    timeZone={timeZone}
                    showBarber={showBarber}
                  />
                ),
              )
            )}
          </div>
        ))
      )}
    </section>
  );
}
