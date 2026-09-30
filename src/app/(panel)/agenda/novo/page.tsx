import type { Metadata } from 'next';
import Form from 'next/form';
import { ApiErrorState } from '@/components/api-error-state';
import { CheckboxField } from '@/components/checkbox-field';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { SelectField } from '@/components/select-field';
import { TextField } from '@/components/text-field';
import { Button } from '@/components/ui/button';
import { NativeSelectOption } from '@/components/ui/native-select';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { formatDayHeading, isCalendarDate, todayIn } from '@/lib/datetime';
import { formatCents } from '@/lib/money';
import { isUuid, list, single } from '@/lib/search-params';
import { SlotForm } from './slot-form';

export const metadata: Metadata = { title: 'Novo agendamento' };

// Step 1 (GET form): services, barber and day live in the URL. Step 2: the
// API's free slots for that choice, then the client. The panel never computes
// availability (US-07).
export default async function NewAppointmentPage({
  searchParams,
}: PageProps<'/agenda/novo'>) {
  // Owner only for now: a barber cannot list services nor learn their own
  // barber id from the API yet (see README, pending items).
  const { barbershop } = await requireOwner();
  const params = await searchParams;
  const rawDate = single(params.date);
  const date =
    rawDate && isCalendarDate(rawDate) ? rawDate : todayIn(barbershop.timezone);
  const serviceIds = list(params.serviceIds).filter(isUuid);
  const rawBarber = single(params.barberId);
  const barberId = isUuid(rawBarber) ? rawBarber : undefined;

  const api = await createSessionApiClient();
  const [services, barbers, slots] = await Promise.all([
    api.GET('/settings/services'),
    api.GET('/settings/barbers'),
    serviceIds.length > 0
      ? api.GET('/appointments/available-slots', {
          params: {
            query: { date, serviceIds: serviceIds.join(','), barberId },
          },
        })
      : null,
  ]);

  if (!services.data || !barbers.data) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Novo agendamento" backHref="/agenda" />
        <ApiErrorState error={services.error ?? barbers.error} />
      </section>
    );
  }

  const activeServices = services.data.services.filter((s) => s.active);
  const activeBarbers = barbers.data.barbers.filter((b) => b.active);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Novo agendamento"
        description="Para quem liga ou chega na hora. Os horários vêm da mesma regra do assistente."
        backHref={`/agenda?date=${date}`}
      />

      <Form action="/agenda/novo" className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-sm font-medium">Serviços</legend>
          {activeServices.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Cadastre serviços em Ajustes para agendar.
            </p>
          )}
          {activeServices.map((service) => (
            <CheckboxField
              key={service.id}
              name="serviceIds"
              value={service.id}
              defaultChecked={serviceIds.includes(service.id)}
              label={service.name}
              description={`${formatCents(service.priceCents)} · ${service.durationMinutes} min`}
            />
          ))}
        </fieldset>
        <SelectField
          name="barberId"
          label="Barbeiro"
          defaultValue={barberId ?? ''}
        >
          <NativeSelectOption value="">Qualquer barbeiro</NativeSelectOption>
          {activeBarbers.map((barber) => (
            <NativeSelectOption key={barber.id} value={barber.id}>
              {barber.name}
            </NativeSelectOption>
          ))}
        </SelectField>
        <TextField name="date" label="Dia" type="date" defaultValue={date} />
        <Button type="submit" variant="outline" className="h-12 text-base">
          Ver horários livres
        </Button>
      </Form>

      {slots && !slots.data && <ApiErrorState error={slots.error} />}
      {slots?.data && (
        <div className="flex flex-col gap-4 border-t pt-6">
          <h2 className="font-medium first-letter:uppercase">
            {formatDayHeading(slots.data.date)}
          </h2>
          {slots.data.slots.length === 0 ? (
            <EmptyState>
              Nenhum horário livre nesse dia para os serviços escolhidos. Tente
              outro dia ou outro barbeiro.
            </EmptyState>
          ) : (
            <SlotForm
              key={[date, barberId, ...serviceIds].join('|')}
              date={slots.data.date}
              serviceIds={serviceIds}
              available={slots.data}
              showBarber={!barberId}
            />
          )}
        </div>
      )}
    </section>
  );
}
