import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// -- Persistent mock functions --

const mockCreateNamespacedCustomObject = vi.fn();
const mockGetNamespacedCustomObject = vi.fn();
const mockPatchNamespacedCustomObject = vi.fn();
const mockListNamespacedCustomObject = vi.fn();
const mockDeleteNamespacedCustomObject = vi.fn();
const mockReadNamespacedSecret = vi.fn();

const FakeCustomObjectsApi = class {};
const FakeCoreV1Api = class {};

// Mock @kubernetes/client-node (hoisted)
vi.mock('@kubernetes/client-node', () => {
  const mockKC = vi.fn(() => ({
    loadFromCluster: vi.fn(),
    makeApiClient: vi.fn((ApiClass) => {
      if (ApiClass === FakeCustomObjectsApi) {
        return {
          createNamespacedCustomObject: mockCreateNamespacedCustomObject,
          getNamespacedCustomObject: mockGetNamespacedCustomObject,
          patchNamespacedCustomObject: mockPatchNamespacedCustomObject,
          listNamespacedCustomObject: mockListNamespacedCustomObject,
          deleteNamespacedCustomObject: mockDeleteNamespacedCustomObject,
        };
      }
      if (ApiClass === FakeCoreV1Api) {
        return {
          readNamespacedSecret: mockReadNamespacedSecret,
        };
      }
      return {};
    }),
  }));
  return {
    KubeConfig: mockKC,
    CustomObjectsApi: FakeCustomObjectsApi,
    CoreV1Api: FakeCoreV1Api,
  };
});

// Require the CJS module that the manager also requires - same instance
// Then spy on isEnabled to control it from tests
const externalCertificates = require('./externalCertificates');

// Import module under test (single import, no resetModules needed)
const manager = await import('./externalCertificatesManager.js');
const {
  generateSecretName,
  ensureExternalSecret,
  checkSecretReady,
  waitForSecretReady,
  deleteExternalSecret,
} = manager;

// -- Env helpers --

const savedEnv = {};
let envKeysSet = [];

function setEnv(key, value) {
  if (!(key in savedEnv)) {
    savedEnv[key] = process.env[key];
  }
  envKeysSet.push(key);
  process.env[key] = value;
}

function cleanupEnv() {
  for (const key of envKeysSet) {
    if (savedEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = savedEnv[key];
    }
  }
  envKeysSet = [];
}

// -- Mock factory helpers --

function makeExternalSecretReady(secretName) {
  return {
    body: {
      metadata: { name: secretName },
      status: {
        conditions: [{ type: 'Ready', status: 'True', reason: 'SecretSynced' }],
      },
    },
  };
}

function makeExternalSecretError(secretName) {
  return {
    body: {
      metadata: { name: secretName },
      status: {
        conditions: [
          { type: 'Ready', status: 'False', reason: 'SecretSyncedError' },
        ],
      },
    },
  };
}

function makeExternalSecretPending(secretName) {
  return {
    body: {
      metadata: { name: secretName },
      status: {
        conditions: [{ type: 'Ready', status: 'False', reason: 'Pending' }],
      },
    },
  };
}

function makeTlsSecret(secretName) {
  return {
    body: {
      metadata: { name: secretName },
      data: {
        'tls.crt': Buffer.from('cert-data').toString('base64'),
        'tls.key': Buffer.from('key-data').toString('base64'),
      },
    },
  };
}

function makePartialSecret(secretName) {
  return {
    body: {
      metadata: { name: secretName },
      data: {
        'tls.crt': Buffer.from('cert-data').toString('base64'),
      },
    },
  };
}

// K8s client v1.x throws ApiException with .code, not .statusCode
function make404Error() {
  const err = new Error('Not Found');
  err.code = 404;
  return err;
}

function make409Error() {
  const err = new Error('Conflict');
  err.code = 409;
  return err;
}

function make500Error() {
  const err = new Error('Internal Server Error');
  err.code = 500;
  return err;
}

// -- Setup --

