// Read certificate config from new path with fallback to root-level for backwards compat
const getCertificateConfig = (projectConfig) => {
  const certs = projectConfig?.certificates || {};
  return {
    certificateMethod:
      certs.certificateMethod ||
      projectConfig?.certificateMethod ||
      'cert-manager',
    externalCertSlug:
      certs.externalCertSlug || projectConfig?.externalCertSlug || '',
  };
};

// Build annotations and ingressClassName for ingress resources
const buildIngressConfig = (useClusterIssuer, useExternalCerts) => {
  const prodIssuerName =
    useClusterIssuer && !useExternalCerts
      ? process.env.KUBERNETES_INGRESS_ISSUER_NAME ||
        'openstad-letsencrypt-prod'
      : null;

  const annotations = process.env.KUBERNETES_INGRESS_DEFAULT_ANNOTATIONS
    ? JSON.parse(process.env.KUBERNETES_INGRESS_DEFAULT_ANNOTATIONS)
    : {
        'kubernetes.io/ingress.class': 'nginx',
        'nginx.ingress.kubernetes.io/from-to-www-redirect': 'true',
        'nginx.ingress.kubernetes.io/proxy-body-size': '128m',
        'nginx.ingress.kubernetes.io/configuration-snippet': `more_set_headers "X-Content-Type-Options: nosniff";
        more_set_headers "X-Frame-Options: SAMEORIGIN";
        more_set_headers "X-Xss-Protection: 1";
        more_set_headers "Referrer-Policy: same-origin";`,
      };

  if (useExternalCerts) {
    delete annotations['cert-manager.io/cluster-issuer'];
  }

  if (
    useClusterIssuer &&
    !!prodIssuerName &&
    !annotations['cert-manager.io/cluster-issuer']
  ) {
    annotations['cert-manager.io/cluster-issuer'] = prodIssuerName;
  }

  const ingressClassName = process.env.KUBERNETES_INGRESS_CLASS_NAME || null;

  return { annotations, ingressClassName };
};

// Normalize project.url for ingress host usage and detect subpath-based setups.
const normalizeProjectUrlForIngress = (projectUrl) => {
  if (!projectUrl || typeof projectUrl !== 'string') {
    return { host: '', hasPath: false };
  }

  const trimmed = projectUrl.trim();
  if (!trimmed) {
    return { host: '', hasPath: false };
  }

  try {
    const candidate = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    const parsed = new URL(candidate);
    const pathname = parsed.pathname || '/';
    return {
      host: parsed.host,
      hasPath: pathname !== '/' && pathname !== '',
    };
  } catch (error) {
    // Fallback for malformed values: split on first slash and infer subpath.
    const [host] = trimmed.split('/');
    return {
      host: host || '',
      hasPath: trimmed.includes('/'),
    };
  }
};

module.exports = {
  getCertificateConfig,
  buildIngressConfig,
  normalizeProjectUrlForIngress,
};
