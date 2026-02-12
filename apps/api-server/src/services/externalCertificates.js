// Feature flag module for external certificate management
// Controls whether the platform uses ExternalSecrets (via External Secrets Operator)
// instead of cert-manager for TLS certificate provisioning.

let _enabled = process.env.EXTERNAL_CERTIFICATES_ENABLED === 'true';

/**
 * Extracts HTTP status code from K8s client errors.
 * @kubernetes/client-node v1.x throws ApiException with .code,
 * older versions throw HttpError with .statusCode.
 */
function getErrorStatusCode(error) {
  return error.code ?? error.statusCode;
}

/**
 * Returns current feature flag state.
 * Other modules call this to gate external certificate logic.
 * @returns {boolean} true if feature is enabled and infrastructure validated
 */
function isEnabled() {
  return _enabled;
}

/**
 * Validates infrastructure requirements for external certificates feature.
 * Runs on startup when feature is enabled. Auto-disables on blocker failures.
 *
 * Checks performed:
 * - ESO CRDs exist (External Secrets Operator installed)
 * - RBAC permissions sufficient (can list/create ExternalSecrets)
 * - ClusterSecretStore reachable (warning only, not a blocker)
 *
 * @returns {Promise<void>}
 */
async function validateInfrastructure() {
  // Skip validation if feature is disabled
  if (!_enabled) {
    return;
  }

  // Skip validation if not running on K8s (local dev)
  if (!process.env.KUBERNETES_NAMESPACE) {
    console.log('[external-certificates] Not running on K8s - skipping infrastructure validation');
    return;
  }

  const namespace = process.env.KUBERNETES_NAMESPACE;
  const blockers = [];
  const warnings = [];

  try {
    // Dynamic import matching existing pattern in checkHostStatus.js
    const k8s = await import('@kubernetes/client-node');
    const kc = new k8s.KubeConfig();
    kc.loadFromCluster();

    // Check 1: ESO CRDs exist
    try {
      const apiExtensions = kc.makeApiClient(k8s.ApiextensionsV1Api);
      const crdResponse = await apiExtensions.listCustomResourceDefinition();

      // Handle both response patterns (direct object or .body wrapper)
      const items = crdResponse.items || crdResponse.body?.items || [];

      const esoCRD = items.find(item =>
        item.spec?.group === 'external-secrets.io' &&
        item.spec?.names?.kind === 'ExternalSecret'
      );

      if (!esoCRD) {
        blockers.push('ExternalSecret CRD not found (ESO operator not installed?)');
      }
    } catch (error) {
      blockers.push(`CRD check failed: ${error.message}`);
    }

    // Check 2: RBAC permissions sufficient
    try {
      const customObjects = kc.makeApiClient(k8s.CustomObjectsApi);

      // Try v1 first, fallback to v1beta1 for ESO version compatibility
      let rbacCheckPassed = false;

      for (const version of ['v1', 'v1beta1']) {
        try {
          await customObjects.listNamespacedCustomObject({
            group: 'external-secrets.io',
            version: version,
            namespace: namespace,
            plural: 'externalsecrets'
          });
          rbacCheckPassed = true;
          break;
        } catch (err) {
          if (getErrorStatusCode(err) === 403) {
            // 403 means RBAC insufficient - this is a blocker
            if (version === 'v1beta1') {
              blockers.push('RBAC check failed: 403 Forbidden (missing permissions)');
            }
          } else if (getErrorStatusCode(err) === 404) {
            // 404 means no resources exist yet, but permissions are fine
            rbacCheckPassed = true;
            break;
          }
          // Other errors: try next version
        }
      }
    } catch (error) {
      blockers.push(`RBAC check failed: ${error.message}`);
    }

    // Check 3: ClusterSecretStore reachable (warning only)
    try {
      const customObjects = kc.makeApiClient(k8s.CustomObjectsApi);

      for (const version of ['v1', 'v1beta1']) {
        try {
          const cssResponse = await customObjects.listClusterCustomObject({
            group: 'external-secrets.io',
            version: version,
            plural: 'clustersecretstores'
          });

          const items = cssResponse.items || cssResponse.body?.items || [];

          if (items.length === 0) {
            warnings.push('No ClusterSecretStore found - ExternalSecrets will fail until one is configured');
          } else {
            // Log the ClusterSecretStores found
            const ready = items.filter(item => item.status?.conditions?.some(c => c.type === 'Ready' && c.status === 'True'));
            console.log(`[external-certificates] Found ${items.length} ClusterSecretStore(s), ${ready.length} ready`);
          }
          break;
        } catch (err) {
          if (version === 'v1beta1') {
            warnings.push('Could not check ClusterSecretStore availability');
          }
        }
      }
    } catch (error) {
      warnings.push('Could not check ClusterSecretStore availability');
    }

    // Evaluate results
    if (blockers.length > 0) {
      console.error('[external-certificates] Infrastructure validation failed:');
      blockers.forEach(msg => console.error(`[external-certificates]   - ${msg}`));
      console.error('[external-certificates] Feature auto-disabled. Fix infrastructure and restart.');
      _enabled = false;
      return;
    }

    // Success
    console.log('[external-certificates] Infrastructure validated - feature enabled');

    // Log warnings if any
    if (warnings.length > 0) {
      warnings.forEach(msg => console.warn(`[external-certificates] WARNING: ${msg}`));
    }

  } catch (error) {
    // Unexpected error - auto-disable
    console.error('[external-certificates] Unexpected validation error:', error.message);
    console.error('[external-certificates] Feature auto-disabled. Fix infrastructure and restart.');
    _enabled = false;
  }
}

module.exports = {
  isEnabled,
  validateInfrastructure
};
