'use client';

import { TriangleAlertIcon } from 'lucide-react';
import Link from 'next/link';
import { useActionState } from 'react';
import { CheckboxField } from '@/components/checkbox-field';
import { FormMessage } from '@/components/form-message';
import { SelectField } from '@/components/select-field';
import { SubmitButton } from '@/components/submit-button';
import { TextField } from '@/components/text-field';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { NativeSelectOption } from '@/components/ui/native-select';
import { WeekHoursFields } from '@/components/week-hours-fields';
import type { ApiResponse } from '@/lib/api/types';
import { errorUnder, valueOf, valuesOf } from '@/lib/forms';
import { cn } from '@/lib/utils';
import { mapWeek, weekErrors, type WeekHours } from '@/lib/week-hours';
import { saveBarber, type BarberFormState } from './actions';

type Barber = ApiResponse<'/settings/barbers', 'get'>['barbers'][number];
type Service = ApiResponse<'/settings/services', 'get'>['services'][number];
type User = ApiResponse<'/users', 'get'>['users'][number];

interface BarberFormProps {
  barber?: Barber;
  services: Service[];
  users: User[];
}

const ROLE_LABELS = { owner: 'Dono', barber: 'Barbeiro' } as const;

const EMPTY_WEEK: WeekHours = {
  monday: null,
  tuesday: null,
  wednesday: null,
  thursday: null,
  friday: null,
  saturday: null,
  sunday: null,
};

const initialState: BarberFormState = {};

export function BarberForm({ barber, services, users }: BarberFormProps) {
  const [state, formAction] = useActionState(saveBarber, initialState);
  const errors = state.fieldErrors;

  if (state.saved) {
    return (
      <div className="flex flex-col gap-4">
        <Alert>
          <TriangleAlertIcon />
          <AlertTitle>Barbeiro salvo, com avisos na jornada</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-4">
              {state.saved.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
        <Link
          href={`/configuracoes/barbeiros/${state.saved.barberId}`}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'h-12 text-base',
          )}
        >
          Ajustar jornada
        </Link>
        <Link
          href="/configuracoes/barbeiros"
          className={cn(buttonVariants(), 'h-12 text-base')}
        >
          Voltar para barbeiros
        </Link>
      </div>
    );
  }

  const initialWeek = barber
    ? mapWeek(barber.workingHours, (day) => ({
        start: day.startsAt,
        end: day.endsAt,
        break: day.break
          ? { start: day.break.startsAt, end: day.break.endsAt }
          : null,
      }))
    : EMPTY_WEEK;
  const selectedServices = valuesOf(
    state.values,
    'serviceIds',
    barber?.serviceIds ?? [],
  );
  // The API only accepts active services; an inactive one still linked shows
  // up so the owner can uncheck it.
  const serviceOptions = services.filter(
    (service) => service.active || barber?.serviceIds.includes(service.id),
  );

  return (
    // React resets a form after its action; the key remounts it with the
    // echoed values so the select and checkboxes keep what was submitted.
    <form
      key={JSON.stringify(state.values ?? null)}
      action={formAction}
      className="flex flex-col gap-5"
      noValidate
    >
      <FormMessage message={state.message} />
      {barber && <input type="hidden" name="barberId" value={barber.id} />}

      <TextField
        name="name"
        label="Nome"
        autoComplete="off"
        defaultValue={valueOf(state.values, 'name') ?? barber?.name}
        error={errors?.name}
        required
      />
      <SelectField
        name="userId"
        label="Acesso ao painel"
        defaultValue={valueOf(state.values, 'userId') ?? barber?.userId ?? ''}
        error={errors?.userId}
      >
        <NativeSelectOption value="">Sem usuário vinculado</NativeSelectOption>
        {users.map((user) => (
          <NativeSelectOption key={user.id} value={user.id}>
            {user.name} ({ROLE_LABELS[user.role]})
          </NativeSelectOption>
        ))}
      </SelectField>

      <fieldset
        className="flex flex-col gap-1"
        aria-describedby="services-error"
      >
        <legend className="mb-1 text-sm font-medium">
          Serviços que realiza
        </legend>
        {serviceOptions.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Cadastre os serviços antes dos barbeiros.
          </p>
        )}
        {serviceOptions.map((service) => (
          <CheckboxField
            key={service.id}
            name="serviceIds"
            value={service.id}
            defaultChecked={selectedServices.includes(service.id)}
            label={service.active ? service.name : `${service.name} (inativo)`}
          />
        ))}
        <p
          id="services-error"
          className="text-sm text-destructive empty:hidden"
        >
          {errorUnder(errors, 'serviceIds')}
        </p>
      </fieldset>

      <div className="flex flex-col gap-2">
        <h2 className="font-medium">Jornada semanal</h2>
        <WeekHoursFields
          initial={initialWeek}
          values={state.values}
          errors={weekErrors(errors, 'workingHours')}
          openLabel="Trabalha neste dia"
          startLabel="Entrada"
          endLabel="Saída"
        />
      </div>

      <SubmitButton pendingLabel="Salvando…">
        {barber ? 'Salvar barbeiro' : 'Cadastrar barbeiro'}
      </SubmitButton>
    </form>
  );
}
