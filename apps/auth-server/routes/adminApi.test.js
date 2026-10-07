import { describe, expect, test } from 'vitest';

const adminMw = require('../middleware/admin');
const userMw = require('../middleware/user');
const adminApi = require('./adminApi');

const collectRoutes = () => {
  const routes = {};
  const register =
    (method) =>
    (path, ...handlers) => {
      routes[`${method} ${path}`] = handlers.flat();
    };
  adminApi({ use: () => {}, get: register('GET'), post: register('POST') });
  return routes;
};

describe('admin api route guards', () => {
  const routes = collectRoutes();

  test.each([
    'GET /api/admin/client/:clientId',
    'POST /api/admin/client/:clientId',
    'POST /api/admin/client/:clientId/delete',
    'GET /api/admin/unique-codes',
    'GET /api/admin/unique-code/generator-status',
    'POST /api/admin/unique-code',
    'GET /api/admin/access-code',
    'POST /api/admin/access-code',
  ])('%s is limited to the own client (or admin)', (route) => {
    expect(routes[route]).toContain(adminMw.ensureOwnClient);
  });

  test.each(['GET /api/admin/clients', 'POST /api/admin/client'])(
    '%s is limited to the admin client',
    (route) => {
      expect(routes[route]).toContain(adminMw.ensureAdminClient);
    }
  );

  test('user update and delete check identity write rights', () => {
    expect(routes['POST /api/admin/user/:userId']).toContain(
      userMw.ensureIdentityWriteAllowed
    );
    expect(routes['POST /api/admin/user/:userId/delete']).toContain(
      userMw.ensureDeleteAllowed
    );
  });
});
