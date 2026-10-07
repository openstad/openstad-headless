import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { fieldLabelFor, readFieldValues } from './fields';
import { LoginDialogContent, loginDialogTexts } from './index';

const render = (
  props: Partial<React.ComponentProps<typeof LoginDialogContent>> = {}
) =>
  renderToStaticMarkup(
    <LoginDialogContent
      titleId="title"
      step="uniquecode"
      texts={loginDialogTexts}
      onSubmitCode={vi.fn()}
      onSubmitFields={vi.fn()}
      {...props}
    />
  );

const attr = (markup: string, pattern: RegExp) => markup.match(pattern)?.[1];
const inputTag = (markup: string, name: string) =>
  markup.match(new RegExp(`<input[^>]*name="${name}"[^>]*>`))?.[0] ?? '';

describe('LoginDialogContent', () => {
  it('labels the code field and names the dialog by its heading', () => {
    const markup = render();

    expect(markup).toContain('id="title"');
    const labelFor = attr(markup, /<label[^>]*for="([^"]+)"/);
    expect(markup).toContain(`id="${labelFor}"`);
    const code = inputTag(markup, 'code');
    expect(code).toContain('required=""');
    expect(code).toContain('aria-required="true"');
  });

  it('announces an error and ties the field to it', () => {
    const markup = render({ error: 'invalid_code' });

    const errorId = attr(markup, /<p[^>]*id="([^"]+)"[^>]*role="alert"/);
    expect(markup).toContain(loginDialogTexts.errors.invalid_code);
    expect(markup).toMatch(new RegExp(`aria-describedby="${errorId}"`));
    expect(markup).toContain('aria-invalid="true"');
  });

  it('renders the missing fields with project labels and a privacy link', () => {
    const markup = render({
      step: 'fields',
      missingFields: ['name', 'privacyConsent', 'emailNotificationConsent'],
      labels: { privacyConsent: 'Ik ga akkoord met de {link}.' },
      privacy: {
        url: 'https://example.com/privacy',
        text: 'privacyverklaring',
      },
    });

    expect(markup).toContain('Naam');
    expect(markup).toContain('Ik ga akkoord met de ');
    expect(markup).toContain(
      '<a href="https://example.com/privacy" target="_blank" rel="noopener noreferrer">privacyverklaring (opent in nieuw tabblad)</a>'
    );
    expect(inputTag(markup, 'privacyConsent')).toContain('required=""');
    expect(inputTag(markup, 'emailNotificationConsent')).not.toContain(
      'required=""'
    );
  });

  it('shows the plain label when there is no privacy link', () => {
    const markup = render({
      step: 'fields',
      missingFields: ['privacyConsent'],
      labels: { privacyConsent: 'Ik ga akkoord met de {link}.' },
    });

    expect(markup).not.toContain('<a ');
  });

  it('marks only the fields the server rejected', () => {
    const markup = render({
      step: 'fields',
      missingFields: ['name', 'postcode'],
      error: 'invalid_fields',
      invalidFields: ['postcode'],
    });

    expect(markup).toContain('role="alert"');
    expect(inputTag(markup, 'postcode')).toContain('aria-invalid="true"');
    expect(inputTag(markup, 'name')).not.toContain('aria-invalid="true"');
  });

  it('explains a blocked popup and offers a same-window login', () => {
    const markup = render({ step: 'blocked' });

    expect(markup).toContain('id="title"');
    expect(markup).toMatch(/role="status"[^>]*>[^<]*venster/);
    expect(markup).toMatch(/<button[^>]*autofocus=""[^>]*>Inloggen in dit venster/i);
  });
});

describe('login dialog fields', () => {
  it('prefers project labels over the defaults', () => {
    expect(fieldLabelFor('postcode', { postcode: 'Je postcode' })).toBe(
      'Je postcode'
    );
    expect(fieldLabelFor('postcode')).toBe('Postcode');
  });

  it('reads checkboxes as booleans and trims text', () => {
    const formData = new FormData();
    formData.set('name', '  Jan ');
    formData.set('privacyConsent', 'on');

    expect(
      readFieldValues(formData, [
        'name',
        'privacyConsent',
        'emailNotificationConsent',
      ])
    ).toEqual({
      name: 'Jan',
      privacyConsent: true,
      emailNotificationConsent: false,
    });
  });
});
