import type { Metadata } from 'next';
import { ApiErrorState } from '@/components/api-error-state';
import { PageHeader } from '@/components/page-header';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { BarbershopForm } from './barbershop-form';

export const metadata: Metadata = { title: 'Barbearia' };

export default async function BarbershopSettingsPage() {
  await requireOwner();
  const api = await createSessionApiClient();
  const { data, error } = await api.GET('/settings/barbershop');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Barbearia"
        description="Dados usados pela agenda e pelo assistente no WhatsApp."
        backHref="/configuracoes"
      />
      {data ? (
        <BarbershopForm settings={data} />
      ) : (
        <ApiErrorState error={error} />
      )}
    </section>
  );
}
