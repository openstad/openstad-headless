# OpenStad Headless documentation index

This folder contains repo-level documentation for running and operating the OpenStad headless stack.

## What exists in `doc/`

- [Getting started (Docker)](getting-started.md)
- [Widget workflow (admin preview)](widget-workflow.md)
- [Setup (non-Docker)](setup.md)
- [Setup options](setup-options.md)
- [Databases](databases.md)
- [Deployment](deployment.md)
- [Testing](testing.md)
- [Admin](admin.md)
- [Maps](maps.md)
- [Message streaming](message-streaming.md)
- [External certificates operator guide](external-certificates-operator-guide.md)

## Related docs elsewhere in the repo

- API server docs:
  - [API configuration](../apps/api-server/doc/config.md)
  - [Authentication and authorization](../apps/api-server/doc/auth.md)
  - [Tags: thema's, areas and more](../apps/api-server/doc/tags.and.statuses.md)
  - [Pagination and search](../apps/api-server/doc/pagination-and-search.md)

## What’s missing (recommended additions)

If the goal is “get a grip on the project”, these are the highest-impact missing docs for this folder:

1. **Architecture & repo map**
   - What lives in `apps/` vs `packages/` vs `operations/` vs `vendor/`
   - Which services exist, how they talk to each other, and which ports/domains they use

2. **Services overview (one page)**
   - `api-server`, `auth-server`, `admin-server`, `cms-server`, `image-server`
   - For each: responsibility, local dev command(s), where config lives, where logs go

3. **Configuration reference**
   - Required `.env` keys and what they do (especially auth/login, DB, base domains)
   - Generated config files from scripts (what gets created, where, and when to re-run)

4. **Local development workflow**
   - Recommended path: Docker vs non-Docker, and when to choose which
   - Common dev loops: run one service, run all, debug, migrations/seeds

5. **Widgets/packages development (admin preview flow)**
   - How widget builds work (IIFE build outputs, CSS outputs)
   - How widget preview wiring works (where to add types, where bundling is configured)
   - “Add a new widget end-to-end” checklist

6. **Troubleshooting**
   - Common errors and fixes (DB init, redirect host not allowed, bcrypt build issues, Docker volume resets)

7. **Operations / observability**
   - How to use the `otel-collector/` setup (what signals exist, where to look)
   - Where runtime health checks live and what “healthy” looks like

8. **Release / upgrade notes (lightweight)**
   - Any repo-specific migration steps between versions
   - Where to look for breaking changes
