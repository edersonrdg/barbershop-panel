'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { toApiError } from '@/lib/api/errors';
import { createSessionApiClient } from '@/lib/api/session-client';
import { requireOwner } from '@/lib/auth/current-account';
import { formValues, zodFieldErrors, type FormState } from '@/lib/forms';
import { parseReaisToCents } from '@/lib/money';

const LIST_PATH = '/configuracoes/servicos';

// The panel only turns what was typed into the API types (reais into cents,
// text into numbers); price and duration limits (CA-04.4) are the API's.
const serviceFormSchema = z.object({
  serviceId: z.uuid().optional(),
  name: z.string().trim(),
  priceCents: z.string().transform((price, context) => {
    const cents = parseReaisToCents(price);
    if (cents === null) {
      context.addIssue({
        code: 'custom',
        message: 'Informe o preço em reais, por exemplo 45,00.',
      });
      return z.NEVER;
    }
    return cents;
  }),
  durationMinutes: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Informe a duração em minutos.')
    .transform(Number),
  suggestedAddOnIds: z.array(z.uuid()),
});

export async function saveService(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwner();
  const values = formValues(formData);
  const parsed = serviceFormSchema.safeParse({
    serviceId: formData.get('serviceId') || undefined,
    name: formData.get('name'),
    priceCents: formData.get('price'),
    durationMinutes: formData.get('durationMinutes'),
    suggestedAddOnIds: formData.getAll('suggestedAddOnIds'),
  });
  if (!parsed.success) {
    return { fieldErrors: zodFieldErrors(parsed.error), values };
  }

  const { serviceId, ...body } = parsed.data;
  const api = await createSessionApiClient();
  const { data, error } = serviceId
    ? await api.PUT('/settings/services/{serviceId}', {
        params: { path: { serviceId } },
        body,
      })
    : await api.POST('/settings/services', { body });
  if (!data) return { ...toApiError(error), values };

  revalidatePath(LIST_PATH);
  redirect(LIST_PATH);
}

const toggleSchema = z.object({
  serviceId: z.uuid(),
  active: z.enum(['true', 'false']),
});

// CA-04.3: a deactivated service leaves new bookings; existing ones stay.
export async function setServiceActive(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireOwner();
  const parsed = toggleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: 'Serviço inválido.' };

  const { serviceId, active } = parsed.data;
  const api = await createSessionApiClient();
  const params = { path: { serviceId } };
  const { data, error } =
    active === 'true'
      ? await api.POST('/settings/services/{serviceId}/activate', { params })
      : await api.POST('/settings/services/{serviceId}/deactivate', { params });
  if (!data) return toApiError(error);

  revalidatePath(LIST_PATH, 'layout');
  return {};
}
