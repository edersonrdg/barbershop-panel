'use client';

import { useActionState } from 'react';
import { FormMessage } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { TextField } from '@/components/text-field';
import type { FormState } from '@/lib/forms';
import { acceptInvitation } from './actions';

const initialState: FormState = {};

export function AcceptInvitationForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(acceptInvitation, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormMessage message={state.message ?? state.fieldErrors?.token} />
      <input type="hidden" name="token" value={token} />
      <TextField
        name="password"
        label="Crie sua senha"
        type="password"
        autoComplete="new-password"
        hint="De 8 a 72 caracteres."
        error={state.fieldErrors?.password}
        required
      />
      <SubmitButton pendingLabel="Entrando…">Criar senha e entrar</SubmitButton>
    </form>
  );
}
