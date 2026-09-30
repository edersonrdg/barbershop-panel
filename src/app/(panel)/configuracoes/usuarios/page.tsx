import type { Metadata } from 'next';
import { ActionButton } from '@/components/action-button';
import { ApiErrorState } from '@/components/api-error-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { removeUser } from './actions';
import { InviteForm } from './invite-form';

export const metadata: Metadata = { title: 'Usuários' };

const ROLE_LABELS = { owner: 'Dono', barber: 'Barbeiro' } as const;

export default async function UsersPage() {
  const { user: me } = await requireOwner();
  const api = await createSessionApiClient();
  const { data, error } = await api.GET('/users');

  return (
    <section className="flex flex-col gap-8">
      <PageHeader
        title="Usuários"
        description="Barbeiros convidados veem só a própria agenda."
        backHref="/configuracoes"
      />

      {data ? (
        <ul className="flex flex-col divide-y rounded-xl border">
          {data.users.map((user) => (
            <li
              key={user.id}
              className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2 font-medium">
                  <span className="truncate">{user.name}</span>
                  <Badge
                    variant={user.role === 'owner' ? 'default' : 'outline'}
                  >
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </span>
                <span className="truncate text-sm text-muted-foreground">
                  {user.email}
                </span>
              </div>
              {user.role === 'barber' && user.id !== me.id && (
                <ActionButton
                  action={removeUser}
                  fields={{ userId: user.id }}
                  variant="destructive"
                  pendingLabel="Removendo…"
                  confirmMessage={`Remover o acesso de ${user.name}? Os agendamentos dele continuam na agenda.`}
                >
                  Remover acesso
                </ActionButton>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <ApiErrorState error={error} />
      )}

      <div className="flex flex-col gap-4">
        <h2 className="font-medium">Convidar barbeiro</h2>
        <InviteForm />
      </div>
    </section>
  );
}
