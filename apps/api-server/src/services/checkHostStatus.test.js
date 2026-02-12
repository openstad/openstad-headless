import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Import pure helpers directly (no db dependency)
import { getCertificateConfig, buildIngressConfig } from './checkHostStatusHelpers.js';

// ---- Env helpers ----
const savedEnv = {};
let envKeysSet = [];

function setEnv(key, value) {
  if (!(key in savedEnv)) savedEnv[key] = process.env[key];
  envKeysSet.push(key);
  process.env[key] = value;
}

function restoreEnv() {
  for (const key of envKeysSet) {
    if (savedEnv[key] === undefined) delete process.env[key];
    else process.env[key] = savedEnv[key];
  }
  envKeysSet = [];
}

afterEach(() => {
  restoreEnv();
});

// ---- getCertificateConfig ----
describe('getCertificateConfig', () => {
  test('reads from new certificates path', () => {
    expect(getCertificateConfig({
      certificates: { certificateMethod: 'external', externalCertSlug: 'my-slug' },
    })).toEqual({ certificateMethod: 'external', externalCertSlug: 'my-slug' });
  });

  test('falls back to root-level config', () => {
    expect(getCertificateConfig({
      certificateMethod: 'external', externalCertSlug: 'old-slug',
    })).toEqual({ certificateMethod: 'external', externalCertSlug: 'old-slug' });
  });

  test('new path takes precedence over root-level', () => {
    expect(getCertificateConfig({
      certificateMethod: 'cert-manager',
      externalCertSlug: 'old',
      certificates: { certificateMethod: 'external', externalCertSlug: 'new' },
    })).toEqual({ certificateMethod: 'external', externalCertSlug: 'new' });
  });

  test('returns defaults when no config present', () => {
    expect(getCertificateConfig({})).toEqual({
      certificateMethod: 'cert-manager', externalCertSlug: '',
    });
  });

  test('handles null/undefined config', () => {
    const defaults = { certificateMethod: 'cert-manager', externalCertSlug: '' };
    expect(getCertificateConfig(null)).toEqual(defaults);
    expect(getCertificateConfig(undefined)).toEqual(defaults);
  });
});

// ---- buildIngressConfig ----
describe('buildIngressConfig', () => {
  test('cert-manager with cluster issuer', () => {
    const { annotations } = buildIngressConfig(true, false);
    expect(annotations['cert-manager.io/cluster-issuer']).toBe('openstad-letsencrypt-prod');
    expect(annotations['kubernetes.io/ingress.class']).toBe('nginx');
  });

  test('cert-manager with custom issuer name from env', () => {
    setEnv('KUBERNETES_INGRESS_ISSUER_NAME', 'my-issuer');
    const { annotations } = buildIngressConfig(true, false);
    expect(annotations['cert-manager.io/cluster-issuer']).toBe('my-issuer');
  });

  test('external cert has no cluster-issuer', () => {
    const { annotations } = buildIngressConfig(false, true);
    expect(annotations['cert-manager.io/cluster-issuer']).toBeUndefined();
  });

  test('external cert removes cluster-issuer from custom annotations', () => {
    setEnv('KUBERNETES_INGRESS_DEFAULT_ANNOTATIONS', JSON.stringify({
      'cert-manager.io/cluster-issuer': 'should-be-removed',
      'custom/annotation': 'keep',
    }));
    const { annotations } = buildIngressConfig(false, true);
    expect(annotations['cert-manager.io/cluster-issuer']).toBeUndefined();
    expect(annotations['custom/annotation']).toBe('keep');
  });

  test('ingressClassName from env', () => {
    setEnv('KUBERNETES_INGRESS_CLASS_NAME', 'traefik');
    expect(buildIngressConfig(false, false).ingressClassName).toBe('traefik');
  });

  test('ingressClassName null when env not set', () => {
    delete process.env.KUBERNETES_INGRESS_CLASS_NAME;
    expect(buildIngressConfig(false, false).ingressClassName).toBeNull();
  });

  test('custom annotations from env override defaults', () => {
    setEnv('KUBERNETES_INGRESS_DEFAULT_ANNOTATIONS', JSON.stringify({ 'custom/key': 'value' }));
    const { annotations } = buildIngressConfig(false, false);
    expect(annotations['custom/key']).toBe('value');
    expect(annotations['kubernetes.io/ingress.class']).toBeUndefined();
  });

  test('no cluster issuer when useClusterIssuer is false', () => {
    const { annotations } = buildIngressConfig(false, false);
    expect(annotations['cert-manager.io/cluster-issuer']).toBeUndefined();
  });

  test('does not add cluster-issuer when already in custom annotations', () => {
    setEnv('KUBERNETES_INGRESS_DEFAULT_ANNOTATIONS', JSON.stringify({
      'cert-manager.io/cluster-issuer': 'pre-existing-issuer',
    }));
    const { annotations } = buildIngressConfig(true, false);
    expect(annotations['cert-manager.io/cluster-issuer']).toBe('pre-existing-issuer');
  });
});
