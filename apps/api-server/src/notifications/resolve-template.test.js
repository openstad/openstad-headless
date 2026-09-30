import { describe, expect, it } from 'vitest';

import { resolveTemplate } from './resolve-template.js';

// A stand-in for the two Sequelize models. Each holds a list of rows and answers
// findOne with the first row matching every key of the where clause.
function fakeModel(rows) {
  return {
    calls: [],
    async findOne(options) {
      this.calls.push(options);
      const where = options.where || {};
      return (
        rows.find((row) =>
          Object.keys(where).every((key) => row[key] === where[key])
        ) || null
      );
    },
  };
}

function fakeDb({ projectRows = [], globalRows = [] } = {}) {
  return {
    NotificationTemplate: fakeModel(projectRows),
    SiteNotificationTemplate: fakeModel(globalRows),
  };
}

const projectRow = {
  projectId: 2,
  type: 'notification comment - user',
  subject: 'Project subject',
  body: '<mjml>project</mjml>',
};

const globalRow = {
  type: 'notification comment - user',
  subject: 'Global subject',
  body: '<mjml>global</mjml>',
};

describe('resolveTemplate', () => {
  it("returns the project's own template when it has one", async () => {
    const db = fakeDb({ projectRows: [projectRow], globalRows: [globalRow] });
    const template = await resolveTemplate({
      db,
      projectId: 2,
      type: 'notification comment - user',
    });
    expect(template.subject).toBe('Project subject');
  });

  // The whole point of the feature: a project that never saved this mail follows
  // the global one.
  it('falls back to the global template when the project has none', async () => {
    const db = fakeDb({ globalRows: [globalRow] });
    const template = await resolveTemplate({
      db,
      projectId: 2,
      type: 'notification comment - user',
    });
    expect(template.subject).toBe('Global subject');
  });

  it('falls back to the shipped file default when neither exists', async () => {
    const db = fakeDb();
    const template = await resolveTemplate({
      db,
      projectId: 2,
      type: 'notification comment - user',
    });
    expect(template.type).toBe('notification comment - user');
    expect(template.body).toContain('mj-');
  });

  it('returns null for a type without any template at all', async () => {
    const db = fakeDb();
    expect(
      await resolveTemplate({ db, projectId: 2, type: 'no such mail' })
    ).toBe(null);
  });

  // Another project's row must not leak in, so the project lookup has to filter
  // on both columns.
  it('scopes the project lookup to the project and the type', async () => {
    const db = fakeDb({ projectRows: [projectRow] });
    const template = await resolveTemplate({
      db,
      projectId: 3,
      type: 'notification comment - user',
    });
    expect(template.subject).not.toBe('Project subject');
    expect(db.NotificationTemplate.calls[0].where).toEqual({
      projectId: 3,
      type: 'notification comment - user',
    });
  });

  it('does not hit the global table when the project has its own row', async () => {
    const db = fakeDb({ projectRows: [projectRow], globalRows: [globalRow] });
    await resolveTemplate({
      db,
      projectId: 2,
      type: 'notification comment - user',
    });
    expect(db.SiteNotificationTemplate.calls).toEqual([]);
  });

  // A missing model must not take sending down: an installation that has not run
  // the migration yet still resolves through project rows and file defaults.
  it('skips the global step when the model is absent', async () => {
    const db = { NotificationTemplate: fakeModel([]) };
    const template = await resolveTemplate({
      db,
      projectId: 2,
      type: 'notification comment - user',
    });
    expect(template.type).toBe('notification comment - user');
  });
});
