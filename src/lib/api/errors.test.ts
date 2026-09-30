import { describe, expect, it } from 'vitest';
import { toApiError } from './errors';

describe('toApiError', () => {
  it('keeps the API message and maps field errors', () => {
    expect(
      toApiError({
        message: 'Dados inválidos.',
        errors: [{ field: 'email', message: 'Informe o e-mail.' }],
      }),
    ).toEqual({
      message: 'Dados inválidos.',
      fieldErrors: { email: 'Informe o e-mail.' },
    });
  });

  it('falls back to a generic message for unexpected bodies', () => {
    expect(toApiError(undefined).message).toBe(
      'Não foi possível concluir. Tente de novo.',
    );
  });
});
