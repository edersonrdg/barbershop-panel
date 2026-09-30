'use client';

import { useActionState } from 'react';
import { FormMessage } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { TextField } from '@/components/text-field';
import { valueOf, type FormState } from '@/lib/forms';
import { requestPasswordReset } from './actions';

const initialState: FormState = {};

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    requestPasswordReset,
    initialState,
  );

  if (state.success) {
    return <FormMessage tone="success" message={state.success} />;
  }

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormMessage message={state.message} />
      <TextField
        name="email"
        label="E-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        defaultValue={valueOf(state.values, 'email')}
        error={state.fieldErrors?.email}
        required
      />
      <SubmitButton pendingLabel="Enviando…">Enviar link</SubmitButton>
    </form>
  );
}
