import { describe, expect, test } from 'vitest';

import { getSchemaForField } from './validation';

function firstZodIssueMessage(e: unknown): string | null {
  if (!e || typeof e !== 'object' || !('message' in e)) return null;
  const message = (e as any).message;
  if (typeof message !== 'string') return null;

  try {
    const parsed = JSON.parse(message);
    if (
      Array.isArray(parsed) &&
      parsed[0] &&
      typeof parsed[0].message === 'string'
    ) {
      return parsed[0].message;
    }
  } catch {
    // ignore
  }

  return null;
}

describe('getSchemaForField: text/email variant', () => {
  test('required: empty triggers required warning', () => {
    const field: any = {
      type: 'text',
      title: 'Email',
      fieldKey: 'contactEmail',
      variant: 'email',
      fieldRequired: true,
    };
    const schema = getSchemaForField(field);
    expect(schema).toBeTruthy();

    try {
      schema!.parse('');
      throw new Error('Expected parse to throw');
    } catch (e) {
      expect(firstZodIssueMessage(e)).toMatch(/is verplicht/);
    }
  });

  test('required: invalid email triggers email warning', () => {
    const field: any = {
      type: 'text',
      title: 'Email',
      fieldKey: 'contactEmail',
      variant: 'email',
      fieldRequired: true,
      emailError: 'Geen geldig emailadres',
    };
    const schema = getSchemaForField(field);

    try {
      schema!.parse('not-an-email');
      throw new Error('Expected parse to throw');
    } catch (e) {
      expect(firstZodIssueMessage(e)).toBe('Geen geldig emailadres');
    }
  });

  test('optional: empty string allowed, invalid still rejected', () => {
    const field: any = {
      type: 'text',
      title: 'Email',
      fieldKey: 'contactEmail',
      variant: 'email',
      fieldRequired: false,
    };
    const schema = getSchemaForField(field);

    expect(() => schema!.parse('')).not.toThrow();
    expect(() => schema!.parse('test@example.com')).not.toThrow();
    expect(() => schema!.parse('not-an-email')).toThrow();
  });

  test('sanitizes maxCharacters to avoid crashes on nonsense values', () => {
    const field: any = {
      type: 'text',
      title: 'Email',
      fieldKey: 'contactEmail',
      variant: 'email',
      fieldRequired: false,
      maxCharacters: 'not-a-number',
    };
    const schema = getSchemaForField(field);
    expect(() =>
      schema!.parse('this-is-a-very-long-email-address@example.com')
    ).not.toThrow();
  });

  test('negative/zero maxCharacters is treated as "no maximum"', () => {
    const field: any = {
      type: 'text',
      title: 'Email',
      fieldKey: 'contactEmail',
      variant: 'email',
      fieldRequired: false,
      maxCharacters: -1,
    };
    const schema = getSchemaForField(field);
    expect(() =>
      schema!.parse('this-is-a-very-long-email-address@example.com')
    ).not.toThrow();
  });
});

describe('getSchemaForField: text numeric coercion', () => {
  test('accepts string min/max without throwing', () => {
    const field: any = {
      type: 'text',
      title: 'Omschrijving',
      fieldKey: 'desc',
      fieldRequired: true,
      minCharacters: '2',
      maxCharacters: '5',
    };
    const schema = getSchemaForField(field);

    expect(() => schema!.parse('ab')).not.toThrow();
    expect(() => schema!.parse('a')).toThrow();
    expect(() => schema!.parse('abcdef')).toThrow();
  });
});
