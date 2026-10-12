import fs from 'fs';
import mjml2html from 'mjml';
import { createRequire } from 'module';
import nunjucks from 'nunjucks';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

const templatesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'default-templates'
);

const require = createRequire(import.meta.url);
const { buildQAHtmlTable } = require('../services/qa-processor');

function extractTemplate(type) {
  const file = fs.readFileSync(path.join(templatesDir, type)).toString();
  const match = file.match(
    /<subject>((?:.|\r|\n)*)<\/subject>(?:.|\r|\n)*<body>((?:.|\r|\n)*)<\/body>/
  );
  return { subject: match && match[1], body: match && match[2] };
}

describe('default template: user account about to expire', () => {
  const templateData = {
    user: { name: 'Test Gebruiker' },
    projectUrl: 'https://voorbeeld.openstad.org',
    projectName: 'Voorbeeldproject',
    anonymizeDate: '01-01-2030',
  };

  it('renders a non-empty mail body through nunjucks and mjml', async () => {
    const template = extractTemplate('user account about to expire');
    expect(template.subject).toBeTruthy();
    expect(template.body).toBeTruthy();

    const nunjucksEnv = new nunjucks.Environment();
    const subject = nunjucksEnv.renderString(template.subject, templateData);
    const body = nunjucksEnv.renderString(template.body, templateData);

    const result = await mjml2html(body);

    expect(result.errors).toEqual([]);
    expect(subject).toContain('We gaan je account verwijderen');
    expect(result.html).toContain('Test Gebruiker');
    expect(result.html).toContain('01-01-2030');
    expect(result.html).toContain('https://voorbeeld.openstad.org');
    expect(result.html).not.toContain('\\"');
  });
});

describe('default template: contact message - user', () => {
  it('renders the message, the reply address and the footer', async () => {
    const template = extractTemplate('contact message - user');
    const nunjucksEnv = new nunjucks.Environment();
    const body = nunjucksEnv.renderString(template.body, {
      user: { name: 'Bram' },
      resource: { title: 'Bram de Bouwer' },
      senderName: 'Cees',
      senderEmail: 'cees@example.nl',
      message: 'Zullen we samenwerken?',
      logo: 'https://gemeente.nl/logo.png',
    });

    const result = await mjml2html(body);

    expect(result.errors).toEqual([]);
    expect(template.subject).toBe('Bericht ontvangen over een inzending');
    expect(result.html).toContain('Zullen we samenwerken?');
    expect(result.html).toContain('mailto:cees@example.nl');
    expect(result.html).toContain('Dit is een automatisch bericht.');
    expect(result.html).toContain('https://gemeente.nl/logo.png');
    expect(result.html).toContain('Bericht van Cees');
  });
});

describe.each([
  [
    'new published resource - admin update',
    'Beste beheerder',
    'Bekijk de inzending',
  ],
  [
    'new published resource - user feedback',
    'Beste Test',
    'Bekijk je inzending',
  ],
])('default template: %s', (type, greeting, buttonLabel) => {
  const submissionContent = buildQAHtmlTable([
    { question: 'Wat is je idee?', answer: 'Een bankje bij de vijver' },
    { question: 'Waarom?', answer: 'Om even te rusten' },
  ]);

  async function render(data) {
    const template = extractTemplate(type);
    const body = new nunjucks.Environment().renderString(template.body, {
      user: { name: 'Test' },
      project: { title: 'P' },
      ...data,
    });
    return mjml2html(body);
  }

  it('renders the submission overview, project logo and button', async () => {
    const result = await render({
      submissionContent,
      logo: 'https://example.org/logo.png',
      redirectUrl: 'https://example.org/r',
    });

    expect(result.errors).toEqual([]);
    expect(result.html).not.toContain('<mj-table');
    expect(result.html).toContain('Een bankje bij de vijver');
    expect(result.html).toContain('Om even te rusten');
    expect(result.html).toContain('https://example.org/logo.png');
    expect(result.html).toContain(greeting);
    expect(result.html).toContain(buttonLabel);
    expect(result.html).toContain('href="https://example.org/r"');
  });

  it('renders without errors, button or table when there is no overview or link', async () => {
    const result = await render({ submissionContent: '' });

    expect(result.errors).toEqual([]);
    expect(result.html).not.toContain('undefined/');
    expect(result.html).not.toContain(buttonLabel);
    expect(result.html).not.toContain('background-color: #f0f0f0');
  });
});

describe('default template: new modbreak - user feedback', () => {
  const renderModBreakMail = (data) => {
    const template = extractTemplate('new modbreak - user feedback');
    const body = new nunjucks.Environment().renderString(template.body, {
      user: { name: 'Bram' },
      resource: { title: 'Bram de Bouwer' },
      project: { config: { resources: {} } },
      newModBreaks: [{ description: 'Let op', authorName: 'Redactie' }],
      logo: 'https://gemeente.nl/logo.png',
      ...data,
    });
    return mjml2html(body);
  };

  it('renders in the layout of the contact message mail', async () => {
    const result = await renderModBreakMail({});

    expect(result.errors).toEqual([]);
    expect(result.html).toContain('https://gemeente.nl/logo.png');
    expect(result.html).toContain('Er is een modbreak geplaatst.');
    expect(result.html).toContain('Let op - Redactie');
    expect(result.html).toContain('Dit is een automatisch bericht.');
    expect(result.html).not.toContain('mail-header.jpg');
    expect(result.html).not.toContain('logo-openstad.png');
  });

  it('links to the resource with a button and a plain link', async () => {
    const redirectUrl = 'https://gemeente.nl/inzending?openstadResourceId=5';
    const result = await renderModBreakMail({ redirectUrl });

    expect(result.errors).toEqual([]);
    expect(result.html).toMatch(
      new RegExp(`href="${redirectUrl.replace('?', '\\?')}"[^>]*>\\s*Weergeven`)
    );
    expect(result.html).toContain(`>${redirectUrl}</a>`);
  });

  it('shows the unsubscribe link only when there is one', async () => {
    const withLink = await renderModBreakMail({
      unsubscribeUrl: 'https://api.example.nl/unsubscribe/1',
    });
    const withoutLink = await renderModBreakMail({});

    expect(withLink.html).toContain('https://api.example.nl/unsubscribe/1');
    expect(withLink.html).toContain('Uitschrijven');
    expect(withoutLink.html).not.toContain('Uitschrijven');
  });
});
