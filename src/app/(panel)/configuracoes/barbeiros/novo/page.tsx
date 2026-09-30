import type { Metadata } from 'next';
import { ApiErrorState } from '@/components/api-error-state';
import { PageHeader } from '@/components/page-header';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { BarberForm } from '../barber-form';

export const metadata: Metadata = { title: 'Novo barbeiro' };

export default async function NewBarberPage() {
  await requireOwner();
  const api = await createSessionApiClient();
  const [services, users] = await Promise.all([
    api.GET('/settings/services'),
    api.GET('/users'),
  ]);

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Novo barbeiro" backHref="/configuracoes/barbeiros" />
      {services.data && users.data ? (
        <BarberForm
          services={services.data.services}
          users={users.data.users}
        />
      ) : (
        <ApiErrorState error={services.error ?? users.error} />
      )}
    </section>
  );
}
