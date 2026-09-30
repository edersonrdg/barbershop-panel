import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth-shell';
import { SignupForm } from './signup-form';

export const metadata: Metadata = { title: 'Cadastrar barbearia' };

export default function SignupPage() {
  return (
    <AuthShell
      title="Cadastre sua barbearia"
      description="14 dias grátis com tudo liberado, sem informar pagamento."
      footer={
        <span>
          Já tem conta?{' '}
          <Link href="/login" className="underline underline-offset-4">
            Entrar
          </Link>
        </span>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
