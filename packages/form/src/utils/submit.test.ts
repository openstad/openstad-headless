import { describe, expect, test } from 'vitest';

import { handleSubmit } from './submit';
import { getSchemaForField } from './validation';

describe('imageUpload field: extra description key on file objects', () => {
  const field: any = {
    type: 'imageUpload',
    title: 'Foto',
    fieldKey: 'images',
    fieldRequired: true,
  };

  const filesWithDescription = [
    { name: 'a.jpg', url: 'https://x/a.jpg', description: 'AI-generated' },
  ];

  test('getSchemaForField: the file schema does not reject an extra description key', () => {
    const schema = getSchemaForField(field);
    expect(schema).toBeTruthy();
    expect(() => schema!.parse(filesWithDescription)).not.toThrow();
  });

  test('handleSubmit: the description key reaches the submit handler unchanged', () => {
    let submittedValues: Record<string, unknown> | null = null;
    let capturedErrors: Record<string, string | null> = {};

    const result = handleSubmit(
      [field],
      { images: filesWithDescription },
      (errors) => {
        capturedErrors = errors as Record<string, string | null>;
      },
      [],
      (values) => {
        submittedValues = values;
      },
      null,
      true
    );

    expect(result.firstErrorKey).toBeNull();
    // No error is recorded for a field that parses successfully.
    expect(capturedErrors).toEqual({});
    expect(submittedValues).toEqual({ images: filesWithDescription });
    expect((submittedValues as any).images[0].description).toBe('AI-generated');
  });
});
