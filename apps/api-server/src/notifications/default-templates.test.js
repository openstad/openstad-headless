import fs from 'fs';
import mjml2html from 'mjml';
import nunjucks from 'nunjucks';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';

const templatesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'default-templates'
);

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
