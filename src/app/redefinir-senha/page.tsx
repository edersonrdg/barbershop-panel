import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth-shell';
import { FormMessage } from '@/components/form-message';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = { title: 'Redefinir senha' };

// Opened from the e-mail link `/redefinir-senha?token=...` sent by the API.
export default async function ResetPasswordPage({
  searchParams,
}: PageProps<'/redefinir-senha'>) {
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Criar nova senha"
      description="Escolha a nova senha da sua conta."
      footer={
        <Link href="/esqueci-senha" className="underline underline-offset-4">
          Pedir um novo link
        </Link>
      }
    >
      {typeof token === 'string' && token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <FormMessage message="O link de redefinição está incompleto. Peça um novo link." />
      )}
    </AuthShell>
  );
}
