'use client';

import { useActionState } from 'react';
import { FormMessage } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { TextField } from '@/components/text-field';
import type { ApiResponse } from '@/lib/api/types';
import { formatTime } from '@/lib/datetime';
import { valueOf, type FormState } from '@/lib/forms';
import { createAppointment } from './actions';

type AvailableSlots = ApiResponse<'/appointments/available-slots', 'get'>;

interface SlotFormProps {
  date: string;
  serviceIds: string[];
  available: AvailableSlots;
  // Without a chosen barber, each slot says who attends it (CA-07.2).
  showBarber: boolean;
}

const initialState: FormState = {};

export function SlotForm({
  date,
  serviceIds,
  available,
  showBarber,
}: SlotFormProps) {
  const [state, formAction] = useActionState(createAppointment, initialState);
  const errors = state.fieldErrors;
  const chosenSlot = valueOf(state.values, 'slot');
  const slotError =
    errors?.slot ?? errors?.startsAt ?? errors?.barberId ?? errors?.serviceIds;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormMessage message={state.message} />
      <input type="hidden" name="date" value={date} />
      {serviceIds.map((id) => (
        <input key={id} type="hidden" name="serviceIds" value={id} />
      ))}

      <fieldset className="flex flex-col gap-2" aria-describedby="slot-error">
        <legend className="mb-1 text-sm font-medium">Horário</legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {available.slots.map((slot) => {
            const value = `${slot.barber.id}|${slot.startsAt}`;
            return (
              <label
                key={value}
                className="flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-lg border px-2 py-1.5 text-center has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
              >
                <input
                  type="radio"
                  name="slot"
                  value={value}
                  defaultChecked={chosenSlot === value}
                  className="sr-only"
                />
                <span className="font-medium tabular-nums">
                  {formatTime(slot.startsAt, available.timezone)}
                </span>
                {showBarber && (
                  <span className="truncate text-xs opacity-80">
                    {slot.barber.name}
                  </span>
                )}
              </label>
            );
          })}
        </div>
        <p id="slot-error" className="text-sm text-destructive empty:hidden">
          {slotError}
        </p>
      </fieldset>

      <TextField
        name="clientPhone"
        label="Telefone do cliente"
        type="tel"
        inputMode="tel"
        autoComplete="off"
        placeholder="(11) 98765-4321"
        hint="O telefone identifica o cliente. Se já existir, o agendamento vai para o cadastro dele."
        defaultValue={valueOf(state.values, 'clientPhone')}
        error={
          errors?.['client.phone'] ?? errors?.clientPhone ?? errors?.client
        }
        required
      />
      <TextField
        name="clientName"
        label="Nome do cliente"
        autoComplete="off"
        defaultValue={valueOf(state.values, 'clientName')}
        error={errors?.['client.name'] ?? errors?.clientName}
        required
      />

      <SubmitButton pendingLabel="Agendando…">
        Confirmar agendamento
      </SubmitButton>
    </form>
  );
}
