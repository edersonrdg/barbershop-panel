'use server';

import { z } from 'zod';
import { createApiClient } from '@/lib/api/client';
import { toApiError } from '@/lib/api/errors';
import { formValues, zodFieldErrors, type FormState } from '@/lib/forms';

const forgotPasswordFormSchema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail.'),
});

// CA-01.5: the API answers the same message whether the e-mail exists or
// not, so the panel just shows it.
export async function requestPasswordReset(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData);
  const parsed = forgotPasswordFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error), values };
  }

  const { data, error } = await createApiClient().POST(
    '/auth/password/forgot',
    { body: parsed.data },
  );
  if (!data) return { ...toApiError(error), values };
  return { success: data.message };
}
