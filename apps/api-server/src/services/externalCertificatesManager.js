// ExternalSecret lifecycle manager service
// Handles secret name generation, ExternalSecret CRD creation, and dual-check validation
// for external certificate management via External Secrets Operator (ESO)

const externalCertificates = require('./externalCertificates');

/**
 * Extracts HTTP status code from K8s client errors.
 * @kubernetes/client-node v1.x throws ApiException with .code,
 * older versions throw HttpError with .statusCode.
 */
function getErrorStatusCode(error) {
  return error.code ?? error.statusCode;
}

/**
 * Simple slugify implementation without external dependencies.
 * Converts string to lowercase, replaces non-alphanumeric chars with dashes,
 * collapses multiple dashes, and trims leading/trailing dashes.
 *
 * @param {string} str - String to slugify
 * @returns {string} Slugified string
 */
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generates Kubernetes Secret name for external certificates following locked naming convention.
 * Pattern: {prefix}-{domainSlug}
 * Where prefix is configurable and {orgName} placeholder is replaced with namespace-derived org name.
 *
 * @param {string} domain - Domain name (e.g., 'www.example.com')
 * @param {string} namespace - K8s namespace (e.g., 'openstad-amsterdam')
 * @param {string} slugOverride - Optional custom slug to use instead of domain
 * @returns {string} Full secret name (e.g., 'tls-openstad-prod-amsterdam-www-example-com')
 */
function generateSecretName(domain, namespace, slugOverride) {
  if (!namespace) {
    throw new Error(
      'generateSecretName requires a namespace (KUBERNETES_NAMESPACE not set?)'
    );
  }

  // Extract org name from namespace by stripping 'openstad-' prefix
  const orgName = namespace.replace(/^openstad-/, '');

  // Get prefix template from env, default to pattern with {orgName} placeholder
  const prefixTemplate =
    process.env.EXTERNAL_CERT_SECRET_PREFIX || 'tls-openstad-prod-{orgName}';

  // Replace {orgName} placeholder with actual org name
  const prefix = prefixTemplate.replace('{orgName}', orgName);

  // Use slugOverride if provided, otherwise slugify domain
  const domainSlug = slugOverride ? slugify(slugOverride) : slugify(domain);

  return `${prefix}-${domainSlug}`;
}

/**
 * Internal helper to get K8s API clients.
 * Loads kubeconfig from cluster and creates CustomObjectsApi and CoreV1Api clients.
 *
 * @returns {Promise<{customObjects: CustomObjectsApi, core: CoreV1Api}>}
 */
async function getK8sClients() {
  const k8s = await import('@kubernetes/client-node');
  const kc = new k8s.KubeConfig();
  kc.loadFromCluster();

  return {
    customObjects: kc.makeApiClient(k8s.CustomObjectsApi),
    core: kc.makeApiClient(k8s.CoreV1Api),
  };
}

/**
 * Creates or updates an ExternalSecret CRD in the given namespace.
 * Idempotent: tries create first, falls back to patch on conflict.
 * Supports both ESO v1 and v1beta1 for version compatibility.
 *
 * ExternalSecret spec:
 * - References ClusterSecretStore (configurable via env)
 * - Targets kubernetes.io/tls type Secret
 * - Maps two keys from external store: tls.crt and tls.key
 * - Refreshes every 1 hour
 *
 * @param {string} secretName - Name for both ExternalSecret and target Secret
 * @param {string} namespace - K8s namespace to create resource in
 * @returns {Promise<{created: boolean, secretName: string}>}
 */
async function ensureExternalSecret(secretName, namespace) {
  // Gate on feature flag
  if (!externalCertificates.isEnabled()) {
    return { created: false, secretName };
  }

  const { customObjects } = await getK8sClients();

  const secretStoreName =
    process.env.EXTERNAL_CERT_SECRET_STORE || 'gcp-secret-store';

  const externalSecretSpec = {
    apiVersion: 'external-secrets.io/v1',
    kind: 'ExternalSecret',
    metadata: {
      name: secretName,
      namespace: namespace,
    },
    spec: {
      refreshInterval: '1h',
      secretStoreRef: {
        name: secretStoreName,
        kind: 'ClusterSecretStore',
      },
      target: {
        name: secretName,
        template: {
          type: 'kubernetes.io/tls',
        },
      },
      data: [
        {
          secretKey: 'tls.crt',
          remoteRef: {
            key: secretName,
            property: 'tls.crt',
          },
        },
        {
          secretKey: 'tls.key',
          remoteRef: {
            key: secretName,
            property: 'tls.key',
          },
        },
      ],
    },
  };

  // Try v1 first, fallback to v1beta1 for ESO version compatibility
  for (const version of ['v1', 'v1beta1']) {
    try {
      await customObjects.createNamespacedCustomObject({
        group: 'external-secrets.io',
        version: version,
        namespace: namespace,
        plural: 'externalsecrets',
        body: {
          ...externalSecretSpec,
          apiVersion: `external-secrets.io/${version}`,
        },
      });

      console.log('[external-certificates] Created ExternalSecret');
      return { created: true, secretName };
    } catch (error) {
      const status = getErrorStatusCode(error);
      if (status === 409) {
        // Resource already exists — this is the desired state
        console.log('[external-certificates] ExternalSecret already exists');
        return { created: false, secretName };
      } else if (status === 404 && version === 'v1') {
        // v1 not found, try v1beta1
        console.log(
          `[external-certificates] ${version} API not available, falling back to v1beta1`
        );
        continue;
      } else {
        throw error;
      }
    }
  }

  // Should not reach here, but just in case
  throw new Error(`Failed to create or update ExternalSecret: ${secretName}`);
}

