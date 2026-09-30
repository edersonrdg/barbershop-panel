'use client';

import { useActionState } from 'react';
import { FormMessage } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { TextField } from '@/components/text-field';
import type { ApiResponse } from '@/lib/api/types';
import { valueOf, type FormState } from '@/lib/forms';
import { saveBookingRules } from './actions';

type BookingRules = ApiResponse<'/settings/rules', 'get'>;

const FIELDS: { name: keyof BookingRules; label: string; hint: string }[] = [
  {
    name: 'minimumAdvanceMinutes',
    label: 'Antecedência mínima (minutos)',
    hint: 'O assistente só oferece horários a partir de agora mais esse tempo. O agendamento manual não segue essa regra.',
  },
  {
    name: 'cancellationDeadlineMinutes',
    label: 'Prazo de cancelamento (minutos antes)',
    hint: 'Até quando o cliente pode cancelar ou remarcar pelo WhatsApp.',
  },
  {
    name: 'noShowLimit',
    label: 'Limite de faltas',
    hint: 'A partir desse número de faltas, o assistente deixa de agendar o cliente.',
  },
  {
    name: 'waitlistOfferMinutes',
    label: 'Prazo da oferta da lista de espera (minutos)',
    hint: 'Tempo que o cliente da fila tem para aceitar a vaga.',
  },
  {
    name: 'returnReminderDays',
    label: 'Lembrete de retorno (dias)',
    hint: 'Dias depois do último atendimento, só para quem aceitou o lembrete.',
  },
];

const initialState: FormState = {};

export function RulesForm({ rules }: { rules: BookingRules }) {
  const [state, formAction] = useActionState(saveBookingRules, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormMessage message={state.message} />
      <FormMessage tone="success" message={state.success} />
      {FIELDS.map(({ name, label, hint }) => (
        <TextField
          key={name}
          name={name}
          label={label}
          hint={hint}
          type="number"
          inputMode="numeric"
          min={0}
          defaultValue={valueOf(state.values, name) ?? String(rules[name])}
          error={state.fieldErrors?.[name]}
          required
        />
      ))}
      <SubmitButton pendingLabel="Salvando…">Salvar regras</SubmitButton>
    </form>
  );
}
