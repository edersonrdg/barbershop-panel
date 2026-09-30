import { TriangleAlertIcon } from 'lucide-react';
import Link from 'next/link';
import { createSessionApiClient } from '@/lib/api/session-client';

// CA-13.3: while the API reports a drop (`disconnectedAt`), every page warns
// the owner. Rendered inside <Suspense> so the connector call never delays
// the page itself.
export async function WhatsAppAlert() {
  const api = await createSessionApiClient();
  const { data } = await api.GET('/whatsapp/connection');
  if (!data?.disconnectedAt) return null;

  return (
    <Link
      href="/configuracoes/whatsapp"
      role="alert"
      className="flex min-h-11 items-center gap-2 bg-destructive/10 px-4 py-2 text-sm text-destructive"
    >
      <TriangleAlertIcon className="size-4 shrink-0" aria-hidden />
      <span>
        O WhatsApp da barbearia desconectou. Toque para conectar de novo.
      </span>
    </Link>
  );
}
