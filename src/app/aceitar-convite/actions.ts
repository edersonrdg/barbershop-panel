'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createApiClient } from '@/lib/api/client';
import { toApiError } from '@/lib/api/errors';
import { storeAccessToken } from '@/lib/auth/session-cookie';
import { zodFieldErrors, type FormState } from '@/lib/forms';

const acceptInvitationFormSchema = z.object({
  token: z.string().min(1, 'O link do convite está incompleto.'),
  password: z.string().min(1, 'Informe a senha.'),
});

// CA-02.1: the invited barber creates the password and enters the panel with
// the Barbeiro profile. The new session replaces any previous one.
export async function acceptInvitation(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = acceptInvitationFormSchema.safeParse(
    Object.fromEntries(formData),
  );
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const { data, error } = await createApiClient().POST(
    '/auth/invitations/accept',
    { body: parsed.data },
  );
  if (!data) return toApiError(error);

  await storeAccessToken(data.accessToken, data.expiresIn);
  redirect('/');
}
