'use client';

import Form from 'next/form';
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import type { ScheduleQuery } from './schedule';

interface BarberFilterProps {
  query: ScheduleQuery;
  barbers: { id: string; name: string }[];
}

// CA-08.1: the owner filters the schedule by barber. A GET form, so the filter
// lives in the URL; without JavaScript the "Filtrar" button submits it.
export function BarberFilter({ query, barbers }: BarberFilterProps) {
  return (
    <Form action="/agenda" className="flex flex-col gap-2">
      <input type="hidden" name="view" value={query.view} />
      <input type="hidden" name="date" value={query.date} />
      <Label htmlFor="barber-filter">Barbeiro</Label>
      <NativeSelect
        id="barber-filter"
        name="barberId"
        defaultValue={query.barberId ?? ''}
        className="w-full"
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <NativeSelectOption value="">Todos os barbeiros</NativeSelectOption>
        {barbers.map((barber) => (
          <NativeSelectOption key={barber.id} value={barber.id}>
            {barber.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <noscript>
        <button type="submit" className="h-11 rounded-lg border px-3">
          Filtrar
        </button>
      </noscript>
    </Form>
  );
}
