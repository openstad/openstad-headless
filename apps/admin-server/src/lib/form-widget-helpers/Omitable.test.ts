import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createOmittedSchema } from './Omitable';

const baseSchema = z.object({
  title: z.string(),
  count: z.number(),
  hidden: z.boolean(),
});

describe('createOmittedSchema', () => {
  it('returns an equivalent schema when nothing is omitted', () => {
    const schema = createOmittedSchema(baseSchema);
    expect(Object.keys(schema.shape).sort()).toEqual([
      'count',
      'hidden',
      'title',
    ]);
  });

  it('drops the listed keys from the schema shape', () => {
    const schema = createOmittedSchema(baseSchema, ['hidden']);
    expect(Object.keys(schema.shape).sort()).toEqual(['count', 'title']);
  });

  it('parses input that omits the removed key', () => {
    const schema = createOmittedSchema(baseSchema, ['hidden']);
    const parsed = schema.parse({ title: 'x', count: 1 });
    expect(parsed).toEqual({ title: 'x', count: 1 });
  });

  it('can omit multiple keys', () => {
    const schema = createOmittedSchema(baseSchema, ['hidden', 'count']);
    expect(Object.keys(schema.shape)).toEqual(['title']);
  });
});
