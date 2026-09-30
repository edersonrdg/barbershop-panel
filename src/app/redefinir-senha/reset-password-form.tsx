'use client';

import { useActionState } from 'react';
import { FormMessage } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { TextField } from '@/components/text-field';
import type { FormState } from '@/lib/forms';
import { resetPassword } from './actions';

const initialState: FormState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction] = useActionState(resetPassword, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormMessage message={state.message ?? state.fieldErrors?.token} />
      <input type="hidden" name="token" value={token} />
      <TextField
        name="newPassword"
        label="Nova senha"
        type="password"
        autoComplete="new-password"
        hint="De 8 a 72 caracteres."
        error={state.fieldErrors?.newPassword}
        required
      />
      <SubmitButton pendingLabel="Salvando…">Salvar nova senha</SubmitButton>
    </form>
  );
}
