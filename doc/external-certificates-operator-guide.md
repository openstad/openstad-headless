# External Certificates - Operator Guide

## Overview

The external certificates feature allows OpenStad projects to use TLS certificates managed outside the cluster (e.g., in Google Secret Manager, AWS Secrets Manager, or HashiCorp Vault) instead of cert-manager's automatic Let's Encrypt provisioning.

**How it works:**

1. Certificates are stored in an external secret provider
2. The External Secrets Operator (ESO) syncs them into Kubernetes Secrets
3. The api-server creates ExternalSecret resources per project domain
4. When the Secret is ready, TLS is attached to the project's Ingress
5. When the Secret is not yet available, the Ingress is created without TLS (HTTP only)

This approach supports organizations that manage certificates centrally (e.g., wildcard certificates or certificates issued by an internal CA).

## Prerequisites

Before enabling external certificates, the following infrastructure must be in place.

### 1. External Secrets Operator (ESO)

ESO must be installed in the cluster. The api-server checks for the `ExternalSecret` CRD on startup.

Verify installation:

```bash
kubectl get crd externalsecrets.external-secrets.io
```

Expected output: the CRD definition with creation timestamp. If not found, install ESO following the [official documentation](https://external-secrets.io/latest/introduction/getting-started/).

### 2. ClusterSecretStore

A `ClusterSecretStore` resource must be configured, pointing to your external secret provider (Google Secret Manager, AWS Secrets Manager, HashiCorp Vault, etc.).

Verify it exists and is ready:

```bash
kubectl get clustersecretstore
kubectl get clustersecretstore <store-name> -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'
```

The default store name referenced by this feature is `gcp-secret-store`. This is configurable via `api.externalCertificates.secretStoreName` in the Helm values.

> **Note:** The api-server checks ClusterSecretStore availability on startup but treats it as a warning, not a blocker. Missing ClusterSecretStore will cause ExternalSecret sync failures at runtime.

### 3. Secrets provisioned in external provider

TLS certificate data must be pre-provisioned in the external secret provider under the expected secret name (see [Secret Naming Convention](#secret-naming-convention)). Each secret must contain two properties:

- `tls.crt` -- the certificate chain (PEM encoded)
- `tls.key` -- the private key (PEM encoded)

### 4. RBAC permissions

The api-server's ServiceAccount (`openstad-headless-ingress-sa`) requires permissions to manage ExternalSecret resources. The Helm chart provisions these automatically via a Role:

```yaml
- apiGroups: ['external-secrets.io']
  resources: ['externalsecrets']
  verbs: ['create', 'update', 'patch', 'delete', 'get', 'list', 'watch']
```

Verify RBAC is in place:

```bash
kubectl get role openstad-headless-ingress-update-role -n <namespace> -o yaml
kubectl auth can-i list externalsecrets.external-secrets.io -n <namespace> --as=system:serviceaccount:<namespace>:openstad-headless-ingress-sa
```

## Configuration

### Helm values

The feature is configured under `api.externalCertificates` in `values.yaml`:

| Value                                           | Default                       | Description                                                                            |
| ----------------------------------------------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| `api.externalCertificates.enabled`              | `false`                       | Feature toggle. Must be `true` to enable.                                              |
| `api.externalCertificates.secretPrefix`         | `tls-openstad-prod-{orgName}` | Naming prefix template for generated secret names. `{orgName}` is replaced at runtime. |
| `api.externalCertificates.secretStoreName`      | `gcp-secret-store`            | Name of the ClusterSecretStore to reference in ExternalSecret resources.               |
| `api.externalCertificates.retryCooldownSeconds` | `60`                          | Cooldown in seconds between manual retry triggers per project.                         |

Example configuration:

```yaml
api:
  externalCertificates:
    enabled: true
    secretPrefix: 'tls-openstad-prod-{orgName}'
    secretStoreName: 'gcp-secret-store'
    retryCooldownSeconds: 60
```

### Environment variables

The Helm chart injects these values as environment variables into the api-server deployment:

| Environment Variable            | Helm Source                                     |
| ------------------------------- | ----------------------------------------------- |
| `EXTERNAL_CERTIFICATES_ENABLED` | `api.externalCertificates.enabled`              |
| `EXTERNAL_CERT_SECRET_PREFIX`   | `api.externalCertificates.secretPrefix`         |
| `EXTERNAL_CERT_SECRET_STORE`    | `api.externalCertificates.secretStoreName`      |
| `EXTERNAL_CERT_RETRY_COOLDOWN`  | `api.externalCertificates.retryCooldownSeconds` |

Additionally, `KUBERNETES_NAMESPACE` is injected from the pod's metadata and is used for namespace-scoped operations.

## Secret Naming Convention

Secret names are auto-generated following a locked pattern:

```
{prefix}-{domainSlug}
```

Where:

- **prefix** is derived from the `secretPrefix` template with `{orgName}` replaced by the namespace-derived org name. The org name is extracted by stripping the `openstad-` prefix from the Kubernetes namespace (e.g., namespace `openstad-nijkerk` yields org name `nijkerk`).
- **domainSlug** is the project domain slugified: lowercased, non-alphanumeric characters replaced with dashes, consecutive dashes collapsed, leading/trailing dashes removed.

### Examples

| Namespace            | Domain                      | Secret Name                                             |
| -------------------- | --------------------------- | ------------------------------------------------------- |
| `openstad-nijkerk`   | `www.nijkerk-doet-mee.nl`   | `tls-openstad-prod-nijkerk-www-nijkerk-doet-mee-nl`     |
| `openstad-amsterdam` | `participatie.amsterdam.nl` | `tls-openstad-prod-amsterdam-participatie-amsterdam-nl` |

### Slug override

Projects can specify a custom slug via the `externalCertSlug` config field in the admin UI. When set, it replaces the auto-generated domain slug:

```
tls-openstad-prod-nijkerk-{customSlug}
```

This is useful when the external secret provider uses a different naming convention.

## How It Works

The external certificates feature integrates into the existing host status check flow:

```
1. API Server Startup
   |
   +-- Feature flag checked (EXTERNAL_CERTIFICATES_ENABLED=true?)
   +-- Infrastructure validated:
   |     - ESO CRD exists?           --> if missing: feature auto-disabled
   |     - RBAC permissions OK?      --> if insufficient: feature auto-disabled
   |     - ClusterSecretStore found? --> warning only if missing
   |
   v
2. Project Configured with certificateMethod: 'external'
   |
   v
3. checkHostStatus runs (periodic or triggered)
   |
   +-- Per-project guard: isEnabled() AND certificateMethod === 'external'
   |
   +-- Generate secret name from domain + namespace
   +-- ensureExternalSecret: create/update ExternalSecret CRD
   |     - References ClusterSecretStore
   |     - Targets kubernetes.io/tls type Secret
   |     - Maps tls.crt and tls.key from external store
   |     - Refresh interval: 1 hour
   |
   +-- checkSecretReady: dual-check
   |     - Check 1: ExternalSecret status condition (Ready + SecretSynced?)
   |     - Check 2: Kubernetes Secret exists with tls.crt + tls.key data?
   |
   +-- Update hostStatus.externalCert: { state, secretName, lastChecked }
   |
   +-- If ready (linked):
   |     --> Create/update Ingress WITH tls.secretName
   |
   +-- If not ready (pending):
         --> Create/update Ingress WITHOUT TLS section
```

**ESO version compatibility:** The api-server tries ESO API v1 first, falling back to v1beta1 for older ESO installations.

## Troubleshooting

### Feature auto-disabled on startup

**Symptoms:** Log messages containing `[external-certificates] Infrastructure validation failed` and `Feature auto-disabled`.

**Causes:**

- ExternalSecret CRD not found (ESO not installed)
- RBAC permissions insufficient (403 Forbidden on list operation)

**Debug:**

```bash
# Check ESO installation
kubectl get crd externalsecrets.external-secrets.io

# Check RBAC
kubectl auth can-i list externalsecrets.external-secrets.io \
  -n <namespace> \
  --as=system:serviceaccount:<namespace>:openstad-headless-ingress-sa

# Check api-server logs for validation output
kubectl logs -n <namespace> deployment/<api-deployment> | grep '\[external-certificates\]'
```

**Resolution:** Install ESO or fix RBAC permissions, then restart the api-server pod.

### Certificate stuck in pending state

**Symptoms:** Admin UI shows "In afwachting" (Pending) status. HTTPS not available for the project.

**Causes:**

- Secret not yet provisioned in the external provider
- ESO not syncing (operator pod unhealthy)
- ClusterSecretStore not configured or not ready

**Debug:**

```bash
# Check ExternalSecret status
kubectl get externalsecret <secret-name> -n <namespace> -o yaml

# Check if the target Secret was created
kubectl get secret <secret-name> -n <namespace>

# Check ESO operator logs
kubectl logs -n external-secrets deployment/external-secrets

# Check ClusterSecretStore status
kubectl get clustersecretstore <store-name> -o jsonpath='{.status.conditions}'
```

**Resolution:** Provision the certificate in the external provider, verify ESO operator health, or fix ClusterSecretStore configuration.

### Certificate shows error state

**Symptoms:** Admin UI shows "Fout" (Error) status.

**Causes:**

- ExternalSecret sync error (`SecretSyncedError` condition)
- External provider access failure (auth, permissions, quota)
- Secret name mismatch between ExternalSecret remote ref and actual provider key

**Debug:**

```bash
# Check ExternalSecret conditions for error details
kubectl get externalsecret <secret-name> -n <namespace> \
  -o jsonpath='{.status.conditions[?(@.type=="Ready")]}'

# Check ESO operator logs for sync errors
kubectl logs -n external-secrets deployment/external-secrets | grep <secret-name>
```

**Resolution:** Fix the underlying provider issue. The admin can trigger a manual retry after resolving the problem.

### Manual retry not working

**Symptoms:** Retry returns HTTP 429 (Too Many Requests).

**Cause:** Cooldown period active. Default is 60 seconds between retries per project.

**Debug:**

```bash
# Check configured cooldown
kubectl get deployment <api-deployment> -n <namespace> \
  -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="EXTERNAL_CERT_RETRY_COOLDOWN")].value}'
```

**Resolution:** Wait for the cooldown period to expire. The cooldown is tracked in-memory and resets on pod restart.

## Monitoring

### ExternalSecret sync status

Monitor ExternalSecret resources across the namespace:

```bash
# List all ExternalSecrets with status
kubectl get externalsecret -n <namespace>

# Watch for sync failures
kubectl get externalsecret -n <namespace> -o custom-columns=\
NAME:.metadata.name,\
READY:.status.conditions[0].status,\
REASON:.status.conditions[0].reason,\
LAST_SYNCED:.status.conditions[0].lastTransitionTime
```

### Project certificate states

Certificate states are stored in each project's `hostStatus.externalCert` field:

- `linked` -- Certificate active, TLS attached to Ingress
- `pending` -- ExternalSecret created, waiting for certificate provisioning
- `error` -- Sync failure, requires investigation

### ESO operator health

```bash
# Check ESO pods
kubectl get pods -n external-secrets

# Check ESO operator logs
kubectl logs -n external-secrets deployment/external-secrets --tail=50
```

### Key metrics to watch

- Number of ExternalSecrets in error state
- Time spent in pending state per project (extended pending indicates provisioning issues)
- ESO operator pod restarts (indicates stability problems)
- api-server logs for `[external-certificates]` messages
