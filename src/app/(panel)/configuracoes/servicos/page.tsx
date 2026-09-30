import { PlusIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ApiErrorState } from '@/components/api-error-state';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { formatCents } from '@/lib/money';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Serviços' };

export default async function ServicesPage() {
  await requireOwner();
  const api = await createSessionApiClient();
  const { data, error } = await api.GET('/settings/services');

  const namesById = new Map(data?.services.map((s) => [s.id, s.name]));

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Serviços"
        description="O assistente e a agenda só usam os serviços ativos."
        backHref="/configuracoes"
      />
      {!data && <ApiErrorState error={error} />}
      {data?.services.length === 0 && (
        <EmptyState>Nenhum serviço cadastrado ainda.</EmptyState>
      )}
      {data && data.services.length > 0 && (
        <ul className="flex flex-col divide-y rounded-xl border">
          {data.services.map((service) => (
            <li key={service.id}>
              <Link
                href={`/configuracoes/servicos/${service.id}`}
                className="flex min-h-16 flex-col gap-1 px-4 py-3 hover:bg-muted/60"
              >
                <span className="flex items-center gap-2">
                  <span className="font-medium">{service.name}</span>
                  {!service.active && (
                    <Badge variant="secondary">Inativo</Badge>
                  )}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatCents(service.priceCents)} · {service.durationMinutes}{' '}
                  min
                </span>
                {service.suggestedAddOnIds.length > 0 && (
                  <span className="text-sm text-muted-foreground">
                    Adicionais:{' '}
                    {service.suggestedAddOnIds
                      .map((id) => namesById.get(id))
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/configuracoes/servicos/novo"
        className={cn(buttonVariants(), 'h-12 text-base')}
      >
        <PlusIcon />
        Novo serviço
      </Link>
    </section>
  );
}
