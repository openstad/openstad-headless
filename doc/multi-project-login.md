# Multi-project login

Lets a visitor be logged in on several projects of one installation at the same time, for example a likes widget of project A and a budgeting widget of project B on one page. Enabled with `MULTI_PROJECT_LOGIN=true` on the api-server and the auth-server; see [setup options](./setup-options.md#multi-project-login-multi_project_login-2026-10-07) for the flag itself and what changes for visitors.

## How a widget logs in

When a widget needs a logged-in user (for example on a like), it runs these steps in order:

1. Already logged in on its own project: done.
2. For each identity the browser already holds for another project of the same api-server: `POST exchange`. The first answer that is not `401`/`403` decides the next step.
3. `uniquecode_required`: a dialog asks for the vote code (`POST uniquecode-login`).
4. `fields_required`: the dialog asks for the missing fields (`POST complete-fields`).
5. Anything else, or no identity at all: the auth-server login opens in a popup window (`popup=1`). If the popup is blocked, the widget offers a button to log in in the same window (the regular redirect).

A user row in a project is only created at step 2–4, after an action of the visitor. Being logged in on project B alone never creates a user in project A.

## Endpoints

All three are registered on the api-server only when `MULTI_PROJECT_LOGIN=true`, under `/auth/project/:projectId/…?useAuth=default`. They accept and return JSON. CORS follows the project's `allowedDomains`, like every other widget call.

The api-server talks to the auth-server server-to-server with the client credentials of the target project, so no auth-server cookie is needed.

### `POST /auth/project/:projectId/exchange`

Logs the visitor in on this project with a login from another project.

Request:

```json
{ "sourceJwt": "<jwt of another project>" }
```

The source JWT must be valid for the installation's global `jwtSecret`, must not be a pending token, must not be anonymous, and its project must use the `openstad` adapter on the same auth-server as the target project. A login from a project whose client only allows `UniqueCode` is never used as source: vote code identities stay within their own project. Otherwise: `401 { "status": "invalid_token" }` or `401 { "status": "not_allowed" }`. The widget then tries the next known login or opens the popup.

After that, the response follows the [shared gate responses](#shared-gate-responses).

### `POST /auth/project/:projectId/uniquecode-login`

Logs in with a vote code (unique code) of this project's auth client.

Request:

```json
{ "code": "ABC123" }
```

| Status | Body                                | Meaning                                                                                  |
| ------ | ----------------------------------- | ---------------------------------------------------------------------------------------- |
| `400`  | `{ "status": "code_required" }`     | No code sent.                                                                            |
| `401`  | `{ "status": "invalid_code" }`      | Unknown code for this client.                                                            |
| `429`  | `{ "status": "too_many_attempts" }` | Too many failed attempts from this IP. The widget shows an error.                        |
| `429`  | `{ "status": "client_locked" }`     | Too many failed attempts for the whole client. The widget falls back to the popup.       |
| other  |                                     | The [shared gate responses](#shared-gate-responses); `uniquecode_required` cannot occur. |

The api-server forwards the visitor's IP (`req.ip`) to the auth-server for the lockout, see [lockout](#lockout-and-rate-limiting).

### `POST /auth/project/:projectId/complete-fields`

Fills in the required user fields that are still missing.

Request:

```json
{
  "pendingJwt": "<pendingJwt from a 409 fields_required>",
  "fields": { "postcode": "1234 AB", "privacyConsent": true }
}
```

- `pendingJwt` must be a pending token for this project, otherwise `401 { "status": "invalid_token" }`.
- `fields` must be an object, otherwise `400 { "status": "fields_missing" }`.
- Only fields that are still missing are used; anything else is ignored. Text fields are trimmed and must not be empty. `privacyConsent` only counts as `true`. `emailNotificationConsent` is stored as `true` or `false`.
- Values are validated against the api-server `User` model, and `accessCode` against the auth-server. On failure: `422 { "status": "invalid_fields", "invalidFields": ["postcode"] }`. Nothing is stored in that case.
- Valid values are stored on the auth-server user. Consents are stored per client.

After that, the response follows the [shared gate responses](#shared-gate-responses). A `409 fields_required` here lists the fields that are still missing.

### Shared gate responses

All three endpoints end with the same gates as the auth-server login screen (`checkRequiredUserFields`, `check2FA`, `checkPhonenumberAuth`, `checkUniqueCodeAuth`), plus the admin-project check of digest login. They are evaluated in this order; the first one that applies wins.

| Status | Body                                                                                                                                  | When                                                                                                                                   | Widget                    |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `403`  | `{ "status": "environment_forbidden" }`                                                                                               | Target is the admin project (id 1) and the role is not `admin`, `moderator` or `editor`.                                               | Next identity, then popup |
| `409`  | `{ "status": "two_factor_required" }`                                                                                                 | The role on the target client is in its `twoFactorRoles`.                                                                              | Popup                     |
| `409`  | `{ "status": "phonenumber_required" }`                                                                                                | The client allows `Phonenumber`, the user has no confirmed phone number, and the role is not privileged.                               | Popup                     |
| `409`  | `{ "status": "uniquecode_required" }`                                                                                                 | `UniqueCode` is the client's only auth type, the user has no code for this client, and the role is not privileged.                     | Vote code dialog          |
| `409`  | `{ "status": "fields_required", "missingFields": [...], "pendingJwt": "...", "labels": {...}, "privacy": { "url", "text" } \| null }` | One or more of the client's `requiredUserFields` are empty. `labels` are the client's custom labels; `privacy` is the disclaimer link. | Fields dialog             |
| `200`  | `{ "jwt": "...", "expireOnClose": true }`                                                                                             | All gates pass. `expireOnClose` is only present for roles whose login ends when the browser closes.                                    | Logged in                 |

The role on the target project is the user's role row for the target client, or `member` when there is none. A role from another project is never carried over.

A `pendingJwt` is valid for 15 minutes and is only accepted by `complete-fields`. Sent as `Authorization: Bearer` to any other route it is treated as no login (anonymous).

Any other error is passed on as a regular error response (`5xx`); the widget then falls back to the popup.

## Exchange policy: when a login is never silent

`exchange` only issues a JWT when the visitor would also pass the auth-server login screen for the target client without input. In particular:

- **Two-factor authentication is never satisfied silently.** Whether 2FA was completed is stored in the auth-server session per client, and the api-server cannot see that session. A role that needs 2FA on the target client therefore always gets `two_factor_required`, and the popup runs the real 2FA flow on the auth-server. Do not change this into an inline 2FA step or a cached 2FA result: that would be a 2FA bypass across projects.
- Phone number confirmation is never done inline either (`phonenumber_required` → popup with the SMS flow).
- A login on a project with only vote codes needs a code of that project. An e-mail login from another project is not enough, and is never linked to the code.
- A vote code login is never used to log in on another project, so it never collects profile data that could flow back to the vote code project. This also holds for the popup: the auth-server ends the session of an identity without e-mail address or phone number (a vote code identity) when it is used for a client that does not accept vote codes, and shows the regular login screen instead (`apps/auth-server/middleware/codeOnlySessionGuard.js`). Users with the role `admin`, `moderator` or `editor` on that client are excluded, such as the seeded first admin, who has no e-mail address.
- Anonymous logins are never exchanged.

When the browser holds identities of several projects, they are tried in storage order and the first usable one wins. In practice there is one real identity per visitor.

A popup login cannot happen without a click: browsers block third-party cookies, so the auth-server session is not visible from another domain without a top-level window. One click is the minimum on an external site.

## Lockout and rate limiting

Vote codes are guessable, so `uniquecode-login` is protected in two layers.

**Lockout on the auth-server** (`apps/auth-server/utils/uniqueCodeLockout.js`). Every unknown code is stored in `login_attempts` (`clientId`, `ip`, time). Within a window of 15 minutes:

- 20 failures for one client and one IP lock that IP for that client: `too_many_attempts` (`scope: "ip"`).
- 200 failures for one client lock the whole client: `too_many_attempts` (`scope: "client"`). The api-server turns this into `client_locked`, and the widget falls back to the regular auth-server login, so other voters can still log in through the existing code screen.

The lockout is shared by all api-server instances because it lives in the auth-server database. It only applies to the inline endpoint; the existing code screen of the auth-server is not counted.

**Rate limiting on the api-server.** The generic limiter of `@openstad-headless/lib/rateLimiter` applies to all api routes, and the three inline routes have their own limiter with the same settings: 100 requests per minute per IP by default (`RATE_LIMIT`, `RATE_WINDOW_MS`). The inline routes answer `429 { "status": "too_many_requests" }` as JSON, so the dialog can show the message. The limiters are in memory per instance and skip private IP addresses, so they are only a first line.

Both use `req.ip`. Set [`TRUST_PROXY`](./setup-options.md#trusted-proxies-trust_proxy-2026-10-07) to the real proxy setup; with the default (trust every proxy) a client can choose its own IP through `X-Forwarded-For` and avoid the per-IP lockout. The per-client limit still applies.

## Vote codes are reusable credentials

A vote code is not single-use. On first use it is linked to a new auth-server user; every later use logs in as that same user. That is how a voter returns to change or check a vote, and it matches the existing code screen of the auth-server (the old `isUsed` check there never had a field to read).

Consequences:

- Whoever knows a used code can log in as that voter. Hand codes out like passwords.
- The lockout above is what limits guessing.
- A vote code identity is separate from any e-mail identity of the same person; see the setup options.

## Logout

Logout ends the whole auth-server session and clears the logins of all projects in the browser, also with the flag on. This holds for the logout of a widget and, with the flag on, also for a logout through a link on the site that returns with `openstadlogout`, and for a logout through the CMS. The CMS removes `openstadlogout` from the url itself, so it sets a short-lived cookie `openstad_logout` (five minutes, path `/`) that the widgets read and remove. On a host with several CMS sites in subfolders, a logout on one site therefore also clears the widget logins of the other sites on that host. Other open tabs follow the stored logins and log out too; a tab never writes back a login that was removed while it was loading the user. A widget only fetches its user again when the stored login of its own project changes, once per project; a refreshed profile in another tab does not count, so opening or reloading a tab costs the other tabs no requests. Logout per project is postponed: the auth-server lets a valid session through to every client, so removing only one client's login would let the next person on a shared device log back in with one click.

## CMS sites (Apostrophe)

- The regular CMS login uses the same default as the widgets: with the flag on it reuses the auth-server session, unless `config.auth.forceNewLoginOnWidgets` says otherwise.
- The CMS admin login (`/admin/login`) reuses the auth-server session for a user with the role `admin`, `moderator` or `editor` on that site (`apps/auth-server/middleware/adminLoginSessionReuse.js`). It then always asks for the 2FA code, also when the site does not require 2FA for that role. This happens once per site per auth-server session. The admin panel (client 1) is excluded and always asks for its own login. The reused session starts a new privileged session window for that site, even when the original login is older; the required 2FA code is the re-authentication. A fresh login for that site clears the 2FA requirement again.
- After any CMS login, a user with the role `admin` or `editor` on that site is logged in to Apostrophe automatically (`aposAuthenticate` in `apps/cms-server/modules/openstad-auth/index.js`). Moderators are logged in to the site but not to Apostrophe.
- The project settings in the admin panel show a "Bewerk site" button that opens the CMS admin login of the project's website. Admin panel users who are not superuser only see projects where they are `admin` or `editor`. A superuser without a role on that site gets the admin login screen of the site and cannot log in there as an editor; the creator of a project gets the `admin` role on its site automatically, other users through user management.

## Known gaps

- The auth-server does not validate `postcode` itself. Through the popup or redirect login, a project user with missing or invalid data can still get a valid JWT, because digest login ignores update errors. The inline endpoints do reject it (`422`).
- `exchange` returns a `5xx` when the identity holds old data that the api-server `User` model rejects. The widget then falls back to the popup.
- `user_roles` has no unique index on `(clientId, userId)`. Two simultaneous first logins with the same vote code can create duplicate role rows.
- `complete-fields` cannot store a name, e-mail address or phone number for a user who has a role on another client. The auth-server refuses that write (`ensureIdentityWriteAllowed`) to protect such identities. The widget then falls back to the popup, where the visitor fills in the field again. Since vote code identities are no longer exchanged, this only affects users with a role on several projects, such as editors.
- Budgeting widgets created before this change keep their stored step 3 text, which says the vote code is entered on a separate page and the voter then returns to this page. With the flag on, the code is asked in a popup or a dialog instead. Check and update that text when you turn the flag on; new budgeting widgets get a text that fits both.
- Only the likes and budgeting widgets use the inline login. Account, choice guide, comments, distribution module, document map, survey and resource form still redirect to the login page; their login on other projects stays intact.
- In Safari (WebKit), the Tab key skips buttons by default. In a dialog with a text field, such as the vote code dialog, Tab then moves focus from the field to the page behind the dialog, because the focus trap of the shared dialog only catches Tab on its first and last button. With Option+Tab focus stays inside the dialog, but moving forward stops at the submit button; Escape closes the dialog and returns focus. Chromium and Firefox are not affected.
