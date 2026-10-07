import { describe, expect, test } from 'vitest';

const adminMw = require('../middleware/admin');
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

  test('GET /api/admin/clients is limited to the admin client', () => {
    expect(routes['GET /api/admin/clients']).toContain(
      adminMw.ensureAdminClient
    );
  });

  test('POST /api/admin/client (create) stays unguarded', () => {
    expect(routes['POST /api/admin/client']).not.toContain(
      adminMw.ensureOwnClient
    );
    expect(routes['POST /api/admin/client']).not.toContain(
      adminMw.ensureAdminClient
    );
  });
});