/**
 * Checks if an ExternalSecret and its target Secret are ready.
 * Performs dual-check per requirements:
 * 1. ExternalSecret status.conditions check for sync status
 * 2. Kubernetes Secret existence check with required data keys
 *
 * @param {string} secretName - Name of ExternalSecret and Secret to check
 * @param {string} namespace - K8s namespace
 * @returns {Promise<{ready: boolean, state: 'linked'|'pending'|'error', reason: string}>}
 */
async function checkSecretReady(secretName, namespace) {
  const { customObjects, core } = await getK8sClients();

  let synced = false;
  let error = false;
  let secretExists = false;

  // Check 1: Read ExternalSecret and check sync status
  for (const version of ['v1', 'v1beta1']) {
    try {
      const response = await customObjects.getNamespacedCustomObject({
        group: 'external-secrets.io',
        version: version,
        namespace: namespace,
        plural: 'externalsecrets',
        name: secretName,
      });

      const externalSecret = response.body || response;
      const conditions = externalSecret.status?.conditions || [];

      const readyCondition = conditions.find((c) => c.type === 'Ready');

      if (readyCondition) {
        if (
          readyCondition.status === 'True' &&
          readyCondition.reason === 'SecretSynced'
        ) {
          synced = true;
        } else if (readyCondition.reason === 'SecretSyncedError') {
          error = true;
        }
      }

      break; // Successfully read ExternalSecret, stop trying versions
    } catch (err) {
      if (getErrorStatusCode(err) === 404) {
        if (version === 'v1beta1') {
          // ExternalSecret not found at all
          return {
            ready: false,
            state: 'pending',
            reason: 'ExternalSecret not found',
          };
        }
        // Try v1beta1
        continue;
      } else {
        throw err;
      }
    }
  }

  // Check 2: Read Kubernetes Secret and verify data keys
  try {
    const secretResponse = await core.readNamespacedSecret({
      name: secretName,
      namespace: namespace,
    });

    const secret = secretResponse.body || secretResponse;

    if (secret.data && secret.data['tls.crt'] && secret.data['tls.key']) {
      secretExists = true;
    }
  } catch (err) {
    if (getErrorStatusCode(err) !== 404) {
      // Unexpected error reading Secret
      console.error(
        '[external-certificates] Unexpected error reading external certificate Secret:',
        err.message
      );
    }
    // 404 means Secret doesn't exist yet, secretExists stays false
  }

  // Determine final state
  if (error) {
    return {
      ready: false,
      state: 'error',
      reason: 'ExternalSecret sync error',
    };
  }

  if (synced && secretExists) {
    return {
      ready: true,
      state: 'linked',
      reason: 'ExternalSecret synced and Secret exists',
    };
  }

  if (synced && !secretExists) {
    return {
      ready: false,
      state: 'pending',
      reason: 'ExternalSecret synced but Secret not yet created',
    };
  }

  return {
    ready: false,
    state: 'pending',
    reason: 'ExternalSecret not synced yet',
  };
}

/**
 * Waits for an ExternalSecret's target Secret to become ready, retrying on pending status.
 * Gives the cluster time to reconcile the ExternalSecret CRD into an actual Secret.
 *
 * @param {string} secretName - Name of ExternalSecret and Secret to check
 * @param {string} namespace - K8s namespace
 * @param {object} [options]
 * @param {number} [options.maxRetries=3] - Maximum number of check attempts
 * @param {number} [options.retryDelayMs=5000] - Delay between retries in milliseconds
 * @returns {Promise<{ready: boolean, state: 'linked'|'pending'|'error', reason: string}>}
 */
async function waitForSecretReady(secretName, namespace, options = {}) {
  const maxRetries = options.maxRetries ?? 3;
  const retryDelayMs = options.retryDelayMs ?? 5000;
  let certStatus;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    certStatus = await checkSecretReady(secretName, namespace);

    if (certStatus.ready || certStatus.state === 'error') {
      break;
    }

    if (attempt < maxRetries) {
      console.log(
        `[external-certificates] Secret not ready (attempt ${attempt}/${maxRetries}), retrying in ${retryDelayMs / 1000}s...`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  return certStatus;
}

module.exports = {
  generateSecretName,
  ensureExternalSecret,
  checkSecretReady,
  waitForSecretReady,
};
