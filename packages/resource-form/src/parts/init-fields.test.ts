import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import { defaultFormValues } from './default-values';
import { InitializeFormFields } from './init-fields';

function runInitializeFormFields(items: any[], data: any) {
  let result: ReturnType<typeof InitializeFormFields> = [];
  function Harness() {
    result = InitializeFormFields(items, data);
    return null;
  }
  renderToStaticMarkup(React.createElement(Harness));
  return result;
}

describe('InitializeFormFields', () => {
  beforeAll(() => {
    (globalThis as any).window = { location: { search: '' } };
  });

  it('forwards the image description options for the default images field (type "images", fieldType "imageUpload")', () => {
    const imagesItem = defaultFormValues.find((item) => item.type === 'images');
    expect(imagesItem).toBeDefined();
    expect(imagesItem?.fieldType).toBe('imageUpload');

    const fields = runInitializeFormFields([imagesItem], {
      projectId: 1,
      api: 'https://example.com',
    });

    const field = fields.find((f) => f.fieldKey === 'images');
    expect(field).toBeDefined();
    expect(field?.allowImageDescription).toBe(false);
    expect(field?.imageDescriptionLabel).toBe('Opmerking bij deze afbeelding');
  });

  it('forwards a custom label and an enabled toggle', () => {
    const imagesItem = defaultFormValues.find((item) => item.type === 'images');

    const fields = runInitializeFormFields(
      [
        {
          ...imagesItem,
          allowImageDescription: true,
          imageDescriptionLabel: 'Is dit een AI-afbeelding?',
        },
      ],
      { projectId: 1, api: 'https://example.com' }
    );

    const field = fields.find((f) => f.fieldKey === 'images');
    expect(field?.allowImageDescription).toBe(true);
    expect(field?.imageDescriptionLabel).toBe('Is dit een AI-afbeelding?');
  });

  it('forwards the upload limits for the default images field', () => {
    const imagesItem = defaultFormValues.find((item) => item.type === 'images');

    const defaults = runInitializeFormFields([imagesItem], {
      projectId: 1,
      api: 'https://example.com',
    }).find((f) => f.fieldKey === 'images');
    expect(defaults?.allowedTypes).toEqual(['image/*']);
    expect(defaults?.maxUploadSizeMB).toBe(25);

    const configured = runInitializeFormFields(
      [{ ...imagesItem, allowedTypes: ['image/png'], maxUploadSizeMB: 5 }],
      { projectId: 1, api: 'https://example.com' }
    ).find((f) => f.fieldKey === 'images');
    expect(configured?.allowedTypes).toEqual(['image/png']);
    expect(configured?.maxUploadSizeMB).toBe(5);
  });
});
