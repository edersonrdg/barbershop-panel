'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { toApiError } from '@/lib/api/errors';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { formatDateTime } from '@/lib/datetime';
import { formValues, zodFieldErrors, type FormState } from '@/lib/forms';

const PATH = '/configuracoes/usuarios';

const inviteFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome do barbeiro.'),
  email: z.string().trim().min(1, 'Informe o e-mail.'),
});

// CA-02.1: the API e-mails the barber a link to `/aceitar-convite`.
export async function inviteBarber(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const { barbershop } = await requireOwner();
  const values = formValues(formData);
  const parsed = inviteFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error), values };
  }

  const api = await createSessionApiClient();
  const { data, error } = await api.POST('/users/invitations', {
    body: parsed.data,
  });
  if (!data) return { ...toApiError(error), values };

  revalidatePath(PATH);
  const expiresAt = formatDateTime(data.expiresAt, barbershop.timezone);
  return {
    success: `Convite enviado para ${data.email}. O link vale até ${expiresAt}.`,
  };
}

// CA-02.3: access is revoked at once; the barber's appointments stay.
export async function removeUser(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwner();
  const parsed = z.object({ userId: z.uuid() }).safeParse({
    userId: formData.get('userId'),
  });
  if (!parsed.success) return { message: 'Usuário inválido.' };

  const api = await createSessionApiClient();
  const { response, error } = await api.DELETE('/users/{id}', {
    params: { path: { id: parsed.data.userId } },
  });
  if (!response.ok) return toApiError(error);

  revalidatePath(PATH);
  return {};
}
