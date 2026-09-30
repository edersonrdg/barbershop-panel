'use client';

import { TriangleAlertIcon } from 'lucide-react';
import { useActionState } from 'react';
import { FormMessage } from '@/components/form-message';
import { SelectField } from '@/components/select-field';
import { SubmitButton } from '@/components/submit-button';
import { TextField } from '@/components/text-field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { NativeSelectOption } from '@/components/ui/native-select';
import { formatTime } from '@/lib/datetime';
import { valueOf } from '@/lib/forms';
import { createBlock, type BlockFormState } from './actions';

interface BlockFormProps {
  barbers: { id: string; name: string }[];
  date: string;
  barberId?: string;
  timeZone: string;
}

const KINDS = [
  { value: 'block', label: 'Bloquear um horário' },
  { value: 'day_off', label: 'Folga o dia inteiro' },
] as const;

const initialState: BlockFormState = {};

export function BlockForm({
  barbers,
  date,
  barberId,
  timeZone,
}: BlockFormProps) {
  const [state, formAction] = useActionState(createBlock, initialState);
  const errors = state.fieldErrors;
  const kind = valueOf(state.values, 'kind') ?? 'block';

  return (
    // React resets a form after its action; the key remounts it with the
    // echoed values so the select and radios keep what was submitted.
    <form
      key={JSON.stringify(state.values ?? null)}
      action={formAction}
      className="group/block flex flex-col gap-5"
      noValidate
    >
      {state.conflicts ? (
        <Alert>
          <TriangleAlertIcon />
          <AlertTitle>{state.message}</AlertTitle>
          <AlertDescription>
            <p>Nenhum agendamento é cancelado. Eles continuam na agenda:</p>
            <ul className="list-disc pl-4">
              {state.conflicts.map((appointment) => (
                <li key={appointment.id}>
                  {formatTime(appointment.startsAt, timeZone)} ·{' '}
                  {appointment.client?.name ?? 'Sem cliente'} ·{' '}
                  {appointment.services.map((s) => s.name).join(' + ')}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      ) : (
        <FormMessage message={state.message} />
      )}

      <SelectField
        name="barberId"
        label="Barbeiro"
        defaultValue={valueOf(state.values, 'barberId') ?? barberId ?? ''}
        error={errors?.barberId}
      >
        <NativeSelectOption value="" disabled>
          Escolha o barbeiro
        </NativeSelectOption>
        {barbers.map((barber) => (
          <NativeSelectOption key={barber.id} value={barber.id}>
            {barber.name}
          </NativeSelectOption>
        ))}
      </SelectField>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-sm font-medium">Tipo</legend>
        {KINDS.map((option) => (
          <label
            key={option.value}
            className="flex min-h-11 cursor-pointer items-center gap-3 px-1"
          >
            <input
              type="radio"
              name="kind"
              value={option.value}
              defaultChecked={kind === option.value}
              data-kind={option.value}
              className="size-5 accent-primary"
            />
            <span className="text-base">{option.label}</span>
          </label>
        ))}
      </fieldset>

      <TextField
        name="date"
        label="Dia"
        type="date"
        defaultValue={valueOf(state.values, 'date') ?? date}
        error={errors?.date}
        required
      />
      {/* Times only matter for a block; a day off takes the whole day. */}
      <div className="grid grid-cols-2 gap-3 group-has-[[data-kind=day_off]:checked]/block:hidden">
        <TextField
          name="start"
          label="Início"
          type="time"
          defaultValue={valueOf(state.values, 'start') ?? '12:00'}
          error={errors?.start}
        />
        <TextField
          name="end"
          label="Fim"
          type="time"
          defaultValue={valueOf(state.values, 'end') ?? '13:00'}
          error={errors?.end}
        />
      </div>
      <TextField
        name="reason"
        label="Motivo (opcional)"
        placeholder="Almoço, médico…"
        maxLength={120}
        defaultValue={valueOf(state.values, 'reason')}
        error={errors?.reason}
      />

      {state.conflicts ? (
        <SubmitButton
          name="confirmConflicts"
          value="true"
          pendingLabel="Salvando…"
        >
          Bloquear mesmo assim
        </SubmitButton>
      ) : (
        <SubmitButton pendingLabel="Salvando…">Salvar bloqueio</SubmitButton>
      )}
    </form>
  );
}
