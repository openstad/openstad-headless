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
    });

    const result = await mjml2html(body);

    expect(result.errors).toEqual([]);
    expect(template.subject).toBe('Bericht ontvangen over een inzending');
    expect(result.html).toContain('Zullen we samenwerken?');
    expect(result.html).toContain('mailto:cees@example.nl');
    expect(result.html).toContain('Dit is een automatisch bericht.');
  });
});
