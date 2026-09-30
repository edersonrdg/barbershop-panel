import type { Metadata } from 'next';
import { ApiErrorState } from '@/components/api-error-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireAccount } from '@/lib/auth/current-account';
import { formatPhone } from '@/lib/phone';
import { AppointmentList } from './appointment-list';

export const metadata: Metadata = { title: 'Cliente' };

// CA-12.2: history, upcoming, no-shows, block status, top services and return
// reminder. For a barber the API only returns their own appointments (CA-12.3).
export default async function ClientProfilePage({
  params,
}: PageProps<'/clientes/[id]'>) {
  await requireAccount();
  const { id } = await params;
  const api = await createSessionApiClient();
  const { data: client, error } = await api.GET('/clients/{id}', {
    params: { path: { id } },
  });

  if (!client) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Cliente" backHref="/clientes" />
        <ApiErrorState error={error} />
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={client.name}
        description={formatPhone(client.phone)}
        backHref="/clientes"
      />

      <dl className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-xl border p-3">
          <dt className="text-sm text-muted-foreground">Faltas</dt>
          <dd className="text-2xl font-semibold tabular-nums">
            {client.noShowCount}
          </dd>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border p-3">
          <dt className="text-sm text-muted-foreground">Lembrete de retorno</dt>
          <dd className="font-medium">
            {client.returnReminderEnabled ? 'Ativado' : 'Desativado'}
          </dd>
        </div>
        <div className="col-span-2 flex flex-col gap-1 rounded-xl border p-3">
          <dt className="text-sm text-muted-foreground">
            Agendamento pelo WhatsApp
          </dt>
          <dd>
            {client.selfBookingBlocked ? (
              <Badge variant="destructive">
                Bloqueado por faltas: só a equipe agenda
              </Badge>
            ) : (
              <Badge variant="secondary">Liberado</Badge>
            )}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Serviços mais usados</h2>
        {client.topServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum atendimento concluído ainda.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {client.topServices.map((service) => (
              <li key={service.id}>
                <Badge variant="outline">
                  {service.name} · {service.count}x
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AppointmentList
        title="Próximos agendamentos"
        appointments={client.upcomingAppointments}
        timeZone={client.timezone}
        emptyMessage="Nenhum agendamento futuro."
      />
      <AppointmentList
        title="Histórico"
        appointments={client.pastAppointments}
        timeZone={client.timezone}
        emptyMessage="Nenhum atendimento anterior."
      />
    </section>
  );
}
