import { createRequire } from 'module';
import { afterEach, describe, expect, it } from 'vitest';

// Same CJS singleton the module under test holds; stub db methods on it. hasRole
// is a pure function captured at module load, so it is exercised with crafted
// user roles rather than mocked.
const require = createRequire(import.meta.url);
const db = require('../db');
const { canUserWriteToProject, buildTargetMaps } = require('./widget-copy');

const originals = {
  userFindOne: db.User.findOne,
  tagFindAll: db.Tag.findAll,
  statusFindAll: db.Status.findAll,
  markersFindAll: db.Markers.findAll,
};

afterEach(() => {
  db.User.findOne = originals.userFindOne;
  db.Tag.findAll = originals.tagFindAll;
  db.Status.findAll = originals.statusFindAll;
  db.Markers.findAll = originals.markersFindAll;
});

const idpUser = { identifier: 'abc', provider: 'openstad' };

describe('canUserWriteToProject', () => {
  it('allows a superuser without looking up a membership', async () => {
    db.User.findOne = async () => {
      throw new Error('should not query');
    };
    await expect(
      canUserWriteToProject({
        user: { role: 'superuser' },
        targetProjectId: 2,
      })
    ).resolves.toBe(true);
  });

  // The security boundary this endpoint rests on: `req.user.role` is not
  // project-scoped for fixed API tokens, so a role check alone would let an
  // admin of one project write widgets into another.
  it('denies a project admin who has no membership of the target project', async () => {
    db.User.findOne = async ({ where }) =>
      where.projectId === 5 ? { id: 1, role: 'admin' } : null;

    await expect(
      canUserWriteToProject({
        user: { role: 'admin', idpUser },
        targetProjectId: 2,
      })
    ).resolves.toBe(false);
    await expect(
      canUserWriteToProject({
        user: { role: 'admin', idpUser },
        targetProjectId: 5,
      })
    ).resolves.toBe(true);
  });

  it('denies a user without an idp identity, without querying', async () => {
    db.User.findOne = async () => {
      throw new Error('should not query');
    };
    await expect(
      canUserWriteToProject({ user: { role: 'admin' }, targetProjectId: 2 })
    ).resolves.toBe(false);
  });
});

describe('buildTargetMaps', () => {
  const SOURCE = 3;
  const TARGET = 2;
  const GLOBAL = 0;

  // Stubs the three tag queries buildTargetMaps fires, keyed by project id.
  function stubTags({ source = [], target = [], global = [] }) {
    db.Tag.findAll = async ({ where }) => {
      if (where.projectId === SOURCE) return source;
      if (where.projectId === TARGET) return target;
      if (where.projectId === GLOBAL) return global;
      throw new Error(`unexpected projectId ${where.projectId}`);
    };
  }

  function stubStatuses({ source = [], target = [] }) {
    db.Status.findAll = async ({ where }) =>
      where.projectId === SOURCE ? source : target;
  }

  function stubMarkerSets({ source = [], target = [] }) {
    db.Markers.findAll = async ({ where }) =>
      where.projectId === SOURCE ? source : target;
  }

  it('maps source rows onto the target project equivalents', async () => {
    stubTags({
      source: [{ id: 10, type: 'theme', name: 'Groen' }],
      target: [{ id: 30, type: 'theme', name: 'Groen' }],
    });
    stubStatuses({
      source: [{ id: 5, name: 'Open' }],
      target: [{ id: 60, name: 'Open' }],
    });
    stubMarkerSets({
      source: [{ id: 55, name: 'Stembureaus' }],
      target: [{ id: 90, name: 'Stembureaus' }],
    });

    await expect(buildTargetMaps(SOURCE, TARGET)).resolves.toEqual({
      tagMap: { 10: 30 },
      statusMap: { 5: 60 },
      markerSetMap: { 55: 90 },
    });
  });

  it('maps a global tag onto itself', async () => {
    // A global tag (projectId 0) is offered in every project's tag picker, so its
    // id is already valid in the target project.
    stubTags({ global: [{ id: 99, type: 'theme', name: 'Landelijk' }] });
    stubStatuses({});
    stubMarkerSets({});

    const { tagMap } = await buildTargetMaps(SOURCE, TARGET);
    expect(tagMap).toEqual({ 99: 99 });
  });

  it('still maps a global tag when the target owns one with the same name', async () => {
    // Matching global tags by name breaks here: the target identity occurs twice,
    // reads as ambiguous, and the reference would be cleared for no reason.
    const globalTag = { id: 99, type: 'theme', name: 'Groen' };
    stubTags({
      target: [{ id: 30, type: 'theme', name: 'Groen' }],
      global: [globalTag],
    });
    stubStatuses({});
    stubMarkerSets({});

    const { tagMap } = await buildTargetMaps(SOURCE, TARGET);
    expect(tagMap[99]).toBe(99);
  });

  it('omits a marker set with no equivalent in the target project', async () => {
    stubTags({});
    stubStatuses({});
    stubMarkerSets({
      source: [{ id: 55, name: 'Alleen hier' }],
      target: [{ id: 90, name: 'Stembureaus' }],
    });

    const { markerSetMap } = await buildTargetMaps(SOURCE, TARGET);
    expect(markerSetMap).toEqual({});
  });
});
