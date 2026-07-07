# ADR 0001 — Layered structure for api-server routes (route → controller → service)

- **Status:** Accepted
- **Date:** 2026-06-23
- **Issue:** #1640 — Split and refactor the api-server core files

## Context

The largest api-server route files (`routes/api/project.js` ~1.7k lines,
`resource.js` ~1.1k, `user.js` ~0.9k) and the matching models (`Resource.js`,
`User.js`) mixed three concerns in one file: HTTP routing, request/response
orchestration, and business logic (project duplication, auth-client sync,
certificate handling, etc.). This made a single logic change require reading
through a thousand-plus lines, and every new feature grew these files further.

## Decision

We introduce a three-layer structure for the api-server. Each layer has a
single responsibility and a clear dependency direction (downward only):

```
routes/api/<entity>.js              routing only — wires middleware + controller handlers
  │  (depends on ↓)
controllers/<entity>Controller.js   request/response orchestration — reads req, calls services, shapes res
  │  (depends on ↓)
services/<domain>.js                pure business logic — no req/res, unit-testable
  │  (depends on ↓)
models/<Entity>.js                  ORM mapping, scopes, associations, sequelize-authorization hooks
```

### Rules — where new code lives

1. **Route file** (`routes/api/*.js`)
   - Only `router.route(...).<verb>(...)` wiring.
   - May reference shared middleware (`auth.can`, `pagination`, `rateLimiter`,
     `removeProtocolFromUrl`, `searchInResults`, `auth.useReqUser`) and
     controller handlers.
   - Target: well under 200 lines. No business logic, no `db` queries.

2. **Controller** (`controllers/*Controller.js`)
   - Knows about `req`/`res`/`next`. Reads input off the request, calls one or
     more services, and shapes the response.
   - Owns request-flow glue that is genuinely coupled to the middleware chain
     (e.g. mutating `req.body.config` between `.post` steps).
   - Should not contain reusable business rules — those belong in a service.

3. **Service** (`services/*.js`)
   - Plain functions that take explicit arguments and return data or throw.
   - **No `req`/`res`/`next`.** This is what makes them unit-testable.
   - May use `db` and other services. Must not import controllers.

4. **Model** (`models/*.js`)
   - ORM concerns only: attributes, scopes, associations, and the
     `sequelize-authorization` hooks (`auth`, `can`, `authorizeData`, …).
   - **The authorization hooks stay in the model** — they are an ORM concern
     bound to the Sequelize instance lifecycle. Non-ORM business logic that
     currently lives in models is moved out to services.

### Dependency direction

`route → controller → service → model`. A service never imports a controller;
a controller never defines a router. This keeps cycles out and makes each layer
independently testable.

## Consequences

- **Positive:** business logic is unit-testable without spinning up Express;
  route files become a readable table of endpoints; new features extend a
  service or controller rather than growing a monolith.
- **Cost:** one logical handler is now spread across two/three files; a reader
  follows the chain route → controller → service. The naming convention
  (`<entity>Controller`, `<domain>` service) keeps this navigable.
- **Migration:** applied per core file in separate PRs under #1640
  (project → resource → user → model extraction). Each step preserves request/
  response contracts exactly and is gated by the existing unit/integration
  tests plus new service unit tests.

## Example (project, PR1)

- `routes/api/project.js` — wiring only.
- `controllers/projectController.js` — all route handlers + request-flow glue.
- `services/projectDuplication.js` — clone tags/statuses/widgets/resources/users.
- `services/authClientSync.js` — sanitize/strip/build auth provider config.
- `services/projectCertificates.js` — external-certificate retry + cleanup.
