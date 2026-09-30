'use client';

import { useActionState } from 'react';
import { FormMessage } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { TextField } from '@/components/text-field';
import { valueOf, type FormState } from '@/lib/forms';
import { signup } from './actions';

const initialState: FormState = {};

export function SignupForm() {
  const [state, formAction] = useActionState(signup, initialState);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormMessage message={state.message} />
      <TextField
        name="barbershopName"
        label="Nome da barbearia"
        autoComplete="organization"
        defaultValue={valueOf(state.values, 'barbershopName')}
        error={errors?.barbershopName}
        required
      />
      <TextField
        name="ownerName"
        label="Seu nome"
        autoComplete="name"
        defaultValue={valueOf(state.values, 'ownerName')}
        error={errors?.ownerName}
        required
      />
      <TextField
        name="email"
        label="E-mail"
        type="email"
        inputMode="email"
        autoComplete="email"
        defaultValue={valueOf(state.values, 'email')}
        error={errors?.email}
        required
      />
      <TextField
        name="phone"
        label="Telefone com DDD"
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder="(11) 91234-5678"
        defaultValue={valueOf(state.values, 'phone')}
        error={errors?.phone}
        required
      />
      <TextField
        name="password"
        label="Senha"
        type="password"
        autoComplete="new-password"
        hint="De 8 a 72 caracteres."
        error={errors?.password}
        required
      />
      <SubmitButton pendingLabel="Criando conta…">
        Começar teste grátis de 14 dias
      </SubmitButton>
    </form>
  );
}
