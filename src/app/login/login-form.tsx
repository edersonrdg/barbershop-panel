'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login, type LoginState } from './actions';

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      {state.message && (
        <p
          role="alert"
          className="rounded-md bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          defaultValue={state.email}
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby="email-error"
          className="h-12 text-base"
          required
        />
        <p id="email-error" className="text-sm text-destructive">
          {state.fieldErrors?.email}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(state.fieldErrors?.password)}
          aria-describedby="password-error"
          className="h-12 text-base"
          required
        />
        <p id="password-error" className="text-sm text-destructive">
          {state.fieldErrors?.password}
        </p>
      </div>

      <Button
        type="submit"
        size="lg"
        className="h-12 text-base"
        disabled={pending}
      >
        {pending ? 'Entrando…' : 'Entrar'}
      </Button>
    </form>
  );
}
