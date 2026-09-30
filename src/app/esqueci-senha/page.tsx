import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth-shell';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = { title: 'Esqueci minha senha' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Esqueci minha senha"
      description="Informe o e-mail da conta. Enviaremos um link para criar uma nova senha."
      footer={
        <Link href="/login" className="underline underline-offset-4">
          Voltar para o login
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
