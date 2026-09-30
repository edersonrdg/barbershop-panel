import type { Metadata } from 'next';
import Link from 'next/link';
import { FormMessage } from '@/components/form-message';
import { AuthShell } from '@/components/auth-shell';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Entrar' };

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { senha } = await searchParams;

  return (
    <AuthShell
      title="Entrar no painel"
      description="Use o e-mail e a senha da sua conta na barbearia."
      footer={
        <>
          <Link href="/esqueci-senha" className="underline underline-offset-4">
            Esqueci minha senha
          </Link>
          <span>
            Ainda não tem conta?{' '}
            <Link href="/cadastro" className="underline underline-offset-4">
              Cadastre sua barbearia
            </Link>
          </span>
        </>
      }
    >
      {senha === 'redefinida' && (
        <FormMessage
          tone="success"
          message="Senha alterada. Entre com a nova senha."
        />
      )}
      <LoginForm />
    </AuthShell>
  );
}
