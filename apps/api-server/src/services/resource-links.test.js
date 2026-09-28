import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeEach, describe, expect, it } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');
const resourceLinks = require('./resource-links');

const PROJECT_ID = 1;
let links = [];
let resources = [];
let visibleResourceIds = [];
let created = null;
let destroyed = null;
let transactions = [];

function matches(row, where) {
  return Object.entries(where).every(([key, value]) => {
    if (Array.isArray(value)) return value.includes(row[key]);
    return row[key] === value;
  });
}

function orConditions(where) {
  const symbol = Object.getOwnPropertySymbols(where)[0];
  return symbol ? where[symbol] : null;
}

function findLinks(where) {
  const { ...plain } = where;
  const or = orConditions(where);
  return links.filter(
    (link) =>
      matches(link, plain) &&
      (!or || or.some((condition) => matches(link, condition)))
  );
}

function linkRow(data) {
  return {
    ...data,
    destroy: async (options) => {
      transactions.push(['destroy', options?.transaction]);
      destroyed = data.id;
    },
  };
}

db.ResourceLink.findAll = async ({ where }) => findLinks(where).map(linkRow);
db.ResourceLink.findOne = async ({ where, transaction }) => {
  transactions.push(['ResourceLink.findOne', transaction]);
  const found = findLinks(where)[0];
  return found ? linkRow(found) : null;
};
let createError = null;
db.ResourceLink.create = async (data, options) => {
  transactions.push(['create', options?.transaction]);
  if (createError) throw createError;
  created = data;
  return { id: 99, ...data };
};
db.Resource.findOne = async ({ where, transaction }) => {
  transactions.push(['Resource.findOne', transaction]);
  return resources.find((resource) => matches(resource, where)) || null;
};
db.Resource.scope = () => ({
  findAll: async ({ where }) =>
    resources.filter(
      (resource) =>
        matches(resource, where) && visibleResourceIds.includes(resource.id)
    ),
});

const anonymous = { role: 'anonymous', id: null };

