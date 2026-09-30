import type { Metadata } from 'next';
import { ApiErrorState } from '@/components/api-error-state';
import { PageHeader } from '@/components/page-header';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { RulesForm } from './rules-form';

export const metadata: Metadata = { title: 'Regras de agendamento' };

export default async function BookingRulesPage() {
  await requireOwner();
  const api = await createSessionApiClient();
  const { data, error } = await api.GET('/settings/rules');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Regras de agendamento"
        description="Mudanças valem para os próximos agendamentos, sem alterar os já criados."
        backHref="/configuracoes"
      />
      {data ? <RulesForm rules={data} /> : <ApiErrorState error={error} />}
    </section>
  );
}
