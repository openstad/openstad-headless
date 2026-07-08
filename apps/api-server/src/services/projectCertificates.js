/**
 * Project external-certificate service.
 *
 * Owns the in-memory retry cooldown and wraps the external-certificate manager
 * for the project certificate-retry endpoint and project deletion cleanup.
 * Extracted from routes/api/project.js (#1640). HTTP status mapping stays in
 * the controller; this module performs the side-effecting operations.
 */
const externalCertificates = require('./externalCertificates');
const externalCertificatesManager = require('./externalCertificatesManager');
const checkHostStatus = require('./checkHostStatus');
const { getCertificateConfig } = require('./checkHostStatusHelpers');

// In-memory cooldown map for certificate retry (projectId -> lastTriggerTime)
const certRetryCooldowns = new Map();
const CERT_RETRY_COOLDOWN_MS =
  (parseInt(process.env.EXTERNAL_CERT_RETRY_COOLDOWN) || 60) * 1000;

function isEnabled() {
  return externalCertificates.isEnabled();
}

// Remaining cooldown in seconds for a project, or 0 if no cooldown is active.
function getRetryCooldownRemaining(projectId) {
  const lastTrigger = certRetryCooldowns.get(projectId);
  if (lastTrigger && Date.now() - lastTrigger < CERT_RETRY_COOLDOWN_MS) {
    return Math.ceil(
      (CERT_RETRY_COOLDOWN_MS - (Date.now() - lastTrigger)) / 1000
    );
  }
  return 0;
}

// Start the retry cooldown with auto-cleanup to prevent a memory leak.
function startRetryCooldown(projectId) {
  certRetryCooldowns.set(projectId, Date.now());
  setTimeout(
    () => certRetryCooldowns.delete(projectId),
    CERT_RETRY_COOLDOWN_MS
  );
}

// Ensure the ExternalSecret exists, wait for readiness, persist cert host status
// and (when ready) trigger a full host-status check. Returns the cert state.
async function performCertificateRetry(project) {
  const namespace = process.env.KUBERNETES_NAMESPACE;
  const slugOverride =
    project.config?.certificates?.externalCertSlug ||
    project.config?.externalCertSlug ||
    null;
  const secretName = externalCertificatesManager.generateSecretName(
    project.url,
    namespace,
    slugOverride
  );

  // Full retry: ensure ExternalSecret exists, wait for readiness, update Ingress
  await externalCertificatesManager.ensureExternalSecret(secretName, namespace);
  const certStatus = await externalCertificatesManager.waitForSecretReady(
    secretName,
    namespace
  );

  // Clone to avoid Sequelize JSON mutation trap (same pattern as checkHostStatus.js)
  let hostStatus = project.hostStatus ? { ...project.hostStatus } : {};
  hostStatus.certificate = {
    method: 'external',
    state: certStatus.state,
    secretName,
    lastChecked: new Date().toISOString(),
  };
  await project.update({ hostStatus });

  // If ready, trigger full checkHostStatus to attach TLS to Ingress
  if (certStatus.ready) {
    await checkHostStatus({ id: parseInt(project.id) });
  }

  return {
    state: certStatus.state,
    secretName,
    ready: certStatus.ready,
  };
}

// Clean up the K8s ExternalSecret when a project that used external
// certificates is deleted. Non-blocking: swallows K8s errors.
async function cleanupExternalSecretOnDelete(project) {
  if (!externalCertificates.isEnabled()) return;

  const certConfig = getCertificateConfig(project.config);
  if (certConfig.certificateMethod !== 'external') return;

  const namespace = process.env.KUBERNETES_NAMESPACE;
  if (!namespace) return;

  try {
    const slugOverride = certConfig.externalCertSlug || null;
    const secretName = externalCertificatesManager.generateSecretName(
      project.url,
      namespace,
      slugOverride
    );
    await externalCertificatesManager.deleteExternalSecret(
      secretName,
      namespace
    );
  } catch (cleanupErr) {
    console.error(
      '[external-certificates] Failed to clean up ExternalSecret for project %s',
      project.id
    );
    // Non-blocking: proceed with deletion even if K8s cleanup fails
  }
}

module.exports = {
  isEnabled,
  getRetryCooldownRemaining,
  startRetryCooldown,
  performCertificateRetry,
  cleanupExternalSecretOnDelete,
};