describe('resource-links service', () => {
  beforeEach(() => {
    resources = [
      { id: 10, projectId: PROJECT_ID, title: 'Initiatief', tags: [] },
      {
        id: 20,
        projectId: PROJECT_ID,
        title: 'Stadmaker',
        tags: [{ id: 3, name: 'Stadmaker', type: 'soort', extra: 'x' }],
      },
      { id: 30, projectId: PROJECT_ID, title: 'Concept', tags: [] },
    ];
    visibleResourceIds = [10, 20];
    links = [];
    created = null;
    destroyed = null;
    transactions = [];
    createError = null;
  });

  describe('createLink', () => {
    it('rejects an invalid source', async () => {
      await expect(
        resourceLinks.createLink({
          projectId: PROJECT_ID,
          resourceId: 10,
          targetSource: 'Not Valid',
          targetId: '20',
        })
      ).rejects.toMatchObject({ status: 422 });
    });

    it('rejects linking a resource to itself', async () => {
      await expect(
        resourceLinks.createLink({
          projectId: PROJECT_ID,
          resourceId: 10,
          targetSource: 'openstad',
          targetId: '10',
        })
      ).rejects.toMatchObject({ status: 422 });
    });

    it('rejects a missing target resource', async () => {
      await expect(
        resourceLinks.createLink({
          projectId: PROJECT_ID,
          resourceId: 10,
          targetSource: 'openstad',
          targetId: '404',
        })
      ).rejects.toMatchObject({ status: 404 });
    });

    it('rejects a duplicate in the reverse direction', async () => {
      links = [
        {
          id: 1,
          projectId: PROJECT_ID,
          resourceId: 20,
          targetSource: 'openstad',
          targetId: '10',
        },
      ];
      await expect(
        resourceLinks.createLink({
          projectId: PROJECT_ID,
          resourceId: 10,
          targetSource: 'openstad',
          targetId: 20,
        })
      ).rejects.toMatchObject({ status: 409 });
    });

    it('creates a link with a stringified target id', async () => {
      await resourceLinks.createLink({
        projectId: PROJECT_ID,
        resourceId: 10,
        targetSource: 'openstad',
        targetId: 20,
      });
      expect(created).toEqual({
        projectId: PROJECT_ID,
        resourceId: 10,
        targetSource: 'openstad',
        targetId: '20',
      });
    });

    it('turns a unique constraint violation into 409', async () => {
      createError = Object.assign(new Error('Validation error'), {
        name: 'SequelizeUniqueConstraintError',
      });
      await expect(
        resourceLinks.createLink({
          projectId: PROJECT_ID,
          resourceId: 10,
          targetSource: 'openstad',
          targetId: 20,
        })
      ).rejects.toMatchObject({ status: 409 });
    });

    it('creates an external link without looking up a resource', async () => {
      await resourceLinks.createLink({
        projectId: PROJECT_ID,
        resourceId: 10,
        targetSource: 'metkoos',
        targetId: 'abc-123',
      });
      expect(created.targetSource).toBe('metkoos');
      expect(created.targetId).toBe('abc-123');
    });

    it('runs every query in the given transaction', async () => {
      const transaction = { id: 'trx' };
      await resourceLinks.createLink({
        projectId: PROJECT_ID,
        resourceId: 10,
        targetSource: 'openstad',
        targetId: 20,
        transaction,
      });
      expect(transactions).toEqual([
        ['Resource.findOne', transaction],
        ['ResourceLink.findOne', transaction],
        ['create', transaction],
      ]);
    });
  });

  describe('listLinks', () => {
    it('merges outgoing and incoming links and drops invisible targets', async () => {
      links = [
        {
          id: 1,
          projectId: PROJECT_ID,
          resourceId: 10,
          targetSource: 'openstad',
          targetId: '20',
        },
        {
          id: 2,
          projectId: PROJECT_ID,
          resourceId: 10,
          targetSource: 'openstad',
          targetId: '30',
        },
        {
          id: 3,
          projectId: PROJECT_ID,
          resourceId: 10,
          targetSource: 'metkoos',
          targetId: 'abc',
        },
      ];

      const fromInitiatief = await resourceLinks.listLinks({
        projectId: PROJECT_ID,
        resourceId: 10,
        user: anonymous,
      });
      expect(fromInitiatief).toEqual([
        {
          id: 1,
          direction: 'outgoing',
          source: 'openstad',
          targetId: '20',
          resource: {
            id: 20,
            title: 'Stadmaker',
            summary: undefined,
            images: undefined,
            tags: [{ id: 3, name: 'Stadmaker', type: 'soort' }],
          },
        },
        {
          id: 3,
          direction: 'outgoing',
          source: 'metkoos',
          targetId: 'abc',
        },
      ]);

      const fromStadmaker = await resourceLinks.listLinks({
        projectId: PROJECT_ID,
        resourceId: 20,
        user: anonymous,
      });
      expect(fromStadmaker).toHaveLength(1);
      expect(fromStadmaker[0]).toMatchObject({
        id: 1,
        direction: 'incoming',
        targetId: '10',
        resource: { id: 10, title: 'Initiatief' },
      });
    });
  });

  describe('removeLink', () => {
    it('removes a link from the incoming side', async () => {
      links = [
        {
          id: 1,
          projectId: PROJECT_ID,
          resourceId: 10,
          targetSource: 'openstad',
          targetId: '20',
        },
      ];
      await resourceLinks.removeLink({
        projectId: PROJECT_ID,
        resourceId: 20,
        linkId: 1,
      });
      expect(destroyed).toBe(1);
    });

    it('returns 404 for a link of another resource', async () => {
      links = [
        {
          id: 1,
          projectId: PROJECT_ID,
          resourceId: 10,
          targetSource: 'openstad',
          targetId: '20',
        },
      ];
      await expect(
        resourceLinks.removeLink({
          projectId: PROJECT_ID,
          resourceId: 30,
          linkId: 1,
        })
      ).rejects.toMatchObject({ status: 404 });
      expect(destroyed).toBeNull();
    });

    it('runs the lookup and the removal in the given transaction', async () => {
      links = [
        {
          id: 1,
          projectId: PROJECT_ID,
          resourceId: 10,
          targetSource: 'openstad',
          targetId: '20',
        },
      ];
      const transaction = { id: 'trx' };
      await resourceLinks.removeLink({
        projectId: PROJECT_ID,
        resourceId: 10,
        linkId: 1,
        transaction,
      });
      expect(transactions).toEqual([
        ['ResourceLink.findOne', transaction],
        ['destroy', transaction],
      ]);
    });
  });
});
