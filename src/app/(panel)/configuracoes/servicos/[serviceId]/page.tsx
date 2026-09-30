import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ActionButton } from '@/components/action-button';
import { ApiErrorState } from '@/components/api-error-state';
import { PageHeader } from '@/components/page-header';
import { Separator } from '@/components/ui/separator';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { setServiceActive } from '../actions';
import { ServiceForm } from '../service-form';

export const metadata: Metadata = { title: 'Editar serviço' };

export default async function EditServicePage({
  params,
}: PageProps<'/configuracoes/servicos/[serviceId]'>) {
  await requireOwner();
  const { serviceId } = await params;
  const api = await createSessionApiClient();
  // The API has no GET for one service; the list brings all of them.
  const { data, error } = await api.GET('/settings/services');
  if (!data) {
    return (
      <section className="flex flex-col gap-6">
        <PageHeader title="Editar serviço" backHref="/configuracoes/servicos" />
        <ApiErrorState error={error} />
      </section>
    );
  }

  const service = data.services.find((s) => s.id === serviceId);
  if (!service) notFound();

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title={service.name}
        description={
          service.active ? 'Ativo' : 'Inativo: fora dos novos agendamentos'
        }
        backHref="/configuracoes/servicos"
      />
      <ServiceForm
        service={service}
        addOnOptions={data.services.filter(
          (option) => option.active && option.id !== service.id,
        )}
      />
      <Separator />
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {service.active
            ? 'Desativar tira o serviço dos novos agendamentos. Os agendamentos existentes não mudam.'
            : 'Reativar volta a oferecer o serviço em novos agendamentos.'}
        </p>
        <ActionButton
          action={setServiceActive}
          fields={{
            serviceId: service.id,
            active: String(!service.active),
          }}
          variant={service.active ? 'destructive' : 'outline'}
          pendingLabel="Salvando…"
        >
          {service.active ? 'Desativar serviço' : 'Reativar serviço'}
        </ActionButton>
      </div>
    </section>
  );
}
