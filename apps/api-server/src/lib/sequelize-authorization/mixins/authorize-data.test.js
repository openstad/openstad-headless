import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../../../db');

const editor = { role: 'editor', id: 5, projectId: 1 };

describe('authorizeData on update keeps records in their project', () => {
  it('drops a projectId change on a notification template', () => {
    const template = db.NotificationTemplate.build({ id: 3, projectId: 1 });
    const body = { projectId: 2, subject: 'New subject' };

    template.authorizeData(body, 'update', editor);

    expect(body.projectId).toBeUndefined();
    expect(body.subject).toBe('New subject');
  });

  it('keeps an unchanged projectId', () => {
    const tag = db.Tag.build({ id: 3, projectId: 1 });
    const body = { projectId: 1, name: 'x' };

    tag.authorizeData(body, 'update', editor);

    expect(body.projectId).toBe(1);
  });

  it('drops a resourceId change on a comment', () => {
    const comment = db.Comment.build({ id: 3, resourceId: 10 });
    const body = { resourceId: 11, description: 'x' };

    comment.authorizeData(body, 'update', editor);

    expect(body.resourceId).toBeUndefined();
  });

  it('drops a projectId change on a resource', () => {
    const resource = db.Resource.build({ id: 3, projectId: 1 });
    const body = { projectId: 2 };

    resource.authorizeData(body, 'update', editor);

    expect(body.projectId).toBeUndefined();
  });
});

describe('authorizeData on create keeps editor-only fields out of public submissions', () => {
  const anonymous = { role: 'anonymous' };
  const member = { role: 'member', id: 7 };

  it('drops score, sort and viewableByRole from an anonymous resource create', () => {
    const body = {
      title: 'Idea',
      budget: 500,
      score: 9.5,
      sort: 98765,
      viewableByRole: 'admin',
    };

    db.Resource.authorizeData(body, 'create', anonymous);

    expect(body.title).toBe('Idea');
    expect(body.budget).toBe(500);
    expect(body.score).toBeUndefined();
    expect(body.sort).toBeUndefined();
    expect(body.viewableByRole).toBeUndefined();
  });

  it('keeps score, sort and viewableByRole for an editor resource create', () => {
    const body = { title: 'Idea', score: 0.5, sort: 2, viewableByRole: 'member' };

    db.Resource.authorizeData(body, 'create', editor);

    expect(body.score).toBe(0.5);
    expect(body.sort).toBe(2);
    expect(body.viewableByRole).toBe('member');
  });

  it('drops score from a member comment create', () => {
    const body = { description: 'Reply', score: 9.5 };

    db.Comment.authorizeData(body, 'create', member);

    expect(body.description).toBe('Reply');
    expect(body.score).toBeUndefined();
  });
});
