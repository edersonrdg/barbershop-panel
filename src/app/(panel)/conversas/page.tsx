import type { Metadata } from 'next';
import Link from 'next/link';
import { ActionButton } from '@/components/action-button';
import { ApiErrorState } from '@/components/api-error-state';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { formatDateTime } from '@/lib/datetime';
import { formatPhone } from '@/lib/phone';
import { resumeBot } from './actions';

export const metadata: Metadata = { title: 'Conversas' };

const REASONS = {
  requested: 'Cliente pediu um atendente',
  not_understood: 'Assistente não entendeu duas vezes',
} as const;

// CA-16.6: conversations waiting for a person. The team replies in the
// WhatsApp Business app; the panel only lists them and resumes the bot.
export default async function ConversationsPage() {
  const { barbershop } = await requireOwner();
  const api = await createSessionApiClient();
  const { data, error } = await api.GET(
    '/whatsapp/conversations/waiting-human',
  );

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Conversas aguardando atendimento"
        description="O assistente está pausado nelas. Responda pelo app WhatsApp Business e reative o assistente quando terminar."
      />
      {!data && <ApiErrorState error={error} />}
      {data?.conversations.length === 0 && (
        <EmptyState>Nenhuma conversa aguardando atendimento.</EmptyState>
      )}
      {data && data.conversations.length > 0 && (
        <ul className="flex flex-col gap-3">
          {data.conversations.map((conversation) => (
            <li
              key={conversation.clientId}
              className="flex flex-col gap-3 rounded-xl border p-3"
            >
              <div className="flex flex-col gap-1">
                <Link
                  href={`/clientes/${conversation.clientId}`}
                  className="font-medium underline-offset-4 hover:underline"
                >
                  {conversation.clientName}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {formatPhone(conversation.phone)}
                </span>
                <Badge variant="secondary">
                  {REASONS[conversation.reason]}
                </Badge>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Transferida em</dt>
                  <dd className="tabular-nums">
                    {formatDateTime(conversation.pausedAt, barbershop.timezone)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Última mensagem</dt>
                  <dd className="tabular-nums">
                    {formatDateTime(
                      conversation.lastActivityAt,
                      barbershop.timezone,
                    )}
                  </dd>
                </div>
              </dl>
              <ActionButton
                action={resumeBot}
                fields={{ clientId: conversation.clientId }}
                variant="default"
                pendingLabel="Reativando…"
              >
                Reativar assistente
              </ActionButton>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
