import { TriangleAlertIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { ApiErrorState } from '@/components/api-error-state';
import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { formatDateTime } from '@/lib/datetime';
import { QrCodePanel } from './qr-code-panel';

export const metadata: Metadata = { title: 'Conexão WhatsApp' };

const STATUS = {
  connected: { label: 'Conectado', variant: 'default' },
  connecting: { label: 'Aguardando leitura do QR code', variant: 'secondary' },
  disconnected: { label: 'Desconectado', variant: 'destructive' },
} as const;

// Also the page the API links in the disconnection e-mail (CA-13.3).
export default async function WhatsAppConnectionPage() {
  const { barbershop } = await requireOwner();
  const api = await createSessionApiClient();
  const { data, error } = await api.GET('/whatsapp/connection');

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Conexão WhatsApp"
        description="O assistente atende pelo número da barbearia. O app WhatsApp Business continua funcionando no celular."
        backHref="/configuracoes"
      />
      {!data && <ApiErrorState error={error} />}
      {data && (
        <>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={STATUS[data.status].variant}>
              {STATUS[data.status].label}
            </Badge>
          </div>
          {data.disconnectedAt && (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>A conexão caiu</AlertTitle>
              <AlertDescription>
                O WhatsApp desconectou em{' '}
                {formatDateTime(data.disconnectedAt, barbershop.timezone)}.
                Enquanto estiver desconectado, o assistente não responde aos
                clientes. Conecte de novo lendo o QR code.
              </AlertDescription>
            </Alert>
          )}
          <QrCodePanel status={data.status} />
        </>
      )}
    </section>
  );
}
