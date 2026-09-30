'use client';

import { useActionState } from 'react';
import { FormMessage } from '@/components/form-message';
import { SelectField } from '@/components/select-field';
import { SubmitButton } from '@/components/submit-button';
import { TextField } from '@/components/text-field';
import { NativeSelectOption } from '@/components/ui/native-select';
import { WeekHoursFields } from '@/components/week-hours-fields';
import type { ApiResponse } from '@/lib/api/types';
import { valueOf, type FormState } from '@/lib/forms';
import { mapWeek, weekErrors } from '@/lib/week-hours';
import { saveBarbershopSettings } from './actions';
import { TIMEZONES, timezoneLabel } from './timezones';

type BarbershopSettings = ApiResponse<'/settings/barbershop', 'get'>;

const initialState: FormState = {};

export function BarbershopForm({ settings }: { settings: BarbershopSettings }) {
  const [state, formAction] = useActionState(
    saveBarbershopSettings,
    initialState,
  );
  const errors = state.fieldErrors;
  const initialWeek = mapWeek(settings.openingHours, (day) => ({
    start: day.opensAt,
    end: day.closesAt,
    break: day.break
      ? { start: day.break.startsAt, end: day.break.endsAt }
      : null,
  }));

  return (
    // React resets a form after its action; the key remounts it with the
    // echoed values so selects and checkboxes keep what was submitted.
    <form
      key={JSON.stringify(state.values ?? null)}
      action={formAction}
      className="flex flex-col gap-5"
      noValidate
    >
      <FormMessage message={state.message} />
      <FormMessage tone="success" message={state.success} />

      <TextField
        name="name"
        label="Nome da barbearia"
        defaultValue={valueOf(state.values, 'name') ?? settings.name}
        error={errors?.name}
        required
      />
      <TextField
        name="address"
        label="Endereço"
        autoComplete="street-address"
        defaultValue={
          valueOf(state.values, 'address') ?? settings.address ?? ''
        }
        error={errors?.address}
        required
      />
      <SelectField
        name="timezone"
        label="Fuso horário"
        defaultValue={valueOf(state.values, 'timezone') ?? settings.timezone}
        error={errors?.timezone}
      >
        {TIMEZONES.map((timezone) => (
          <NativeSelectOption key={timezone} value={timezone}>
            {timezoneLabel(timezone)}
          </NativeSelectOption>
        ))}
      </SelectField>

      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Horário de funcionamento</h2>
        <WeekHoursFields
          initial={initialWeek}
          values={state.values}
          errors={weekErrors(errors, 'openingHours')}
          openLabel="Aberto neste dia"
          startLabel="Abre às"
          endLabel="Fecha às"
        />
      </div>

      <SubmitButton pendingLabel="Salvando…">Salvar</SubmitButton>
    </form>
  );
}
