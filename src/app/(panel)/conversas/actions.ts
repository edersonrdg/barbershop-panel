'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { toApiError } from '@/lib/api/errors';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import type { FormState } from '@/lib/forms';

// CA-16.4: the bot answers this client again from the next message on.
export async function resumeBot(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwner();
  const parsed = z.object({ clientId: z.uuid() }).safeParse({
    clientId: formData.get('clientId'),
  });
  if (!parsed.success) return { message: 'Conversa inválida.' };

  const api = await createSessionApiClient();
  const { response, error } = await api.POST(
    '/whatsapp/conversations/{clientId}/resume',
    { params: { path: { clientId: parsed.data.clientId } } },
  );
  if (!response.ok) return toApiError(error);

  revalidatePath('/conversas');
  return { success: 'Assistente reativado nessa conversa.' };
}
