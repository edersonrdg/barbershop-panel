import { describe, expect, it } from 'vitest';
import { isUuid, list, single } from './search-params';

describe('search params', () => {
  it('reads one or many values of a param', () => {
    expect(single(['a', 'b'])).toBe('a');
    expect(single(undefined)).toBeUndefined();
    expect(list('a')).toEqual(['a']);
    expect(list(undefined)).toEqual([]);
  });

  it('accepts only UUIDs as ids', () => {
    expect(isUuid('7d3c2f7e-5b1a-4c8e-9f2d-1a2b3c4d5e6f')).toBe(true);
    expect(isUuid('1 OR 1=1')).toBe(false);
    expect(isUuid(undefined)).toBe(false);
  });
});
