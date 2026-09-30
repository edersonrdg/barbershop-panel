'use client';

import { useActionState } from 'react';
import { FormMessage } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { TextField } from '@/components/text-field';
import { valueOf, type FormState } from '@/lib/forms';
import { inviteBarber } from './actions';

const initialState: FormState = {};

export function InviteForm() {
  const [state, formAction] = useActionState(inviteBarber, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      <FormMessage message={state.message} />
      <FormMessage tone="success" message={state.success} />
      <TextField
        name="name"
        label="Nome do barbeiro"
        autoComplete="off"
        defaultValue={valueOf(state.values, 'name')}
        error={state.fieldErrors?.name}
        required
      />
      <TextField
        name="email"
        label="E-mail"
        type="email"
        inputMode="email"
        autoComplete="off"
        defaultValue={valueOf(state.values, 'email')}
        error={state.fieldErrors?.email}
        required
      />
      <SubmitButton pendingLabel="Enviando convite…">
        Enviar convite
      </SubmitButton>
    </form>
  );
}
