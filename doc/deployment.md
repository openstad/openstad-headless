## Deployment (Kubernetes/Helm)

OpenStad Headless is deployed to Kubernetes using the included Helm chart and a set of script-first deploy helpers.

- Helm chart: `../charts/openstad-headless/`
- Deploy scripts: `../operations/deployments/openstad-headless/`

The deploy scripts are the canonical way to deploy/upgrade an environment: they select the correct kubectl context, decrypt secrets, and run `helm upgrade --install` with the right value files.

### Requirements

- [kubectl](https://kubernetes.io/docs/reference/kubectl/)
- [Helm](https://helm.sh/)
- [SOPS](https://github.com/getsops/sops)
- Access to the `headless.agekey` private key (Age)
- A configured kubectl context (the deploy scripts will switch context; double-check before running)

Required environment variables for SOPS:

- `SOPS_AGE_KEY_FILE` — path to your Age private key (e.g. `~/keys/headless.agekey`)

Optional:

- `SOPS_AGE_RECIPIENTS` — if not set, the helper scripts try to derive it from the public key embedded in the private key file

### Environment inputs (what operators edit)

Each environment lives under:

- `../operations/deployments/openstad-headless/environments/<env>/`

Typical structure (example: `acc`):

```
operations/deployments/openstad-headless/environments/
    acc/
        values.yml
        images.yml
        secrets/
            secrets.enc.yml
            secrets.yml
```

What each file is:

- `values.yml` — Helm values (plain text configuration)
- `images.yml` — pinned image tags for each service
- `secrets/secrets.enc.yml` — encrypted secrets (committed to git)
- `secrets/secrets.yml` — decrypted secrets (generated locally; DO NOT COMMIT)

Concrete example paths you can use as references:

- `../operations/deployments/openstad-headless/environments/acc/values.yml`
- `../operations/deployments/openstad-headless/environments/acc/images.yml`
- `../operations/deployments/openstad-headless/environments/acc/secrets/secrets.enc.yml`

### Required services / dependencies

For production-like deployments you need (at minimum):

- **MySQL** — used by **api-server** and **auth-server**
  - If you run MySQL outside the chart, keep `dependencies.mysql.enabled: false` and provide credentials via `secrets.database` in your environment values/secrets.
  - If you use the chart-provided MySQL, set `dependencies.mysql.enabled: true` and ensure secrets match what the chart expects.

- **MongoDB** — used by **cms-server**
  - If you run MongoDB outside the chart, keep `dependencies.mongodb.enabled: false` and set `secrets.cms.mongodbUri`.

- **Redis** (message streaming) — used by **api-server** and **cms-server** when message streaming is enabled
  - Configured via `MESSAGESTREAMING_REDIS_URL` (an env var consumed by the apps)
  - In Helm values, inject this using `api.extraEnvVars` and `cms.extraEnvVars` in your environment’s `values.yml`.

- **S3-compatible object storage (optional)**
  - If you enable S3-backed storage for CMS and/or images, configure it via the chart secrets (see `secrets.cms.s3.*`) and the image service settings (e.g. `image.useS3`).
  - If you don’t use S3, the chart can use PVC-backed storage where supported.

### Deploy / upgrade checklist (script-first)

From repo root, run the script for your environment.

ACC example:

```sh
./operations/deployments/openstad-headless/deploy-acc.sh
```

Local cluster helper (if applicable):

```sh
./operations/deployments/openstad-headless/deploy-local.sh
```

What the scripts do (high level):

1. Switch kubectl context and select namespace
2. Decrypt `*.enc.yml` secrets files
3. Run `helm upgrade --install` with:
   - `-f values.yml`
   - `-f secrets/secrets.yml` (decrypted)
   - `-f images.yml`
4. Restore your previous kubectl context

### Adding / editing secrets (SOPS)

Helper scripts:

- `../operations/scripts/decrypt.sh`
- `../operations/scripts/encrypt.sh`

Decrypt all secrets ending with `.enc.yml`:

```sh
./operations/scripts/decrypt.sh
```

Decrypt a single file:

```sh
./operations/scripts/decrypt.sh operations/deployments/openstad-headless/environments/acc/secrets/secrets.enc.yml
```

Encrypt after editing:

```sh
./operations/scripts/encrypt.sh operations/deployments/openstad-headless/environments/acc/secrets/secrets.yml
```

Important:

- Commit only `*.enc.yml` files.
- Never commit decrypted `secrets.yml`.

### Version pinning / defining an upgrade

A repeatable deployment/upgrade is defined by:

1. **Helm chart version** — pinned in the deploy script (e.g. `CHART_VERSION` in `../operations/deployments/openstad-headless/deploy-acc.sh`).

2. **Image tags** — pinned in your environment:

- `../operations/deployments/openstad-headless/environments/<env>/images.yml`

Recommendation: avoid `:latest` in production-like environments. Pin explicit tags.

### Post-upgrade validation

After a deploy/upgrade, validate in this order:

1. **Helm + Kubernetes sanity**

- `helm status <release> -n <namespace>`
- `helm history <release> -n <namespace>`
- `kubectl get pods -n <namespace>` (all pods Ready)
- `kubectl get events -n <namespace> --sort-by=.lastTimestamp` (spot obvious failures)

2. **InitContainers / migrations completed**

API/Auth run DB init/migrations using initContainers. If a service is not Ready, inspect initContainer logs.

Source-of-truth chart templates:

- `../charts/openstad-headless/templates/api/deployment.yaml`
- `../charts/openstad-headless/templates/auth/deployment.yaml`

3. **HTTP health checks**

All services expose `/health`.

Examples (replace `<base>` with your environment base domain):

- API: `https://api.<base>/health`
- API DB: `https://api.<base>/db-health`
- Auth: `https://auth.<base>/health`
- Admin: `https://admin.<base>/health`
- Image: `https://img.<base>/health`
- CMS: `https://cms.<base>/health`

4. **Functional smoke tests (core entry points)**

Mirror the “core 5 URLs” idea from `doc/getting-started.md`, but using your Kubernetes hostnames:

- API returns JSON (e.g. `/api/project/1/resource`)
- Auth login page renders
- Image renders in browser
- Admin UI loads
- CMS UI loads

### Where to look when it breaks (production-like)

- `helm status` / `helm history`
- Rollback if needed: `helm rollback <release> <revision> -n <namespace>`
- `kubectl describe pod <pod> -n <namespace>`
- `kubectl logs <pod> -n <namespace>` (or `-c <container>` / init container)
- `kubectl get events -n <namespace> --sort-by=.lastTimestamp`

InitContainer issues (DB init/migrations) are a common upgrade failure mode. If API/Auth won’t become Ready, start by inspecting initContainer logs and reviewing the chart templates:

- `../charts/openstad-headless/templates/api/deployment.yaml`
- `../charts/openstad-headless/templates/auth/deployment.yaml`

Certificates / pre-install job:

- The chart includes a pre-install job: `../charts/openstad-headless/templates/pre-install-job.yml`
- See also: `doc/external-certificates-operator-guide.md`

### Breaking changes & migrations: where to look

- `../CHANGELOG.md`
- `../apps/api-server/migrations/`
- `../apps/auth-server/migrations/`
