'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createApiClient } from '@/lib/api/client';
import { toApiError, type FieldErrors } from '@/lib/api/errors';
import { storeAccessToken } from '@/lib/auth/session-cookie';

export interface LoginState {
  message?: string;
  fieldErrors?: FieldErrors;
  email?: string;
}

const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail.'),
  password: z.string().min(1, 'Informe a senha.'),
});

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get('email') ?? '');
  const parsed = loginFormSchema.safeParse({
    email,
    password: String(formData.get('password') ?? ''),
  });
  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] ??= issue.message;
    }
    return { fieldErrors, email };
  }

  const { data, error } = await createApiClient().POST('/auth/login', {
    body: parsed.data,
  });
  if (!data) return { ...toApiError(error), email };

  await storeAccessToken(data.accessToken, data.expiresIn);
  redirect('/');
}
