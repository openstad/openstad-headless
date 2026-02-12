// Read certificate config from new path with fallback to root-level for backwards compat
const getCertificateConfig = (projectConfig) => {
  const certs = projectConfig?.certificates || {};
  return {
    certificateMethod: certs.certificateMethod || projectConfig?.certificateMethod || 'cert-manager',
    externalCertSlug: certs.externalCertSlug || projectConfig?.externalCertSlug || '',
  };
};

// Build annotations and ingressClassName for ingress resources
const buildIngressConfig = (useClusterIssuer, useExternalCerts) => {
  const prodIssuerName = (useClusterIssuer && !useExternalCerts)
    ? (process.env.KUBERNETES_INGRESS_ISSUER_NAME || 'openstad-letsencrypt-prod')
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

  if (useClusterIssuer && !!prodIssuerName && !annotations['cert-manager.io/cluster-issuer']) {
    annotations['cert-manager.io/cluster-issuer'] = prodIssuerName;
  }

  const ingressClassName = process.env.KUBERNETES_INGRESS_CLASS_NAME || null;

  return { annotations, ingressClassName };
};

module.exports = { getCertificateConfig, buildIngressConfig };
