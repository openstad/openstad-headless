import { createRequire } from 'module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Stub methods on the real CJS singletons the service holds. `getCertificateConfig`
// is destructured (captured) at load, so we drive it with crafted project config
// rather than stubbing it. `checkHostStatus` is likewise a captured function, so
// performCertificateRetry is tested on the not-ready branch (no host check).
const require = createRequire(import.meta.url);
const externalCertificates = require('./externalCertificates');
const externalCertificatesManager = require('./externalCertificatesManager');
const projectCertificates = require('./projectCertificates');

const orig = {
  isEnabled: externalCertificates.isEnabled,
  generateSecretName: externalCertificatesManager.generateSecretName,
  ensureExternalSecret: externalCertificatesManager.ensureExternalSecret,
  waitForSecretReady: externalCertificatesManager.waitForSecretReady,
  deleteExternalSecret: externalCertificatesManager.deleteExternalSecret,
};

afterEach(() => {
  externalCertificates.isEnabled = orig.isEnabled;
  externalCertificatesManager.generateSecretName = orig.generateSecretName;
  externalCertificatesManager.ensureExternalSecret = orig.ensureExternalSecret;
  externalCertificatesManager.waitForSecretReady = orig.waitForSecretReady;
  externalCertificatesManager.deleteExternalSecret = orig.deleteExternalSecret;
  delete process.env.KUBERNETES_NAMESPACE;
});

describe('retry cooldown', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('reports full cooldown right after start and decreases over time', () => {
    projectCertificates.startRetryCooldown(123);
    expect(projectCertificates.getRetryCooldownRemaining(123)).toBe(60);

    vi.advanceTimersByTime(30_000);
    expect(projectCertificates.getRetryCooldownRemaining(123)).toBe(30);
  });

  it('clears the cooldown after it elapses', () => {
    projectCertificates.startRetryCooldown(456);
    vi.advanceTimersByTime(60_000);
    expect(projectCertificates.getRetryCooldownRemaining(456)).toBe(0);
  });

  it('returns 0 for a project with no active cooldown', () => {
    expect(projectCertificates.getRetryCooldownRemaining(999)).toBe(0);
  });
});

describe('cleanupExternalSecretOnDelete', () => {
  it('does nothing when the feature is disabled', async () => {
    externalCertificates.isEnabled = vi.fn().mockReturnValue(false);
    externalCertificatesManager.deleteExternalSecret = vi.fn();
    await projectCertificates.cleanupExternalSecretOnDelete({ config: {} });
    expect(
      externalCertificatesManager.deleteExternalSecret
    ).not.toHaveBeenCalled();
  });

  it('does nothing when the project is not on external certificates', async () => {
    externalCertificates.isEnabled = vi.fn().mockReturnValue(true);
    externalCertificatesManager.deleteExternalSecret = vi.fn();
    await projectCertificates.cleanupExternalSecretOnDelete({
      config: { certificates: { certificateMethod: 'cert-manager' } },
    });
    expect(
      externalCertificatesManager.deleteExternalSecret
    ).not.toHaveBeenCalled();
  });

  it('deletes the ExternalSecret for an external-cert project', async () => {
    externalCertificates.isEnabled = vi.fn().mockReturnValue(true);
    externalCertificatesManager.generateSecretName = vi
      .fn()
      .mockReturnValue('secret-x');
    externalCertificatesManager.deleteExternalSecret = vi
      .fn()
      .mockResolvedValue(undefined);
    process.env.KUBERNETES_NAMESPACE = 'ns';

    await projectCertificates.cleanupExternalSecretOnDelete({
      config: {
        certificates: {
          certificateMethod: 'external',
          externalCertSlug: 'slug',
        },
      },
      url: 'https://x.nl',
    });

    expect(externalCertificatesManager.generateSecretName).toHaveBeenCalledWith(
      'https://x.nl',
      'ns',
      'slug'
    );
    expect(
      externalCertificatesManager.deleteExternalSecret
    ).toHaveBeenCalledWith('secret-x', 'ns');
  });

  it('swallows K8s errors (non-blocking)', async () => {
    externalCertificates.isEnabled = vi.fn().mockReturnValue(true);
    externalCertificatesManager.generateSecretName = vi
      .fn()
      .mockReturnValue('s');
    externalCertificatesManager.deleteExternalSecret = vi
      .fn()
      .mockRejectedValue(new Error('k8s down'));
    process.env.KUBERNETES_NAMESPACE = 'ns';
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      projectCertificates.cleanupExternalSecretOnDelete({
        config: { certificates: { certificateMethod: 'external' } },
        id: 7,
        url: 'u',
      })
    ).resolves.toBeUndefined();

    spy.mockRestore();
  });
});

describe('performCertificateRetry (not-ready branch)', () => {
  it('persists cert host status and returns state without a host check when not ready', async () => {
    externalCertificatesManager.generateSecretName = vi
      .fn()
      .mockReturnValue('secret-z');
    externalCertificatesManager.ensureExternalSecret = vi
      .fn()
      .mockResolvedValue(undefined);
    externalCertificatesManager.waitForSecretReady = vi
      .fn()
      .mockResolvedValue({ state: 'Pending', ready: false });
    const update = vi.fn().mockResolvedValue(undefined);
    const project = { id: 10, url: 'u', config: {}, hostStatus: null, update };

    const result = await projectCertificates.performCertificateRetry(project);

    expect(result).toEqual({
      state: 'Pending',
      secretName: 'secret-z',
      ready: false,
    });
    expect(
      externalCertificatesManager.ensureExternalSecret
    ).toHaveBeenCalledWith('secret-z', undefined);
    expect(update).toHaveBeenCalledTimes(1);
    expect(update.mock.calls[0][0].hostStatus.certificate).toMatchObject({
      method: 'external',
      state: 'Pending',
      secretName: 'secret-z',
    });
  });
});
