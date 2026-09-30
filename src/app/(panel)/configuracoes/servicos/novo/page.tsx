import type { Metadata } from 'next';
import { ApiErrorState } from '@/components/api-error-state';
import { PageHeader } from '@/components/page-header';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { ServiceForm } from '../service-form';

export const metadata: Metadata = { title: 'Novo serviço' };

export default async function NewServicePage() {
  await requireOwner();
  const api = await createSessionApiClient();
  const { data, error } = await api.GET('/settings/services');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Novo serviço" backHref="/configuracoes/servicos" />
      {data ? (
        <ServiceForm
          addOnOptions={data.services.filter((service) => service.active)}
        />
      ) : (
        <ApiErrorState error={error} />
      )}
    </section>
  );
}
