import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  checkedOf,
  errorUnder,
  formValues,
  valueOf,
  valuesOf,
  zodFieldErrors,
} from './forms';

describe('zodFieldErrors', () => {
  it('keeps the first message of each field path', () => {
    const schema = z.object({
      name: z.string().min(2, 'Nome curto.'),
      client: z.object({ phone: z.string().min(1, 'Informe o telefone.') }),
    });
    const result = schema.safeParse({ name: 'a', client: { phone: '' } });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(zodFieldErrors(result.error)).toEqual({
      name: 'Nome curto.',
      'client.phone': 'Informe o telefone.',
    });
  });
});

describe('errorUnder', () => {
  it('finds the error of the field or of an item under it', () => {
    const errors = { name: 'Nome curto.', 'serviceIds.1': 'Id inválido.' };
    expect(errorUnder(errors, 'name')).toBe('Nome curto.');
    expect(errorUnder(errors, 'serviceIds')).toBe('Id inválido.');
    expect(errorUnder(errors, 'service')).toBeUndefined();
    expect(errorUnder(undefined, 'name')).toBeUndefined();
  });
});

describe('formValues', () => {
  it('keeps single and repeated fields and drops omitted ones', () => {
    const formData = new FormData();
    formData.append('name', 'Corte');
    formData.append('addOns', 'a');
    formData.append('addOns', 'b');
    formData.append('password', 'secreta');
    formData.append('$ACTION_ID_123', '');

    expect(formValues(formData, ['password'])).toEqual({
      name: 'Corte',
      addOns: ['a', 'b'],
    });
  });
});

describe('reading echoed values', () => {
  it('uses the initial value before the first submission', () => {
    expect(valueOf(undefined, 'name')).toBeUndefined();
    expect(valuesOf(undefined, 'ids', ['x'])).toEqual(['x']);
    expect(checkedOf(undefined, 'open', true)).toBe(true);
  });

  it('treats a missing key after a submission as unchecked', () => {
    const values = { name: 'Corte' };
    expect(valueOf(values, 'name')).toBe('Corte');
    expect(valuesOf(values, 'ids', ['x'])).toEqual([]);
    expect(checkedOf(values, 'open', true)).toBe(false);
  });
});
