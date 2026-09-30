'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createApiClient } from '@/lib/api/client';
import { toApiError } from '@/lib/api/errors';
import { zodFieldErrors, type FormState } from '@/lib/forms';

const resetPasswordFormSchema = z.object({
  token: z.string().min(1, 'O link de redefinição está incompleto.'),
  newPassword: z.string().min(1, 'Informe a nova senha.'),
});

export async function resetPassword(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resetPasswordFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const { response, error } = await createApiClient().POST(
    '/auth/password/reset',
    { body: parsed.data },
  );
  if (!response.ok) return toApiError(error);

  redirect('/login?senha=redefinida');
}
