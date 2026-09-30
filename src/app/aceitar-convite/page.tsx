import type { Metadata } from 'next';
import { AuthShell } from '@/components/auth-shell';
import { FormMessage } from '@/components/form-message';
import { AcceptInvitationForm } from './accept-invitation-form';

export const metadata: Metadata = { title: 'Aceitar convite' };

// Opened from the e-mail link `/aceitar-convite?token=...` sent by the API.
export default async function AcceptInvitationPage({
  searchParams,
}: PageProps<'/aceitar-convite'>) {
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Você foi convidado"
      description="Crie sua senha para acessar a agenda da barbearia."
    >
      {typeof token === 'string' && token ? (
        <AcceptInvitationForm token={token} />
      ) : (
        <FormMessage message="O link do convite está incompleto. Peça um novo convite ao dono da barbearia." />
      )}
    </AuthShell>
  );
}
