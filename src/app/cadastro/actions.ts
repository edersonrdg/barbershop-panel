'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createApiClient } from '@/lib/api/client';
import { toApiError } from '@/lib/api/errors';
import { storeAccessToken } from '@/lib/auth/session-cookie';
import { formValues, zodFieldErrors, type FormState } from '@/lib/forms';

// Only the shape is checked here; the rules (lengths, e-mail, phone, password)
// belong to the API, which answers each field in `errors`.
const signupFormSchema = z.object({
  barbershopName: z.string().trim().min(1, 'Informe o nome da barbearia.'),
  ownerName: z.string().trim().min(1, 'Informe o seu nome.'),
  email: z.string().trim().min(1, 'Informe o e-mail.'),
  phone: z.string().trim().min(1, 'Informe o telefone.'),
  password: z.string().min(1, 'Informe a senha.'),
});

// US-01 (CA-01.1, CA-01.2): the API creates the barbershop in trial and
// already returns the session, so the owner lands in the panel.
export async function signup(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const values = formValues(formData, ['password']);
  const parsed = signupFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error), values };
  }

  const { data, error } = await createApiClient().POST('/auth/signup', {
    body: parsed.data,
  });
  if (!data) return { ...toApiError(error), values };

  await storeAccessToken(data.accessToken, data.expiresIn);
  redirect('/');
}
