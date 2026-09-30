'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { toApiError } from '@/lib/api/errors';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { formValues, zodFieldErrors, type FormState } from '@/lib/forms';

// Only "is it a whole number" is checked here; the ranges of each rule are
// the API's (CA-06.3), which answers the message per field.
const wholeNumber = z
  .string()
  .trim()
  .min(1, 'Informe um valor.')
  .regex(/^-?\d+$/, 'Informe um número inteiro.')
  .transform(Number);

const rulesFormSchema = z.object({
  minimumAdvanceMinutes: wholeNumber,
  cancellationDeadlineMinutes: wholeNumber,
  noShowLimit: wholeNumber,
  waitlistOfferMinutes: wholeNumber,
  returnReminderDays: wholeNumber,
});

export async function saveBookingRules(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwner();
  const values = formValues(formData);
  const parsed = rulesFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error), values };
  }

  const api = await createSessionApiClient();
  const { data, error } = await api.PUT('/settings/rules', {
    body: parsed.data,
  });
  if (!data) return { ...toApiError(error), values };

  revalidatePath('/configuracoes/regras');
  return {
    success: 'Regras salvas. Elas valem para os próximos agendamentos.',
    values,
  };
}