beforeEach(() => {
  mockCreateNamespacedCustomObject.mockReset();
  mockGetNamespacedCustomObject.mockReset();
  mockPatchNamespacedCustomObject.mockReset();
  mockListNamespacedCustomObject.mockReset();
  mockDeleteNamespacedCustomObject.mockReset();
  mockReadNamespacedSecret.mockReset();

  // Spy on isEnabled on the same CJS module instance used by the manager
  vi.spyOn(externalCertificates, 'isEnabled').mockReturnValue(true);
});

afterEach(() => {
  cleanupEnv();
});

describe('externalCertificatesManager', () => {
  // -------------------------------------------------------
  // generateSecretName()
  // -------------------------------------------------------
  describe('generateSecretName()', () => {
    test('generates correct name from domain and namespace', () => {
      const result = generateSecretName(
        'www.example.com',
        'openstad-amsterdam'
      );
      expect(result).toBe('tls-openstad-prod-amsterdam-www-example-com');
    });

    test('respects EXTERNAL_CERT_SECRET_PREFIX env override', () => {
      setEnv('EXTERNAL_CERT_SECRET_PREFIX', 'custom-prefix-{orgName}');
      const result = generateSecretName('example.com', 'openstad-test');
      expect(result).toBe('custom-prefix-test-example-com');
    });

    test('uses slugOverride when provided instead of domain', () => {
      const result = generateSecretName(
        'www.example.com',
        'openstad-test',
        'my-custom-slug'
      );
      expect(result).toBe('tls-openstad-prod-test-my-custom-slug');
    });

    test('handles domains with special characters', () => {
      const result = generateSecretName(
        'sub_domain.example.co.uk',
        'openstad-prod'
      );
      expect(result).toBe('tls-openstad-prod-prod-sub-domain-example-co-uk');
    });

    test('strips openstad- prefix from namespace to get orgName', () => {
      const result = generateSecretName('example.com', 'openstad-amsterdam');
      expect(result).toBe('tls-openstad-prod-amsterdam-example-com');
    });

    test('collapses multiple dashes and trims edge dashes', () => {
      const result = generateSecretName('a--b..c', 'openstad-org');
      expect(result).toBe('tls-openstad-prod-org-a-b-c');
    });

    test('throws when namespace is undefined', () => {
      expect(() => generateSecretName('example.com', undefined)).toThrow(
        'requires a namespace'
      );
    });

    test('throws when namespace is null', () => {
      expect(() => generateSecretName('example.com', null)).toThrow(
        'requires a namespace'
      );
    });
  });

  // -------------------------------------------------------
  // ensureExternalSecret()
  // -------------------------------------------------------
  describe('ensureExternalSecret()', () => {
    test('returns { created: false } when feature is disabled', async () => {
      vi.spyOn(externalCertificates, 'isEnabled').mockReturnValue(false);

      const result = await ensureExternalSecret('test-secret', 'openstad-test');

      expect(result).toEqual({ created: false, secretName: 'test-secret' });
      expect(mockCreateNamespacedCustomObject).not.toHaveBeenCalled();
    });

    test('creates ExternalSecret via createNamespacedCustomObject with correct spec', async () => {
      setEnv('EXTERNAL_CERT_SECRET_STORE', 'my-store');
      mockCreateNamespacedCustomObject.mockResolvedValue({});

      const result = await ensureExternalSecret('tls-test', 'openstad-test');

      expect(result).toEqual({ created: true, secretName: 'tls-test' });
      expect(mockCreateNamespacedCustomObject).toHaveBeenCalledWith(
        expect.objectContaining({
          group: 'external-secrets.io',
          version: 'v1',
          namespace: 'openstad-test',
          plural: 'externalsecrets',
          body: expect.objectContaining({
            apiVersion: 'external-secrets.io/v1',
            kind: 'ExternalSecret',
            metadata: { name: 'tls-test', namespace: 'openstad-test' },
            spec: expect.objectContaining({
              refreshInterval: '1h',
              secretStoreRef: { name: 'my-store', kind: 'ClusterSecretStore' },
              target: {
                name: 'tls-test',
                template: { type: 'kubernetes.io/tls' },
              },
              data: expect.arrayContaining([
                expect.objectContaining({
                  secretKey: 'tls.crt',
                  remoteRef: { key: 'tls-test', property: 'tls.crt' },
                }),
                expect.objectContaining({
                  secretKey: 'tls.key',
                  remoteRef: { key: 'tls-test', property: 'tls.key' },
                }),
              ]),
            }),
          }),
        })
      );
    });

    test('returns { created: true, secretName } on successful create', async () => {
      mockCreateNamespacedCustomObject.mockResolvedValue({});

      const result = await ensureExternalSecret('my-secret', 'ns');
      expect(result).toEqual({ created: true, secretName: 'my-secret' });
    });

    test('returns { created: false } on 409 Conflict (resource already exists)', async () => {
      mockCreateNamespacedCustomObject.mockRejectedValue(make409Error());

      const result = await ensureExternalSecret('my-secret', 'ns');

      expect(result).toEqual({ created: false, secretName: 'my-secret' });
      expect(mockPatchNamespacedCustomObject).not.toHaveBeenCalled();
    });

    test('falls back to v1beta1 when v1 create returns 404', async () => {
      mockCreateNamespacedCustomObject
        .mockRejectedValueOnce(make404Error())
        .mockResolvedValueOnce({});

      const result = await ensureExternalSecret('my-secret', 'ns');

      expect(result).toEqual({ created: true, secretName: 'my-secret' });
      expect(mockCreateNamespacedCustomObject).toHaveBeenCalledTimes(2);
      expect(mockCreateNamespacedCustomObject.mock.calls[1][0]).toMatchObject({
        version: 'v1beta1',
      });
    });

    test('throws on unexpected errors (non-409, non-404)', async () => {
      mockCreateNamespacedCustomObject.mockRejectedValue(make500Error());

      await expect(ensureExternalSecret('my-secret', 'ns')).rejects.toThrow(
        'Internal Server Error'
      );
    });

    test('uses default gcp-secret-store when EXTERNAL_CERT_SECRET_STORE not set', async () => {
      mockCreateNamespacedCustomObject.mockResolvedValue({});

      await ensureExternalSecret('test', 'ns');

      const body = mockCreateNamespacedCustomObject.mock.calls[0][0].body;
      expect(body.spec.secretStoreRef.name).toBe('gcp-secret-store');
    });

    test('ExternalSecret spec maps tls.crt and tls.key with 1h refresh', async () => {
      mockCreateNamespacedCustomObject.mockResolvedValue({});

      await ensureExternalSecret('test', 'ns');

      const body = mockCreateNamespacedCustomObject.mock.calls[0][0].body;
      expect(body.spec.refreshInterval).toBe('1h');
      expect(body.spec.data).toHaveLength(2);
      expect(body.spec.data[0].secretKey).toBe('tls.crt');
      expect(body.spec.data[1].secretKey).toBe('tls.key');
    });
  });

  // -------------------------------------------------------
  // checkSecretReady()
  // -------------------------------------------------------
  describe('checkSecretReady()', () => {
    test('returns ready/linked when ExternalSecret synced AND Secret has TLS keys', async () => {
      mockGetNamespacedCustomObject.mockResolvedValue(
        makeExternalSecretReady('test')
      );
      mockReadNamespacedSecret.mockResolvedValue(makeTlsSecret('test'));

      const result = await checkSecretReady('test', 'ns');

      expect(result).toEqual({
        ready: true,
        state: 'linked',
        reason: expect.any(String),
      });
    });

    test('returns pending when ExternalSecret not synced yet', async () => {
      mockGetNamespacedCustomObject.mockResolvedValue(
        makeExternalSecretPending('test')
      );
      mockReadNamespacedSecret.mockResolvedValue(makeTlsSecret('test'));

      const result = await checkSecretReady('test', 'ns');

      expect(result).toEqual({
        ready: false,
        state: 'pending',
        reason: expect.any(String),
      });
    });

    test('returns pending when ExternalSecret synced but Secret missing (404)', async () => {
      mockGetNamespacedCustomObject.mockResolvedValue(
        makeExternalSecretReady('test')
      );
      mockReadNamespacedSecret.mockRejectedValue(make404Error());

      const result = await checkSecretReady('test', 'ns');

      expect(result).toEqual({
        ready: false,
        state: 'pending',
        reason: expect.stringContaining('Secret not yet created'),
      });
    });

    test('returns pending when ExternalSecret not found (404 on both versions)', async () => {
      mockGetNamespacedCustomObject
        .mockRejectedValueOnce(make404Error())
        .mockRejectedValueOnce(make404Error());

      const result = await checkSecretReady('test', 'ns');

      expect(result).toEqual({
        ready: false,
        state: 'pending',
        reason: expect.stringContaining('not found'),
      });
    });

    test('returns error when ExternalSecret has SecretSyncedError condition', async () => {
      mockGetNamespacedCustomObject.mockResolvedValue(
        makeExternalSecretError('test')
      );
      mockReadNamespacedSecret.mockResolvedValue(makeTlsSecret('test'));

      const result = await checkSecretReady('test', 'ns');

      expect(result).toEqual({
        ready: false,
        state: 'error',
        reason: expect.stringContaining('sync error'),
      });
    });

    test('returns pending when Secret exists but missing tls.key', async () => {
      mockGetNamespacedCustomObject.mockResolvedValue(
        makeExternalSecretReady('test')
      );
      mockReadNamespacedSecret.mockResolvedValue(makePartialSecret('test'));

      const result = await checkSecretReady('test', 'ns');

      expect(result).toEqual({
        ready: false,
        state: 'pending',
        reason: expect.any(String),
      });
    });

    test('falls back to v1beta1 for ExternalSecret check when v1 returns 404', async () => {
      mockGetNamespacedCustomObject
        .mockRejectedValueOnce(make404Error())
        .mockResolvedValueOnce(makeExternalSecretReady('test'));
      mockReadNamespacedSecret.mockResolvedValue(makeTlsSecret('test'));

      const result = await checkSecretReady('test', 'ns');

      expect(result).toEqual({
        ready: true,
        state: 'linked',
        reason: expect.any(String),
      });
      expect(mockGetNamespacedCustomObject).toHaveBeenCalledTimes(2);
    });

    test('throws on unexpected K8s errors (non-404)', async () => {
      mockGetNamespacedCustomObject.mockRejectedValue(make500Error());

      await expect(checkSecretReady('test', 'ns')).rejects.toThrow(
        'Internal Server Error'
      );
    });
  });

  // -------------------------------------------------------
  // waitForSecretReady()
  // -------------------------------------------------------
  describe('waitForSecretReady()', () => {
    test('returns immediately when secret is ready on first check', async () => {
      mockGetNamespacedCustomObject.mockResolvedValue(
        makeExternalSecretReady('test')
      );
      mockReadNamespacedSecret.mockResolvedValue(makeTlsSecret('test'));

      const result = await waitForSecretReady('test', 'ns', {
        maxRetries: 3,
        retryDelayMs: 0,
      });

      expect(result).toEqual({
        ready: true,
        state: 'linked',
        reason: expect.any(String),
      });
      expect(mockGetNamespacedCustomObject).toHaveBeenCalledTimes(1);
    });

    test('returns immediately when secret is in error state', async () => {
      mockGetNamespacedCustomObject.mockResolvedValue(
        makeExternalSecretError('test')
      );
      mockReadNamespacedSecret.mockResolvedValue(makeTlsSecret('test'));

      const result = await waitForSecretReady('test', 'ns', {
        maxRetries: 3,
        retryDelayMs: 0,
      });

      expect(result).toEqual({
        ready: false,
        state: 'error',
        reason: expect.any(String),
      });
      expect(mockGetNamespacedCustomObject).toHaveBeenCalledTimes(1);
    });

    test('retries when pending and succeeds on later attempt', async () => {
      mockGetNamespacedCustomObject
        .mockResolvedValueOnce(makeExternalSecretPending('test'))
        .mockResolvedValueOnce(makeExternalSecretReady('test'));
      mockReadNamespacedSecret.mockResolvedValue(makeTlsSecret('test'));

      const result = await waitForSecretReady('test', 'ns', {
        maxRetries: 3,
        retryDelayMs: 0,
      });

      expect(result).toEqual({
        ready: true,
        state: 'linked',
        reason: expect.any(String),
      });
      expect(mockGetNamespacedCustomObject).toHaveBeenCalledTimes(2);
    });

    test('returns pending after exhausting all retries', async () => {
      mockGetNamespacedCustomObject.mockResolvedValue(
        makeExternalSecretPending('test')
      );
      mockReadNamespacedSecret.mockResolvedValue(makeTlsSecret('test'));

      const result = await waitForSecretReady('test', 'ns', {
        maxRetries: 3,
        retryDelayMs: 0,
      });

      expect(result).toEqual({
        ready: false,
        state: 'pending',
        reason: expect.any(String),
      });
      expect(mockGetNamespacedCustomObject).toHaveBeenCalledTimes(3);
    });

    test('stops retrying when error state is reached', async () => {
      mockGetNamespacedCustomObject
        .mockResolvedValueOnce(makeExternalSecretPending('test'))
        .mockResolvedValueOnce(makeExternalSecretError('test'));
      mockReadNamespacedSecret.mockResolvedValue(makeTlsSecret('test'));

      const result = await waitForSecretReady('test', 'ns', {
        maxRetries: 3,
        retryDelayMs: 0,
      });

      expect(result).toEqual({
        ready: false,
        state: 'error',
        reason: expect.any(String),
      });
      expect(mockGetNamespacedCustomObject).toHaveBeenCalledTimes(2);
    });

    test('uses default options when none provided', async () => {
      mockGetNamespacedCustomObject.mockResolvedValue(
        makeExternalSecretReady('test')
      );
      mockReadNamespacedSecret.mockResolvedValue(makeTlsSecret('test'));

      const result = await waitForSecretReady('test', 'ns');

      expect(result).toEqual({
        ready: true,
        state: 'linked',
        reason: expect.any(String),
      });
    });

    test('propagates errors from checkSecretReady', async () => {
      mockGetNamespacedCustomObject.mockRejectedValue(make500Error());

      await expect(
        waitForSecretReady('test', 'ns', { maxRetries: 3, retryDelayMs: 0 })
      ).rejects.toThrow('Internal Server Error');
    });
  });

  // -------------------------------------------------------
  // deleteExternalSecret()
  // -------------------------------------------------------
  describe('deleteExternalSecret()', () => {
    test('returns { deleted: false } when feature is disabled', async () => {
      vi.spyOn(externalCertificates, 'isEnabled').mockReturnValue(false);

      const result = await deleteExternalSecret('test-secret', 'ns');

      expect(result).toEqual({ deleted: false });
      expect(mockDeleteNamespacedCustomObject).not.toHaveBeenCalled();
    });

    test('deletes ExternalSecret successfully', async () => {
      mockDeleteNamespacedCustomObject.mockResolvedValue({});

      const result = await deleteExternalSecret('test-secret', 'ns');

      expect(result).toEqual({ deleted: true });
      expect(mockDeleteNamespacedCustomObject).toHaveBeenCalledWith(
        expect.objectContaining({
          group: 'external-secrets.io',
          version: 'v1',
          namespace: 'ns',
          plural: 'externalsecrets',
          name: 'test-secret',
        })
      );
    });

    test('returns { deleted: false } on 404 (already gone)', async () => {
      mockDeleteNamespacedCustomObject.mockRejectedValue(make404Error());

      const result = await deleteExternalSecret('test-secret', 'ns');

      expect(result).toEqual({ deleted: false });
    });

    test('throws on unexpected errors', async () => {
      mockDeleteNamespacedCustomObject.mockRejectedValue(make500Error());

      await expect(deleteExternalSecret('test-secret', 'ns')).rejects.toThrow(
        'Internal Server Error'
      );
    });
  });
});
