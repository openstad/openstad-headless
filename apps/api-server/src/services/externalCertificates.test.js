import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Persistent mock functions that survive vi.resetModules()
const mockListCRD = vi.fn();
const mockListNamespacedCustomObject = vi.fn();
const mockListClusterCustomObject = vi.fn();
const mockKubeConfigConstructor = vi.fn();

// Sentinel classes for makeApiClient matching
const FakeApiextensionsV1Api = class {};
const FakeCustomObjectsApi = class {};

// Mock @kubernetes/client-node at top level (hoisted) to prevent real K8s calls
vi.mock('@kubernetes/client-node', () => ({
  KubeConfig: mockKubeConfigConstructor,
  ApiextensionsV1Api: FakeApiextensionsV1Api,
  CustomObjectsApi: FakeCustomObjectsApi,
}));

// Track env vars set during tests for cleanup
const originalEnv = {};
let envKeysSet = [];

function setEnv(key, value) {
  if (!(key in originalEnv)) {
    originalEnv[key] = process.env[key];
  }
  envKeysSet.push(key);
  process.env[key] = value;
}

function cleanupEnv() {
  for (const key of envKeysSet) {
    if (originalEnv[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalEnv[key];
    }
  }
  envKeysSet = [];
}

/** Helper: load a fresh copy of the module with given env */
async function loadModule(env = {}) {
  vi.resetModules();
  for (const [key, value] of Object.entries(env)) {
    setEnv(key, value);
  }
  // Use dynamic import to get a fresh module evaluation
  const mod = await import('./externalCertificates.js');
  return mod.default || mod;
}

beforeEach(() => {
  mockListCRD.mockReset();
  mockListNamespacedCustomObject.mockReset();
  mockListClusterCustomObject.mockReset();

  // Default KubeConfig implementation
  mockKubeConfigConstructor.mockReset();
  mockKubeConfigConstructor.mockImplementation(() => ({
    loadFromCluster: vi.fn(),
    makeApiClient: vi.fn((ApiClass) => {
      if (ApiClass === FakeApiextensionsV1Api) {
        return { listCustomResourceDefinition: mockListCRD };
      }
      return {
        listNamespacedCustomObject: mockListNamespacedCustomObject,
        listClusterCustomObject: mockListClusterCustomObject,
      };
    }),
  }));
});

afterEach(() => {
  cleanupEnv();
});

describe('externalCertificates', () => {
  describe('isEnabled()', () => {
    test('returns false when EXTERNAL_CERTIFICATES_ENABLED is unset', async () => {
      const mod = await loadModule();
      expect(mod.isEnabled()).toBe(false);
    });

    test('returns false when EXTERNAL_CERTIFICATES_ENABLED is "false"', async () => {
      const mod = await loadModule({ EXTERNAL_CERTIFICATES_ENABLED: 'false' });
      expect(mod.isEnabled()).toBe(false);
    });

    test('returns true when EXTERNAL_CERTIFICATES_ENABLED is "true"', async () => {
      const mod = await loadModule({ EXTERNAL_CERTIFICATES_ENABLED: 'true' });
      expect(mod.isEnabled()).toBe(true);
    });

    test('returns false for non-exact values like "1", "yes", "TRUE"', async () => {
      for (const val of ['1', 'yes', 'TRUE', 'True', 'YES']) {
        cleanupEnv();
        const mod = await loadModule({ EXTERNAL_CERTIFICATES_ENABLED: val });
        expect(mod.isEnabled()).toBe(false);
      }
    });
  });

  describe('validateInfrastructure()', () => {
    test('skips entirely when feature is disabled (no K8s calls)', async () => {
      const mod = await loadModule();

      await mod.validateInfrastructure();

      expect(mockKubeConfigConstructor).not.toHaveBeenCalled();
    });

    test('skips when KUBERNETES_NAMESPACE is not set', async () => {
      const mod = await loadModule({ EXTERNAL_CERTIFICATES_ENABLED: 'true' });

      await mod.validateInfrastructure();

      expect(mockKubeConfigConstructor).not.toHaveBeenCalled();
    });

    test('auto-disables when ESO CRD not found', async () => {
      mockListCRD.mockResolvedValue({ items: [] });
      mockListNamespacedCustomObject.mockResolvedValue({ items: [] });
      mockListClusterCustomObject.mockResolvedValue({
        items: [
          { status: { conditions: [{ type: 'Ready', status: 'True' }] } },
        ],
      });

      const mod = await loadModule({
        EXTERNAL_CERTIFICATES_ENABLED: 'true',
        KUBERNETES_NAMESPACE: 'openstad-test',
      });
      expect(mod.isEnabled()).toBe(true);

      await mod.validateInfrastructure();

      expect(mod.isEnabled()).toBe(false);
    });

    test('auto-disables when RBAC check returns 403 on both v1 and v1beta1', async () => {
      mockListCRD.mockResolvedValue({
        items: [
          {
            spec: {
              group: 'external-secrets.io',
              names: { kind: 'ExternalSecret' },
            },
          },
        ],
      });
      mockListNamespacedCustomObject.mockRejectedValue({ code: 403 });
      mockListClusterCustomObject.mockResolvedValue({ items: [] });

      const mod = await loadModule({
        EXTERNAL_CERTIFICATES_ENABLED: 'true',
        KUBERNETES_NAMESPACE: 'openstad-test',
      });
      await mod.validateInfrastructure();

      expect(mod.isEnabled()).toBe(false);
    });

    test('succeeds when CRD found and RBAC returns 404', async () => {
      mockListCRD.mockResolvedValue({
        items: [
          {
            spec: {
              group: 'external-secrets.io',
              names: { kind: 'ExternalSecret' },
            },
          },
        ],
      });
      mockListNamespacedCustomObject.mockRejectedValue({ code: 404 });
      mockListClusterCustomObject.mockResolvedValue({
        items: [
          { status: { conditions: [{ type: 'Ready', status: 'True' }] } },
        ],
      });

      const mod = await loadModule({
        EXTERNAL_CERTIFICATES_ENABLED: 'true',
        KUBERNETES_NAMESPACE: 'openstad-test',
      });
      await mod.validateInfrastructure();

      expect(mod.isEnabled()).toBe(true);
    });

    test('logs warning when ClusterSecretStore list is empty but does NOT disable', async () => {
      mockListCRD.mockResolvedValue({
        items: [
          {
            spec: {
              group: 'external-secrets.io',
              names: { kind: 'ExternalSecret' },
            },
          },
        ],
      });
      mockListNamespacedCustomObject.mockResolvedValue({ items: [] });
      mockListClusterCustomObject.mockResolvedValue({ items: [] });

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mod = await loadModule({
        EXTERNAL_CERTIFICATES_ENABLED: 'true',
        KUBERNETES_NAMESPACE: 'openstad-test',
      });
      await mod.validateInfrastructure();

      expect(mod.isEnabled()).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('No ClusterSecretStore found')
      );
      warnSpy.mockRestore();
    });

    test('auto-disables on unexpected top-level error', async () => {
      mockKubeConfigConstructor.mockImplementation(() => ({
        loadFromCluster: vi.fn(),
        makeApiClient: vi.fn(() => {
          throw new Error('unexpected cluster error');
        }),
      }));

      const mod = await loadModule({
        EXTERNAL_CERTIFICATES_ENABLED: 'true',
        KUBERNETES_NAMESPACE: 'openstad-test',
      });
      await mod.validateInfrastructure();

      expect(mod.isEnabled()).toBe(false);
    });

    test('tries v1beta1 fallback when v1 RBAC returns non-403/non-404 error', async () => {
      mockListCRD.mockResolvedValue({
        items: [
          {
            spec: {
              group: 'external-secrets.io',
              names: { kind: 'ExternalSecret' },
            },
          },
        ],
      });
      mockListNamespacedCustomObject
        .mockRejectedValueOnce({ code: 500 })
        .mockRejectedValueOnce({ code: 404 });
      mockListClusterCustomObject.mockResolvedValue({
        items: [
          { status: { conditions: [{ type: 'Ready', status: 'True' }] } },
        ],
      });

      const mod = await loadModule({
        EXTERNAL_CERTIFICATES_ENABLED: 'true',
        KUBERNETES_NAMESPACE: 'openstad-test',
      });
      await mod.validateInfrastructure();

      expect(mod.isEnabled()).toBe(true);
      expect(mockListNamespacedCustomObject).toHaveBeenCalledTimes(2);
    });
  });
});
