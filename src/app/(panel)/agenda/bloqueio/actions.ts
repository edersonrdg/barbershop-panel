'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { toApiError } from '@/lib/api/errors';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireAccount } from '@/lib/auth/current-account';
import { formValues, zodFieldErrors, type FormState } from '@/lib/forms';
import type { Appointment } from '../schedule';

export interface BlockFormState extends FormState {
  // CA-09.3: appointments the block would hit. Nothing is saved or cancelled
  // until the user confirms.
  conflicts?: Appointment[];
}

const blockFormSchema = z.object({
  barberId: z.uuid({ error: 'Escolha o barbeiro.' }),
  kind: z.enum(['block', 'day_off'], { error: 'Escolha o tipo.' }),
  date: z.string(),
  start: z.string(),
  end: z.string(),
  reason: z
    .string()
    .trim()
    .transform((reason) => reason || undefined),
  confirmConflicts: z.literal('true').optional(),
});

export async function createBlock(
  _previous: BlockFormState,
  formData: FormData,
): Promise<BlockFormState> {
  await requireAccount();
  const values = formValues(formData);
  const parsed = blockFormSchema.safeParse({
    barberId: formData.get('barberId'),
    kind: formData.get('kind'),
    date: formData.get('date') ?? '',
    start: formData.get('start') ?? '',
    end: formData.get('end') ?? '',
    reason: formData.get('reason') ?? '',
    confirmConflicts: formData.get('confirmConflicts') ?? undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error), values };
  }

  const { kind, start, end, confirmConflicts, ...common } = parsed.data;
  const base = { ...common, confirmConflicts: confirmConflicts === 'true' };
  const api = await createSessionApiClient();
  const { data, error, response } = await api.POST('/blocks', {
    body:
      kind === 'day_off' ? { kind, ...base } : { kind, ...base, start, end },
  });

  if (response.status === 409 && error && 'appointments' in error) {
    return { message: error.message, conflicts: error.appointments, values };
  }
  if (!data) return { ...toApiError(error), values };

  revalidatePath('/agenda');
  redirect(`/agenda?view=day&date=${common.date}`);
}
