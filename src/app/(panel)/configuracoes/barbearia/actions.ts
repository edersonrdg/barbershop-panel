'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { toApiError } from '@/lib/api/errors';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { formValues, zodFieldErrors, type FormState } from '@/lib/forms';
import { mapWeek, readWeekHours } from '@/lib/week-hours';
import { TIMEZONES } from './timezones';

const barbershopFormSchema = z.object({
  name: z.string().trim(),
  address: z.string().trim(),
  timezone: z.enum(TIMEZONES, { error: 'Escolha um fuso horário do Brasil.' }),
});

// US-03 (CA-03.1 to CA-03.3): the API validates the hours, including a
// closing time before the opening one, and answers the message per field.
export async function saveBarbershopSettings(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwner();
  const values = formValues(formData);
  const parsed = barbershopFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error), values };
  }

  const openingHours = mapWeek(readWeekHours(formData), (hours) => ({
    opensAt: hours.start,
    closesAt: hours.end,
    break: hours.break
      ? { startsAt: hours.break.start, endsAt: hours.break.end }
      : null,
  }));

  const api = await createSessionApiClient();
  const { data, error } = await api.PUT('/settings/barbershop', {
    body: { ...parsed.data, openingHours },
  });
  if (!data) return { ...toApiError(error), values };

  // The name and timezone also live in the layout (via GET /me).
  revalidatePath('/', 'layout');
  return { success: 'Dados da barbearia salvos.', values };
}
