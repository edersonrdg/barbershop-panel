'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { FormMessage } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { Button } from '@/components/ui/button';
import { requestQrCode, type QrCodeState } from './actions';

const STATUS_POLL_MS = 5000;

interface QrCodePanelProps {
  status: 'connected' | 'connecting' | 'disconnected';
}

export function QrCodePanel({ status }: QrCodePanelProps) {
  const router = useRouter();
  const [state, formAction] = useActionState<QrCodeState>(requestQrCode, {});
  const waitingScan = Boolean(state.qrCode) && status !== 'connected';

  // While the QR code is on screen, re-read the status from the server so the
  // page flips to "connected" right after the phone reads it.
  useEffect(() => {
    if (!waitingScan) return;
    const timer = setInterval(() => router.refresh(), STATUS_POLL_MS);
    return () => clearInterval(timer);
  }, [waitingScan, router]);

  return (
    <div className="flex flex-col gap-4">
      <FormMessage message={state.message} />

      {waitingScan && state.qrCode && (
        <div className="flex flex-col items-center gap-3 rounded-xl border p-4">
          <Image
            src={state.qrCode}
            alt="QR code para conectar o WhatsApp da barbearia"
            width={256}
            height={256}
            unoptimized
            className="size-64 rounded-md bg-white p-2"
          />
          <ol className="list-decimal pl-5 text-sm text-muted-foreground">
            <li>Abra o WhatsApp Business no celular da barbearia.</li>
            <li>
              Toque em Dispositivos conectados e depois em Conectar dispositivo.
            </li>
            <li>Aponte a câmera para este código.</li>
          </ol>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full"
            onClick={() => router.refresh()}
          >
            Já li o QR code
          </Button>
        </div>
      )}

      {status !== 'connected' && (
        <form action={formAction}>
          <SubmitButton pendingLabel="Gerando QR code…" className="w-full">
            {state.qrCode ? 'Gerar novo QR code' : 'Conectar WhatsApp'}
          </SubmitButton>
        </form>
      )}
    </div>
  );
}
