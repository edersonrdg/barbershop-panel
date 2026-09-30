'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { toApiError } from '@/lib/api/errors';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireAccount } from '@/lib/auth/current-account';
import { formValues, zodFieldErrors, type FormState } from '@/lib/forms';

// A slot is "<barberId>|<startsAt>", exactly as GET /available-slots returned
// it; the API revalidates everything on POST (RN-03, RN-05, RN-07).
const appointmentFormSchema = z.object({
  date: z.iso.date(),
  serviceIds: z.array(z.uuid()).min(1, 'Escolha ao menos um serviço.'),
  slot: z
    .string({ error: 'Escolha um horário.' })
    .transform((slot) => slot.split('|'))
    .pipe(
      z.tuple([z.uuid(), z.iso.datetime({ offset: true })], {
        error: 'Escolha um horário.',
      }),
    ),
  clientName: z.string().trim(),
  clientPhone: z.string().trim(),
});

// US-10: saved with origin "manual" by the API (CA-10.1). A new phone creates
// the client, an existing one links to it (CA-10.2, RN-08).
export async function createAppointment(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAccount();
  const values = formValues(formData);
  const parsed = appointmentFormSchema.safeParse({
    date: formData.get('date'),
    serviceIds: formData.getAll('serviceIds'),
    slot: formData.get('slot') ?? undefined,
    clientName: formData.get('clientName'),
    clientPhone: formData.get('clientPhone'),
  });
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error), values };
  }

  const { date, serviceIds, slot, clientName, clientPhone } = parsed.data;
  const [barberId, startsAt] = slot;
  const api = await createSessionApiClient();
  const { data, error } = await api.POST('/appointments', {
    body: {
      barberId,
      serviceIds,
      startsAt,
      client: { name: clientName, phone: clientPhone },
    },
  });
  // CA-10.4: a conflict comes back with the rule that was broken.
  if (!data) return { ...toApiError(error), values };

  revalidatePath('/agenda');
  redirect(`/agenda?view=day&date=${date}`);
}
