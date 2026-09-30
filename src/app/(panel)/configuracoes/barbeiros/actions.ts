'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { toApiError } from '@/lib/api/errors';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { formValues, zodFieldErrors, type FormState } from '@/lib/forms';
import { mapWeek, readWeekHours } from '@/lib/week-hours';

const LIST_PATH = '/configuracoes/barbeiros';

export interface BarberFormState extends FormState {
  // CA-05.3: the barber is saved even when part of the week falls outside the
  // opening hours; the API returns one warning per affected day.
  saved?: { barberId: string; warnings: string[] };
}

const barberFormSchema = z.object({
  barberId: z.uuid().optional(),
  name: z.string().trim(),
  userId: z
    .union([z.uuid(), z.literal('')])
    .transform((value) => value || null),
  serviceIds: z.array(z.uuid()),
});

export async function saveBarber(
  _previous: BarberFormState,
  formData: FormData,
): Promise<BarberFormState> {
  await requireOwner();
  const values = formValues(formData);
  const parsed = barberFormSchema.safeParse({
    barberId: formData.get('barberId') || undefined,
    name: formData.get('name'),
    userId: formData.get('userId') ?? '',
    serviceIds: formData.getAll('serviceIds'),
  });
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error), values };
  }

  const { barberId, ...fields } = parsed.data;
  const body = {
    ...fields,
    workingHours: mapWeek(readWeekHours(formData), (hours) => ({
      startsAt: hours.start,
      endsAt: hours.end,
      break: hours.break
        ? { startsAt: hours.break.start, endsAt: hours.break.end }
        : null,
    })),
  };

  const api = await createSessionApiClient();
  const { data, error } = barberId
    ? await api.PUT('/settings/barbers/{barberId}', {
        params: { path: { barberId } },
        body,
      })
    : await api.POST('/settings/barbers', { body });
  if (!data) return { ...toApiError(error), values };

  revalidatePath(LIST_PATH, 'layout');
  if (data.warnings.length === 0) redirect(LIST_PATH);
  return {
    saved: {
      barberId: data.id,
      warnings: data.warnings.map((warning) => warning.message),
    },
  };
}

const toggleSchema = z.object({
  barberId: z.uuid(),
  active: z.enum(['true', 'false']),
});

export async function setBarberActive(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwner();
  const parsed = toggleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: 'Barbeiro inválido.' };

  const { barberId, active } = parsed.data;
  const api = await createSessionApiClient();
  const params = { path: { barberId } };
  const { data, error } =
    active === 'true'
      ? await api.POST('/settings/barbers/{barberId}/activate', { params })
      : await api.POST('/settings/barbers/{barberId}/deactivate', { params });
  if (!data) return toApiError(error);

  revalidatePath(LIST_PATH, 'layout');
  return {};
}
