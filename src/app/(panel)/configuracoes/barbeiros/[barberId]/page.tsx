import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ActionButton } from '@/components/action-button';
import { ApiErrorState } from '@/components/api-error-state';
import { PageHeader } from '@/components/page-header';
import { Separator } from '@/components/ui/separator';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { setBarberActive } from '../actions';
import { BarberForm } from '../barber-form';

export const metadata: Metadata = { title: 'Editar barbeiro' };

export default async function EditBarberPage({
  params,
}: PageProps<'/configuracoes/barbeiros/[barberId]'>) {
  await requireOwner();
  const { barberId } = await params;
  const api = await createSessionApiClient();
  // The API has no GET for one barber; the list brings all of them.
  const [barbers, services, users] = await Promise.all([
    api.GET('/settings/barbers'),
    api.GET('/settings/services'),
    api.GET('/users'),
  ]);
  if (!barbers.data || !services.data || !users.data) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader
          title="Editar barbeiro"
          backHref="/configuracoes/barbeiros"
        />
        <ApiErrorState error={barbers.error ?? services.error ?? users.error} />
      </section>
    );
  }

  const barber = barbers.data.barbers.find((b) => b.id === barberId);
  if (!barber) notFound();

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={barber.name}
        description={
          barber.active ? 'Ativo na agenda' : 'Inativo: fora da agenda'
        }
        backHref="/configuracoes/barbeiros"
      />
      <BarberForm
        barber={barber}
        services={services.data.services}
        users={users.data.users}
      />
      <Separator />
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {barber.active
            ? 'Desativar tira o barbeiro da agenda e dos novos agendamentos. O cadastro continua salvo.'
            : 'Reativar volta a oferecer os horários do barbeiro.'}
        </p>
        <ActionButton
          action={setBarberActive}
          fields={{ barberId: barber.id, active: String(!barber.active) }}
          variant={barber.active ? 'destructive' : 'outline'}
          pendingLabel="Salvando…"
        >
          {barber.active ? 'Desativar barbeiro' : 'Reativar barbeiro'}
        </ActionButton>
      </div>
    </section>
  );
}
