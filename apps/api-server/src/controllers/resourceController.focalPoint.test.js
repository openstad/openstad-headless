import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const ctrl = require('./resourceController');

const withPoint = [{ url: 'a.jpg', focalPoint: { x: 10, y: 20 } }];
const moderator = { id: 1, role: 'moderator' };
const member = { id: 2, role: 'member' };

function update(user, images) {
  const authorizeData = vi.fn().mockReturnThis();
  const resource = {
    can: () => true,
    authorizeData,
    update: vi.fn().mockResolvedValue({}),
  };
  const req = {
    user,
    body: { images },
    results: resource,
    params: {},
    project: {},
  };
  return new Promise((resolve, reject) => {
    ctrl.updateResource(req, {}, (err) => (err ? reject(err) : resolve()));
  }).then(() => authorizeData.mock.calls[0][0]);
}

describe('focal point is admin-only', () => {
  it('update: a non-moderator cannot set a focal point', async () => {
    const data = await update(member, withPoint);
    expect(data.images).toEqual([{ url: 'a.jpg' }]);
  });

  it('update: a non-moderator cannot clear a focal point (key stripped, setter carries over)', async () => {
    const data = await update(member, [{ url: 'a.jpg', focalPoint: null }]);
    expect(data.images[0]).not.toHaveProperty('focalPoint');
  });

  it('update: a moderator keeps the focal point', async () => {
    const data = await update(moderator, withPoint);
    expect(data.images).toEqual(withPoint);
  });

  it('create: strips for non-moderator, keeps for moderator', () => {
    const mk = (user) => ({
      user,
      params: { projectId: 1 },
      body: { images: withPoint },
    });
    expect(ctrl.prepareCreateResourceData(mk(member)).images).toEqual([
      { url: 'a.jpg' },
    ]);
    expect(ctrl.prepareCreateResourceData(mk(moderator)).images).toEqual(
      withPoint
    );
  });
});
