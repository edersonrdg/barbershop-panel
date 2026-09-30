import type { Metadata } from 'next';
import { ApiErrorState } from '@/components/api-error-state';
import { PageHeader } from '@/components/page-header';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { isCalendarDate, todayIn } from '@/lib/datetime';
import { isUuid, single } from '@/lib/search-params';
import { BlockForm } from './block-form';

export const metadata: Metadata = { title: 'Bloquear horário' };

export default async function NewBlockPage({
  searchParams,
}: PageProps<'/agenda/bloqueio'>) {
  // Owner only for now: a barber cannot learn their own barber id from the
  // API yet (see README, pending items).
  const { barbershop } = await requireOwner();
  const params = await searchParams;
  const rawDate = single(params.date);
  const date =
    rawDate && isCalendarDate(rawDate) ? rawDate : todayIn(barbershop.timezone);
  const rawBarber = single(params.barberId);

  const api = await createSessionApiClient();
  const { data, error } = await api.GET('/settings/barbers');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Bloquear horário"
        description="Horários bloqueados e folgas deixam de ser oferecidos."
        backHref={`/agenda?date=${date}`}
      />
      {data ? (
        <BlockForm
          barbers={data.barbers.filter((barber) => barber.active)}
          date={date}
          barberId={isUuid(rawBarber) ? rawBarber : undefined}
          timeZone={barbershop.timezone}
        />
      ) : (
        <ApiErrorState error={error} />
      )}
    </section>
  );
}
