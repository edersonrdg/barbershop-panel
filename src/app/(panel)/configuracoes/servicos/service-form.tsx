'use client';

import { useActionState } from 'react';
import { CheckboxField } from '@/components/checkbox-field';
import { FormMessage } from '@/components/form-message';
import { SubmitButton } from '@/components/submit-button';
import { TextField } from '@/components/text-field';
import type { ApiResponse } from '@/lib/api/types';
import { errorUnder, valueOf, valuesOf, type FormState } from '@/lib/forms';
import { centsToInput, formatCents } from '@/lib/money';
import { saveService } from './actions';

type Service = ApiResponse<'/settings/services', 'get'>['services'][number];

interface ServiceFormProps {
  service?: Service;
  // Active services of the barbershop, the only ones the API accepts as add-ons.
  addOnOptions: Service[];
}

const initialState: FormState = {};

export function ServiceForm({ service, addOnOptions }: ServiceFormProps) {
  const [state, formAction] = useActionState(saveService, initialState);
  const errors = state.fieldErrors;
  const selectedAddOns = valuesOf(
    state.values,
    'suggestedAddOnIds',
    service?.suggestedAddOnIds ?? [],
  );

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <FormMessage message={state.message} />
      {service && <input type="hidden" name="serviceId" value={service.id} />}

      <TextField
        name="name"
        label="Nome"
        placeholder="Corte"
        defaultValue={valueOf(state.values, 'name') ?? service?.name}
        error={errors?.name}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          name="price"
          label="Preço (R$)"
          inputMode="decimal"
          placeholder="45,00"
          defaultValue={
            valueOf(state.values, 'price') ??
            (service ? centsToInput(service.priceCents) : undefined)
          }
          error={errors?.priceCents}
          required
        />
        <TextField
          name="durationMinutes"
          label="Duração (min)"
          type="number"
          inputMode="numeric"
          step={5}
          placeholder="30"
          defaultValue={
            valueOf(state.values, 'durationMinutes') ?? service?.durationMinutes
          }
          error={errors?.durationMinutes}
          required
        />
      </div>

      <fieldset
        className="flex flex-col gap-1"
        aria-describedby="addons-hint addons-error"
      >
        <legend className="mb-1 text-sm font-medium">
          Adicionais sugeridos
        </legend>
        <p id="addons-hint" className="mb-1 text-sm text-muted-foreground">
          O assistente oferece esses serviços junto com este.
        </p>
        {addOnOptions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Cadastre outros serviços para sugerir como adicionais.
          </p>
        )}
        {addOnOptions.map((option) => (
          <CheckboxField
            key={option.id}
            name="suggestedAddOnIds"
            value={option.id}
            defaultChecked={selectedAddOns.includes(option.id)}
            label={option.name}
            description={`${formatCents(option.priceCents)} · ${option.durationMinutes} min`}
          />
        ))}
        <p id="addons-error" className="text-sm text-destructive empty:hidden">
          {errorUnder(errors, 'suggestedAddOnIds')}
        </p>
      </fieldset>

      <SubmitButton pendingLabel="Salvando…">
        {service ? 'Salvar serviço' : 'Cadastrar serviço'}
      </SubmitButton>
    </form>
  );
}
