import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';

import { defaultFormValues } from './default-values';
import { InitializeFormFields } from './init-fields';

// InitializeFormFields calls React hooks (via DataStore) and reads
// window.location.search, so it can only run inside a real render. There is
// no jsdom/@testing-library in this repo, so a server-side render is used
// as the lightest available React render context, and only the one browser
// global the function touches is stubbed.
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
});
