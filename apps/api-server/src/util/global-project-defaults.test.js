import { describe, expect, it } from 'vitest';

import {
  buildLoginTemplateRow,
  buildProjectDefaults,
  copyGlobalLoginTemplate,
} from './global-project-defaults.js';

describe('buildProjectDefaults', () => {
  it('returns empty defaults when there are no global settings', () => {
    expect(buildProjectDefaults(null)).toEqual({ config: {}, emailConfig: {} });
  });

  it('copies the configured branding', () => {
    const defaults = buildProjectDefaults({
      config: {
        styling: {
          logo: 'https://x.nl/logo.png',
          favicon: 'https://x.nl/f.ico',
        },
      },
    });
    expect(defaults.config.styling).toEqual({
      logo: 'https://x.nl/logo.png',
      favicon: 'https://x.nl/f.ico',
    });
  });

  it('skips empty values so the project schema default keeps winning', () => {
    const defaults = buildProjectDefaults({
      config: { styling: { logo: '', favicon: 'https://x.nl/f.ico' } },
      emailConfig: {
        notifications: { fromAddress: '', replyTo: 'reply@x.nl' },
      },
    });
    expect(defaults.config.styling).toEqual({ favicon: 'https://x.nl/f.ico' });
    expect(defaults.emailConfig.notifications).toEqual({
      replyTo: 'reply@x.nl',
    });
  });

  it('leaves a section out entirely when none of its keys are set', () => {
    const defaults = buildProjectDefaults({
      config: { styling: { logo: '', favicon: '' } },
      emailConfig: {
        login: { fromAddress: '', fromName: '', helpAddress: '' },
      },
    });
    expect(defaults).toEqual({ config: {}, emailConfig: {} });
  });

  it('copies the notification and login senders', () => {
    const defaults = buildProjectDefaults({
      emailConfig: {
        notifications: {
          fromAddress: 'notif@x.nl',
          fromName: 'Naam',
          replyTo: 'reply@x.nl',
        },
        login: {
          fromAddress: 'login@x.nl',
          fromName: 'Login Naam',
          helpAddress: 'help@x.nl',
        },
      },
    });
    expect(defaults.emailConfig).toEqual({
      notifications: {
        fromAddress: 'notif@x.nl',
        fromName: 'Naam',
        replyTo: 'reply@x.nl',
      },
      login: {
        fromAddress: 'login@x.nl',
        fromName: 'Login Naam',
        helpAddress: 'help@x.nl',
      },
    });
  });

  it('ignores keys outside the inherited set', () => {
    const defaults = buildProjectDefaults({
      config: {
        styling: { logo: 'https://x.nl/l.png', inlineCSS: 'body{}' },
        auth: {},
      },
      emailConfig: { notifications: { projectmanagerAddress: 'pm@x.nl' } },
    });
    expect(defaults.config).toEqual({
      styling: { logo: 'https://x.nl/l.png' },
    });
    expect(defaults.emailConfig).toEqual({});
  });

  it('tolerates a site config without config or emailConfig', () => {
    expect(buildProjectDefaults({})).toEqual({ config: {}, emailConfig: {} });
  });
});

const globalLoginTemplate = {
  id: 7,
  engine: 'email',
  type: 'login email',
  label: 'Inloggen via e-mail',
  subject: 'Je inloglink',
  body: '<mjml>global login</mjml>',
  content: { heading: 'Inloggen' },
  createdAt: 'nope',
};

describe('buildLoginTemplateRow', () => {
  it('copies only the columns a project row owns', () => {
    expect(buildLoginTemplateRow(globalLoginTemplate, 5)).toEqual({
      projectId: 5,
      type: 'login email',
      engine: 'email',
      label: 'Inloggen via e-mail',
      subject: 'Je inloglink',
      body: '<mjml>global login</mjml>',
      content: { heading: 'Inloggen' },
    });
  });

  it('does not carry over the id or the timestamps', () => {
    const row = buildLoginTemplateRow(globalLoginTemplate, 5);
    expect(row.id).toBeUndefined();
    expect(row.createdAt).toBeUndefined();
  });

  it('returns null without a global template or without a project', () => {
    expect(buildLoginTemplateRow(null, 5)).toBe(null);
    expect(buildLoginTemplateRow(globalLoginTemplate, undefined)).toBe(null);
  });

  // An empty body would make NotificationMessage throw at send time instead of
  // falling back, so there is nothing worth copying.
  it('returns null when the global template has no body', () => {
    expect(buildLoginTemplateRow({ ...globalLoginTemplate, body: '' }, 5)).toBe(
      null
    );
  });

  it('falls back to the type as label', () => {
    const row = buildLoginTemplateRow(
      { ...globalLoginTemplate, label: undefined },
      5
    );
    expect(row.label).toBe('login email');
  });
});

function fakeDb({ globalTemplate = null, projectTemplate = null } = {}) {
  const created = [];
  return {
    created,
    SiteNotificationTemplate: {
      findOne: async () => globalTemplate,
    },
    NotificationTemplate: {
      findOne: async () => projectTemplate,
      create: async (row) => {
        created.push(row);
        return row;
      },
    },
  };
}

describe('copyGlobalLoginTemplate', () => {
  it('creates the project row from the global template', async () => {
    const db = fakeDb({ globalTemplate: globalLoginTemplate });
    await copyGlobalLoginTemplate(5, { db });
    expect(db.created).toEqual([
      {
        projectId: 5,
        type: 'login email',
        engine: 'email',
        label: 'Inloggen via e-mail',
        subject: 'Je inloglink',
        body: '<mjml>global login</mjml>',
        content: { heading: 'Inloggen' },
      },
    ]);
  });

  it('does not even query without a project id', async () => {
    const db = fakeDb({ globalTemplate: globalLoginTemplate });
    let queried = false;
    db.SiteNotificationTemplate.findOne = async () => {
      queried = true;
      return globalLoginTemplate;
    };

    expect(await copyGlobalLoginTemplate(undefined, { db })).toBe(null);
    expect(queried).toBe(false);
  });

  it('does nothing when there is no global login template', async () => {
    const db = fakeDb();
    expect(await copyGlobalLoginTemplate(5, { db })).toBe(null);
    expect(db.created).toEqual([]);
  });

  // A duplicated project brings the source's templates along. Overwriting one would be
  // exactly the thing this feature promises never to do.
  it('never overwrites a template the project already has', async () => {
    const db = fakeDb({
      globalTemplate: globalLoginTemplate,
      projectTemplate: { id: 1, type: 'login email', body: '<mjml>own</mjml>' },
    });
    expect(await copyGlobalLoginTemplate(5, { db })).toBe(null);
    expect(db.created).toEqual([]);
  });
});
