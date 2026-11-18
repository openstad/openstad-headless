import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');
const { CONTENT_CATALOG, fixedBlockDescription } = require('./content-catalog');
const { buildContentMjml } = require('./content-layout');
const { renderTemplate } = require('../models/NotificationMessage');
const { previewData } = require('./preview-data');

const LOGO = 'https://example.com/brand.png';

const KEY_SENTENCES = {
  'new published resource - user feedback':
    'Bedankt voor je inzending! Je inzending is goed ontvangen',
  'new published resource - admin update':
    'Er is een nieuwe inzending binnengekomen.',
  'updated resource - user feedback':
    'U heeft recentelijk een van uw inzendingen aangepast.',
  'updated resource - admin update':
    'Er is recentelijk een bestaande inzending aangepast.',
  'new concept resource - user feedback':
    'Bedankt voor het aanmaken van een concept van een inzending!',
  'new enquete - admin':
    'Er is een nieuwe inzending ontvangen van de enquête op de website.',
  'new enquete - user': 'Bedankt voor het invullen van onze enquête!',
  'notification comment - user':
    'Hier zie je een positieve reactie op je inzending.',
  'notification comment reply - user': 'Hier zie je de reactie op je reactie.',
  'new comment - admin':
    'Op de inzending Meer bomen in de straat is er zojuist gereageerd op een eerdere reactie.',
  'contact message - user':
    'Voorbeeld Afzender heeft een bericht gestuurd over de inzending',
  'new modbreak - user feedback': 'De redactie heeft een bericht geplaatst bij',
  'user account about to expire':
    'We willen niet onnodig je gegevens blijven bewaren',
  'project issues warning': 'Voorbeeld van een waarschuwing',
  'system issues warning': 'Er is iets misgegaan met het systeem.',
};

function sampleData({ logo = LOGO } = {}) {
  const project = db.Project.build({
    id: 1,
    name: 'Voorbeeldproject',
    title: 'Voorbeeldproject',
    config: {},
  });
  return previewData({ project, styling: { logo, accentColor: '#d32f2f' } });
}

function render(type, content, data = sampleData()) {
  return renderTemplate(
    {
      subject: CONTENT_CATALOG[type].subject,
      body: buildContentMjml(type, content),
    },
    data,
    { engine: 'email', type, projectId: 1 }
  );
}

function withContent(type, overrides) {
  return { ...CONTENT_CATALOG[type].content, ...overrides };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('content catalog', () => {
  it('covers exactly the mails the api sends, apart from login mail and sms', () => {
    expect(Object.keys(CONTENT_CATALOG).sort()).toEqual(
      Object.keys(KEY_SENTENCES).sort()
    );
  });

  it.each(Object.keys(KEY_SENTENCES))(
    '%s renders its current text without mjml errors',
    async (type) => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { subject, body } = await render(
        type,
        CONTENT_CATALOG[type].content
      );

      expect(errors).not.toHaveBeenCalled();
      expect(subject.trim()).not.toBe('');
      expect(body).toContain(KEY_SENTENCES[type]);
      expect(body).toContain(`src="${LOGO}"`);
      expect(body.toLowerCase()).toContain('#d32f2f');
    }
  );

  it('describes the fixed block of a mail', () => {
    expect(fixedBlockDescription('notification comment - user')).toBe(
      'de reactie en een uitschrijflink'
    );
    expect(fixedBlockDescription('system issues warning')).toBe('');
  });
});

describe('content layout', () => {
  const type = 'new published resource - user feedback';

  it('shows the logo only when it is switched on and there is one', async () => {
    const off = await render(type, withContent(type, { showLogo: false }));
    const noLogo = await render(
      type,
      withContent(type, {}),
      sampleData({ logo: '' })
    );

    expect(off.body).not.toContain('<img');
    expect(noLogo.body).not.toContain('<img');
  });

  it('leaves out the button when the link is empty', async () => {
    const { body } = await render(type, withContent(type, { buttonUrl: '' }));

    expect(body).not.toContain('Bekijk je inzending');
    expect(body).not.toContain('Werkt de knop niet');
  });

  it('leaves out the button when the link variable is empty', async () => {
    const data = sampleData();
    data.redirectUrl = '';

    const { body } = await render(type, withContent(type, {}), data);

    expect(body).not.toContain('Werkt de knop niet');
  });

  it('uses a fixed button link and keeps quotes inside the attribute', async () => {
    const { body } = await render(
      type,
      withContent(type, { buttonUrl: 'https://gemeente.nl/?a="b' })
    );

    expect(body).toContain('href="https://gemeente.nl/?a=&quot;b"');
  });

  it('escapes html typed into a text field', async () => {
    const { body } = await render(
      type,
      withContent(type, { intro: '<script>alert(1)</script> & meer' })
    );

    expect(body).not.toContain('<script>');
    expect(body).toContain('&lt;script&gt;alert(1)&lt;/script&gt; &amp; meer');
  });

  it('fills in variables and conditions in a text field', async () => {
    const { body } = await render(
      type,
      withContent(type, {
        heading: 'Hallo {{ user.name }}',
        intro: '{% if resource.title %}Over {{ resource.title }}{% endif %}',
      })
    );

    expect(body).toContain('Hallo Voorbeeld Gebruiker');
    expect(body).toContain('Over Meer bomen in de straat');
  });

  it('turns blank lines into paragraphs and single lines into line breaks', () => {
    const mjml = buildContentMjml(
      type,
      withContent(type, {
        intro: 'Eerste regel\ntweede regel\n\nNieuwe alinea',
      })
    );

    expect(mjml).toContain('Eerste regel<br/>tweede regel</mj-text>');
    expect(mjml).toContain('>Nieuwe alinea</mj-text>');
  });

  it('refuses a type without a catalog entry', () => {
    expect(() => buildContentMjml('login email', {})).toThrow(
      "No content catalog entry for notification type 'login email'"
    );
  });
});
