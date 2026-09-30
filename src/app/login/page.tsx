import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Entrar' };

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-4 py-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Entrar no painel</h1>
        <p className="text-sm text-muted-foreground">
          Use o e-mail e a senha da sua conta na barbearia.
        </p>
      </div>
      <LoginForm />
    </main>
  );
}
