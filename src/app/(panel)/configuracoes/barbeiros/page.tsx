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
import { cn } from '@/lib/utils';
import { WEEKDAY_LABELS, WEEKDAYS } from '@/lib/weekdays';

export const metadata: Metadata = { title: 'Barbeiros' };

export default async function BarbersPage() {
  await requireOwner();
  const api = await createSessionApiClient();
  const [barbers, services] = await Promise.all([
    api.GET('/settings/barbers'),
    api.GET('/settings/services'),
  ]);

  const serviceNames = new Map(
    services.data?.services.map((service) => [service.id, service.name]),
  );

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Barbeiros"
        description="Só os horários reais de cada barbeiro são oferecidos."
        backHref="/configuracoes"
      />
      {!barbers.data && <ApiErrorState error={barbers.error} />}
      {barbers.data?.barbers.length === 0 && (
        <EmptyState>Nenhum barbeiro cadastrado ainda.</EmptyState>
      )}
      {barbers.data && barbers.data.barbers.length > 0 && (
        <ul className="flex flex-col divide-y rounded-xl border">
          {barbers.data.barbers.map((barber) => {
            const workingDays = WEEKDAYS.filter(
              (day) => barber.workingHours[day] !== null,
            ).map((day) => WEEKDAY_LABELS[day].slice(0, 3));

            return (
              <li key={barber.id}>
                <Link
                  href={`/configuracoes/barbeiros/${barber.id}`}
                  className="flex min-h-16 flex-col gap-1 px-4 py-3 hover:bg-muted/60"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{barber.name}</span>
                    {!barber.active && (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                    {barber.userId && (
                      <Badge variant="outline">Acessa o painel</Badge>
                    )}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {barber.serviceIds
                      .map((id) => serviceNames.get(id))
                      .filter(Boolean)
                      .join(', ') || 'Sem serviços'}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {workingDays.length > 0
                      ? `Trabalha: ${workingDays.join(', ')}`
                      : 'Sem jornada'}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <Link
        href="/configuracoes/barbeiros/novo"
        className={cn(buttonVariants(), 'h-12 text-base')}
      >
        <PlusIcon />
        Novo barbeiro
      </Link>
    </section>
  );
}
