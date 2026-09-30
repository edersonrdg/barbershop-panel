import { ChevronRightIcon, SearchIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Form from 'next/form';
import Link from 'next/link';
import { ApiErrorState } from '@/components/api-error-state';
import { EmptyState } from '@/components/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireAccount } from '@/lib/auth/current-account';
import { formatPhone } from '@/lib/phone';
import { single } from '@/lib/search-params';

export const metadata: Metadata = { title: 'Clientes' };

// CA-12.1: search by name or phone. The API limits a barber to clients they
// attended, so the same screen serves both profiles.
export default async function ClientsPage({
  searchParams,
}: PageProps<'/clientes'>) {
  await requireAccount();
  const q = single((await searchParams).q)?.trim() ?? '';

  const api = await createSessionApiClient();
  const { data, error } = await api.GET('/clients', {
    params: { query: q ? { q } : {} },
  });

  return (
    <section className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">Clientes</h1>
      <Form action="/clientes" role="search" className="flex gap-2">
        <Label htmlFor="client-search" className="sr-only">
          Buscar por nome ou telefone
        </Label>
        <Input
          id="client-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="Nome ou telefone"
          autoComplete="off"
          className="h-11 flex-1 text-base"
        />
        <Button
          type="submit"
          size="icon"
          className="size-11 shrink-0"
          aria-label="Buscar"
        >
          <SearchIcon />
        </Button>
      </Form>

      {!data && <ApiErrorState error={error} title="Não foi possível buscar" />}
      {data?.clients.length === 0 && (
        <EmptyState>
          {q
            ? `Nenhum cliente encontrado para "${q}".`
            : 'Nenhum cliente ainda.'}
        </EmptyState>
      )}
      {data && data.clients.length > 0 && (
        <ul className="flex flex-col divide-y rounded-xl border">
          {data.clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/clientes/${client.id}`}
                className="flex min-h-14 items-center gap-3 px-4 py-2 hover:bg-muted/60"
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">{client.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatPhone(client.phone)}
                  </span>
                </span>
                <ChevronRightIcon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
