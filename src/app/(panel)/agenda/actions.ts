'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { toApiError } from '@/lib/api/errors';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireAccount } from '@/lib/auth/current-account';
import type { FormState } from '@/lib/forms';

const attendanceSchema = z.object({
  appointmentId: z.uuid(),
  status: z.enum(['attended', 'no_show']),
});

// US-11: marks or corrects attendance. The API counts the no-shows and says
// whether the client reached the limit (CA-11.2); the panel only reports it.
export async function markAttendance(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAccount();
  const parsed = attendanceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: 'Agendamento inválido.' };

  const { appointmentId, status } = parsed.data;
  const api = await createSessionApiClient();
  const { data, error } = await api.PATCH('/appointments/{id}/status', {
    params: { path: { id: appointmentId } },
    body: { status },
  });
  if (!data) return toApiError(error);

  revalidatePath('/agenda');
  revalidatePath('/clientes', 'layout');
  if (status === 'attended') return { success: 'Atendimento registrado.' };
  if (data.client?.selfBookingBlocked) {
    return {
      success: `Falta registrada. O cliente está com ${data.client.noShowCount} faltas e não agenda mais sozinho pelo WhatsApp.`,
    };
  }
  return { success: 'Falta registrada.' };
}

export async function removeBlock(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireAccount();
  const parsed = z.object({ blockId: z.uuid() }).safeParse({
    blockId: formData.get('blockId'),
  });
  if (!parsed.success) return { message: 'Bloqueio inválido.' };

  const api = await createSessionApiClient();
  const { response, error } = await api.DELETE('/blocks/{blockId}', {
    params: { path: { blockId: parsed.data.blockId } },
  });
  if (!response.ok) return toApiError(error);

  revalidatePath('/agenda');
  return { success: 'Bloqueio removido.' };
}
