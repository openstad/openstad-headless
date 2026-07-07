# Plan: Multi-project login (tegelijk ingelogd zijn in meerdere projecten)

> Status: **gereed voor uitvoering — alle precondities (P1–P6) opgelost**
> Formaat: volledig (multi-app, architectureel)
> Scope-bron: deep-search over auth-server, api-server, widget-packages en admin-server (juli 2026)

---

## 1. Scope en constraints

**Doel:** op één website kunnen widgets van verschillende projecten draaien; een gebruiker moet in meerdere projecten tegelijk ingelogd kunnen zijn. Concreet:

1. Ingelogd in project A (bijv. via Url-loginmethode) → widget van project B met **UniqueCode** actief vraagt op het interactiemoment (bijv. stemmen) via een **popup in de widget** om de stemcode en logt **via AJAX** in, zonder page refresh, mét update van de auth-state.
2. Ontbrekende **requiredUserFields** voor project B (bijv. adres, waar project A alleen postcode vereiste) worden op dezelfde manier via een popup uitgevraagd. Zelfde mechanisme voor **accessCode** als required field.
3. **Admin**: na inloggen op de admin-server met een admin-account moet de admin op alle projecten en hun widgets ingelogd (kunnen) zijn.

**Buiten scope:** SSO / externe providers (oidc-adapter, `apps/api-server/src/adapter/oidc/`) — expliciet uitgesloten door de opdrachtgever. DigiD bestaat niet (uitgecommentarieerd in `apps/auth-server/config/auth.js:107-116`). CMS `connect-user`-flow blijft ongewijzigd.

**Betrokken apps/packages:**

| App/package                               | Rol in dit plan                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------- |
| `apps/auth-server`                        | 1 nieuw admin-API endpoint (uniquecode-login)                           |
| `apps/api-server`                         | Nieuwe AJAX-auth-endpoints, project-scoped token handoff, JWT-hardening |
| `packages/lib`                            | Auth-broker (cross-project identity-index)                              |
| `packages/data-store`                     | Nieuwe API-calls, project-scoped token pickup, login-flow hook          |
| `packages/ui`                             | `LoginDialog` component (WCAG)                                          |
| `packages/likes`, `packages/stem-begroot` | Eerste integraties (rest volgt)                                         |
| `apps/admin-server`                       | Alleen verificatie; geen codewijziging voorzien                         |

---

## 2. Huidige situatie (evidence-samenvatting)

De kern-ontdekking: **de auth-server is al een SSO-server** en de widget-opslag is **al per project genamespaced**. Het probleem zit in drie plekken:

### Wat al werkt

- **Auth-server sessie is gedeeld over alle clients** (SSO): één `express-session` (MySQL-store, cookie `openstad-authorization.sid`, `apps/auth-server/app-init.js:90-121`); passport serialiseert alleen `user.id` (`config/auth.js:272-283`). Per-client context (authType, 2FA, rol) zit in `session.clientAuth[client.id]` (`utils/clientAuth.js:18-55`).
- **Users zijn globaal** op de auth-server (`model/user.js`, geen clientId); rollen per client via `user_roles` (`model/user-role.js`); **unique codes zijn per client** (`model/unique-code.js`: `code`, `clientId`, `userId` nullable).
- **Per-client gates** op `/dialog/authorize`: `checkRequiredUserFields`, `check2FA`, `checkPhonenumberAuth`, `checkUniqueCodeAuth` (`apps/auth-server/middleware/client.js:203-323`, routes `routes/routes.js:451-464`).
- **Widget-opslag is per project**: localStorage key `openstad` → `data[projectId].openStadUser` (`packages/lib/local-storage.ts:20-24`). JWT gaat als `Authorization: Bearer` mee (`packages/data-store/src/api/fetch.js:77-79`).
- **Api-server superuser-elevatie**: een admin op `config.admin.projectId` wordt runtime `superuser` voor elk project, gekoppeld via `idpUser.identifier` (`apps/api-server/src/middleware/user.js:142-269`). Een admin-JWT werkt dus op API-niveau al cross-project.
- **Er is al een AJAX-loginpad als voorbeeldpatroon**: `connect-user` (`apps/api-server/src/adapter/openstad/router.js:18-81`) accepteert JSON en geeft `{ jwt }` terug.
- **Popup-bouwsteen bestaat**: Radix `Dialog` in `packages/ui/src/dialog/index.tsx`.

### Wat multi-project login nu blokkeert

1. **`forceNewLogin=1` staat hard in de standaard widget-login-URL** (`apps/api-server/src/routes/widget/widget.js:207`). Elke widget-login logt eerst uit op de auth-server (`adapter/openstad/router.js:88-119`) en **vernietigt daarmee de SSO-sessie** — de gedeelde sessie die multi-project juist mogelijk maakt.
2. **`openstadlogintoken`-pickup is niet project-scoped**: elke widget op de pagina consumeert het token uit de URL, ongeacht voor welk project het gemunt is (`packages/data-store/src/hooks/use-current-user.js:62-69`). Op een multi-project pagina slaat widget B het JWT van project A op in zijn eigen namespace → kapotte state.
3. **Er is geen AJAX-pad voor UniqueCode, requiredFields of accessCode**: die zitten alleen achter server-rendered schermen op de auth-server (`controllers/auth/code.js`, `controllers/auth/required.js`), bereikbaar via full-page redirect.
4. **Geen gedeelde "require login"-abstractie**: elke widget dupliceert `hasRole(...)` + `document.location.href = loginUrl` (o.a. `packages/likes/src/likes.tsx:125-136`, `packages/stem-begroot/src/stem-begroot.tsx:1354-1355`).
5. **Cookie-realiteit**: de auth-server sessiecookie is `SameSite=Lax` — die gaat **niet** mee in cross-site iframes/AJAX, wél bij top-level navigatie (redirect of popup-venster). Stil inloggen via hidden iframe is dus geen optie; token-uitwisseling moet via de api-server lopen (server-to-server) of via een popup-venster.

---

## 3. Strawman vs. Steelman

### Strawman — "popup-venster naar bestaande schermen"

Verwijder `forceNewLogin=1`, maak token-pickup project-scoped, en open de bestaande auth-server loginschermen in een `window.open()` popup die het token via `postMessage` terugstuurt. Geen nieuwe endpoints.

- ✅ Minimale backendwijziging; hergebruikt álle gates (incl. 2FA) exact.
- ❌ Niet de gevraagde UX: geen in-widget popup, geen AJAX; auth-server-styling in een los venster; popup-blockers; stemcode/velden-invoer buiten de widgetcontext.
- ❌ requiredFields-uitvraag blijft een compleet servergerenderd formulier i.p.v. gerichte vraag op het interactiemoment.

### Steelman — "AJAX-auth-API + broker + in-widget dialog"

Nieuwe JSON-endpoints op de api-server (uniquecode-login, exchange, complete-fields) die server-to-server met de auth-server praten (Basic client auth — cookies zijn dan irrelevant), een cross-project identity-broker in de frontend, en een herbruikbare `LoginDialog`. Popup-venster alleen als fallback voor _initiële_ logins (Url/Local vereisen nu eenmaal e-mail-roundtrip of wachtwoordscherm).

- ✅ Exact de gevraagde UX: stemcode/velden-popup op het interactiemoment, AJAX, geen refresh, auth-state live bijgewerkt.
- ✅ Omzeilt third-party-cookie-problematiek volledig voor de exchange-flows.
- ❌ Meer werk: nieuwe endpoints, gate-logica gespiegeld op de api-server, hardening (rate limiting, pending-tokens).

### Keuze: **Steelman, met de popup uit de strawman als fallback** (hybride)

De AJAX-flows dekken de kerncase (identiteit bestaat al ergens → alleen aanvullende credential/velden nodig). De popup-fallback dekt de initiële login op een pagina waar nog géén enkele identiteit bekend is, zonder page refresh. De volledige redirect blijft als laatste fallback bestaan (backwards compatible).

---

## 4. Architectuur van de gekozen oplossing

```
┌────────────────────────── website (extern domein) ──────────────────────────┐
│  Widget A (project 1)          Widget B (project 2, UniqueCode actief)      │
│  localStorage: openstad[1]     localStorage: openstad[2]                     │
│        │                              │                                      │
│        │   auth-broker (packages/lib): index van bekende identiteiten,       │
│        │   events 'osc-auth-changed' + 'storage' → live re-render            │
│        │                              │                                      │
│        │            gebruiker klikt "stem" in widget B                       │
│        │                              ▼                                      │
│        │                 useLoginFlow (data-store):                          │
│        │                 1. POST /auth/project/2/exchange {sourceJwt: A}     │
│        │                 2. → 409 uniquecode_required → LoginDialog (ui)     │
│        │                 3. POST /auth/project/2/uniquecode-login {code}     │
│        │                 4. → 409 fields_required → dialog velden-stap       │
│        │                 5. POST /auth/project/2/complete-fields {…}         │
│        │                 6. → 200 {jwt} → storage + SWR mutate, geen refresh │
└────────┼──────────────────────────────┼──────────────────────────────────────┘
         ▼                              ▼
   api-server ── server-to-server (Basic clientId:secret) ──► auth-server
   (nieuwe routes in adapter/openstad/router.js)   (1 nieuw admin-API endpoint)
```

**Response-contract van alle drie de nieuwe api-server endpoints (uniform):**

```
200 { jwt }                                                → ingelogd
409 { status: 'fields_required', missingFields: [...],
      labels: {...}, pendingJwt }                          → dialog: velden-stap
409 { status: 'uniquecode_required' }                      → dialog: stemcode-stap
401 { status: 'invalid_code' | 'invalid_token' | 'not_allowed' }
```

`pendingJwt` is een kortlevend JWT met claim `pending: true` dat **uitsluitend** door `complete-fields` geaccepteerd wordt en door de reguliere auth-middleware wordt geweigerd.

**Beleidsregel voor stille exchange (spiegelt de auth-server gates exact, zie P1):**

- Target-client heeft `UniqueCode` als **enige** authType (`authTypes.length === 1`) en de gebruiker heeft voor die client geen gekoppelde `unique_codes`-rij én geen geprivilegieerde rol → `uniquecode_required` (spiegelt `apps/auth-server/middleware/client.js:152-193`).
- `requiredUserFields` van de target-client onvolledig (incl. per-client velden `privacyConsent`/`emailNotificationConsent` en `accessCode`) → `fields_required`.
- Bron-identiteit is `anonymous` → exchange geweigerd (`not_allowed`); anonieme users hebben geen overdraagbare identiteit.
- Alles vervuld → direct `{ jwt }`.

---

## 5. Bestandenkaart

**Nieuw:**

| Bestand                                                          | Verantwoordelijkheid                                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `apps/api-server/src/adapter/openstad/inline-login.js`           | Route-handlers voor `uniquecode-login`, `exchange`, `complete-fields` + gedeelde gate-check en user-upsert helpers |
| `apps/api-server/src/adapter/openstad/inline-login.test.js`      | Unit tests (vitest)                                                                                                |
| `apps/auth-server/controllers/admin/api/uniqueCodeLogin.js`      | Admin-API: code → user (logica gespiegeld van de passport-strategy)                                                |
| `apps/auth-server/controllers/admin/api/uniqueCodeLogin.test.js` | Unit tests                                                                                                         |
| `packages/lib/auth-broker.ts`                                    | Cross-project identity-index + change-events                                                                       |
| `packages/lib/auth-broker.test.ts`                               | Unit tests                                                                                                         |
| `packages/data-store/src/hooks/use-login-flow.js`                | Orchestratie: exchange → dialogstappen → state-update                                                              |
| `packages/data-store/src/hooks/use-login-flow.test.js`           | Unit tests                                                                                                         |
| `packages/ui/src/login-dialog/index.tsx` (+ `index.css`)         | Toegankelijke dialog met stappen: stemcode / velden / accesscode                                                   |
| `packages/ui/src/login-dialog/login-dialog.test.tsx`             | Unit tests                                                                                                         |

**Gewijzigd:**

| Bestand                                                               | Wijziging                                                                                                                    |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `apps/api-server/src/adapter/openstad/router.js`                      | `openstadprojectid` in redirect (digest-login :157-168); routes registreren; upsert-logica (:274-372) extraheren naar helper |
| `apps/api-server/src/adapter/openstad/service.js`                     | `loginWithUniqueCode()`, `fetchUniqueCodesForUser()` (server-to-server)                                                      |
| `apps/api-server/src/middleware/user.js`                              | `pending`-tokens weigeren in `parseJwt`; optionele `projectId`-claim-check                                                   |
| `apps/api-server/src/routes/widget/widget.js:207`                     | `forceNewLogin` configureerbaar i.p.v. hardcoded `1`                                                                         |
| `apps/auth-server/routes/adminApi.js`                                 | Route voor `POST /api/admin/unique-code-login`                                                                               |
| `apps/auth-server/middleware/code.js:34-40`                           | `userId`-queryparam-filter in `withAll`                                                                                      |
| `packages/lib/index.ts` (of bestaande export-barrel)                  | Export `auth-broker`                                                                                                         |
| `packages/data-store/src/api/user.js`                                 | `exchangeLogin`, `loginWithUniqueCode`, `completeFields` API-calls                                                           |
| `packages/data-store/src/hooks/use-current-user.js`                   | Project-scoped token-pickup; `notifyAuthChange` na login/logout; luisteren op broker-events                                  |
| `packages/data-store/src/index.js`                                    | `useLoginFlow` binden                                                                                                        |
| `packages/ui/src/index.tsx`                                           | Export `LoginDialog`                                                                                                         |
| `packages/likes/src/likes.tsx:125-136`                                | Redirect vervangen door `useLoginFlow`                                                                                       |
| `packages/stem-begroot/src/stem-begroot.tsx` + `src/step-3/index.tsx` | Idem                                                                                                                         |

**Geen databasemigraties nodig** — alle benodigde modellen (unique_codes, user_roles, users.accessCode, per-client consent-maps) bestaan al.

---

## 6. Precondities — allemaal opgelost (onderzocht juli 2026)

- **P1 — `checkUniqueCodeAuth`-semantiek: OPGELOST.** De gate (`apps/auth-server/middleware/client.js:152-193`) dwingt een UniqueCode alleen af als `UniqueCode` de **enige** authType is (`authTypes.length === 1`). Check: bestaat er een `unique_codes`-rij met `clientId` + `userId`. Geprivilegieerde rollen passeren altijd. De exchange-gate spiegelt exact dit: alleen `uniquecode_required` bij authTypes `=== ['UniqueCode']` én geen gekoppelde code én geen privileged rol.
- **P2 — Unique codes per user+client opvraagbaar: OPGELOST, kleine toevoeging nodig.** `codeMw.withAll` (`apps/auth-server/middleware/code.js:34-40`) filtert alleen op `clientId` + zoekterm op `code`, níet op `userId`. Taak 4 voegt een `userId`-queryparam-filter toe. Admin-API-routes staan in `apps/auth-server/routes/adminApi.js:112-141` (niet routes.js), beveiligd met `passport.authenticate(['basic', 'oauth2-client-password'])` (`adminApi.js:25`); padconventie is `/api/admin/unique-code...`.
- **P3 — `jwtSecret`: OPGELOST (bevestigd door opdrachtgever).** Staat alleen globaal ingesteld; `exchange` kan elk bron-JWT tegen het globale secret verifiëren.
- **P4 — CORS: OPGELOST, geen wijziging nodig.** `security-headers.js` zet `Access-Control-Allow-Origin` op de request-origin als die in de `allowedDomains` van het project staat (`apps/api-server/src/middleware/security-headers.js:13-25`), met POST/OPTIONS, `Authorization`- en `Content-Type`-headers toegestaan en preflight-afhandeling (`:84-86`). Volgorde klopt: project-middleware (`src/Server.js:154`) draait vóór security-headers (`:156`). Precedent: `connect-user` wordt vandaag al via AJAX vanuit widgets aangeroepen. Enige vereiste: de embed-site moet in de `allowedDomains` van élk gebruikt project staan — dat is nu al zo voor widgets.
- **P5 — `forceNewLogin`-default: BESLIST.** Default uit, per project configureerbaar via `project.config.auth.forceNewLoginOnWidgets` (Taak 2).
- **P6 — Rolbepaling: OPGELOST.** Rollen zijn `user_roles`-rijen per client; `resolveRoleForClient` valt terug op de default-rol als er geen rij is (`apps/auth-server/utils/clientAuth.js:75-94`). De interactieve UniqueCode-login maakt bij eerste login een `UserRole`-rij aan met `client.config.defaultRoleId`, met fallback naar de authType-config (`apps/auth-server/controllers/auth/code.js:111-136`). Het nieuwe uniquecode-login endpoint (Taak 4) repliceert precies dit; de exchange-flow gebruikt dezelfde default-rol-fallback als er geen rol-rij bestaat.

---

## 7. Taken

### Fase 1 — Fundament (fixes die ook standalone waardevol zijn)

#### Taak 1: Project-scoped token handoff

**Files:**

- Modify: `apps/api-server/src/adapter/openstad/router.js:157-168` (digest-login redirect-URL-opbouw)
- Modify: `packages/data-store/src/hooks/use-current-user.js:61-69`
- Create: test in `packages/data-store/src/hooks/use-current-user.test.js`

- [ ] **Stap 1: voeg `openstadprojectid` toe aan de redirect-URL in digest-login**

  In `router.js` waar `openstadlogintoken=[[jwt]]` aan de returnTo-URL wordt geplakt (rond :157-168):

  ```js
  url = `${url}${url.includes('?') ? '&' : '?'}openstadlogintoken=[[jwt]]&openstadprojectid=${req.params.projectId}`;
  ```

- [ ] **Stap 2: consumeer het token alleen voor het eigen project in `use-current-user.js`**

  Vervang het blok rond regel 62-69:

  ```js
  const params = new URLSearchParams(document.location.search);
  const tokenProjectId = params.get('openstadprojectid');
  let jwtFromUrl = params.get('openstadlogintoken');
  // BC: oude redirects zonder openstadprojectid blijven werken
  if (
    jwtFromUrl &&
    tokenProjectId &&
    tokenProjectId !== String(props.projectId)
  ) {
    jwtFromUrl = null;
  }
  if (jwtFromUrl) {
    storage.set('openStadUser', { jwt: jwtFromUrl });
    params.delete('openstadlogintoken');
    params.delete('openstadprojectid');
    history.replaceState(
      null,
      '',
      `${document.location.pathname}?${params.toString()}`
    );
  }
  ```

  Let op: verwijder de params alléén wanneer het token daadwerkelijk geconsumeerd is; een widget van een ander project moet ze laten staan.

- [ ] **Stap 3: unit test**

  Test: twee storage-instanties (projectId 1 en 2), URL met `openstadlogintoken=X&openstadprojectid=2` → alleen namespace 2 krijgt het token; zonder `openstadprojectid` → huidige gedrag.

- [ ] **Stap 4: verifieer**

  Run: `cd packages/data-store && npx vitest run src/hooks/use-current-user.test.js` — groen.

#### Taak 2: `forceNewLogin` configureerbaar maken

**Preconditie:** geen — P5 is beslist: default uit, per project aan te zetten.

**Files:**

- Modify: `apps/api-server/src/routes/widget/widget.js:206-209`

- [ ] **Stap 1: lees de flag uit projectconfig**

  ```js
  const forceNewLogin = project.config?.auth?.forceNewLoginOnWidgets
    ? '&forceNewLogin=1'
    : '';
  const loginUrl = `${config.url}/auth/project/${project.id}/login?useAuth=default${forceNewLogin}&redirectUri=[[REDIRECT_URI]]`;
  const loginAnonymousUrl = `${config.url}/auth/project/${project.id}/login?useAuth=anonymous${forceNewLogin}&redirectUri=[[REDIRECT_URI]]`;
  ```

- [ ] **Stap 2: unit test** in `apps/api-server` op `getDefaultConfig`-output met/zonder de config-flag.

- [ ] **Stap 3: verifieer**

  Run: `npm run test:unit:api` — groen. Browser: widgetbundel opvragen (`/widget/...`) en controleren dat `forceNewLogin` afwezig is zonder flag.

#### Taak 3: JWT-hardening (pending-tokens + projectId-claim)

**Files:**

- Modify: `apps/api-server/src/adapter/openstad/router.js:403-429` en `:62-67` (JWT-mint plekken)
- Modify: `apps/api-server/src/middleware/user.js:118-134` (`parseJwt`)

- [ ] **Stap 1: voeg `projectId` toe aan geminte JWT's**

  Op beide mint-plekken: `jwt.sign({ userId, authProvider, projectId: parseInt(req.params.projectId, 10) }, ...)`.

- [ ] **Stap 2: weiger `pending`-tokens in de algemene middleware**

  In `parseJwt` (`user.js:118-134`):

  ```js
  const claims = jwt.verify(token, config.auth['jwtSecret']);
  if (claims.pending)
    throw new Error('Pending auth token not valid for API access');
  return claims;
  ```

- [ ] **Stap 3: géén harde `projectId === req.project.id`-afwijzing**

  De bestaande cross-project admin-fallback (`user.js:175-196`) moet blijven werken; de claim is nu alleen defense-in-depth/observability. Documenteer dit met een comment bij de claim-extractie (`user.js:92-94`).

- [ ] **Stap 4: verifieer** — `npm run test:unit:api` groen; handmatig: bestaand token zonder claims blijft werken (BC).

### Fase 2 — AJAX-auth-API (backend)

#### Taak 4: auth-server endpoint `POST /api/admin/unique-code-login` + `userId`-filter

**Files:**

- Create: `apps/auth-server/controllers/admin/api/uniqueCodeLogin.js` (+ test)
- Modify: `apps/auth-server/routes/adminApi.js` (registreren naast de bestaande unique-code-routes, `:112-141`)
- Modify: `apps/auth-server/middleware/code.js:34-40` (`userId`-filter in `withAll`)

- [ ] **Stap 1: `userId`-filter toevoegen aan `codeMw.withAll`** (nodig voor de exchange-gate, P2)

  In `middleware/code.js`, na de bestaande `where`-opbouw (`:34-40`):

  ```js
  if (req.query.userId) {
    where.userId = parseInt(req.query.userId, 10);
  }
  ```

- [ ] **Stap 2: controller — spiegel de passport-strategy én de rol-toekenning**

  Codelogica identiek aan de `uniqueCode` TokenStrategy (`apps/auth-server/config/auth.js:87-144`): zoek code op `code` + `clientId` (client komt uit de Basic-auth-context), weiger bij `isUsed`, laad gekoppelde user óf maak lege user aan en koppel (`uniqueCode.userId = user.id`). Rol-toekenning identiek aan de interactieve flow (`controllers/auth/code.js:111-136`): als er nog geen `UserRole`-rij voor deze client is, maak er één met `req.client.config.defaultRoleId`, fallback naar de authType-config (P6). Response: `{ user: { id, ...velden }, role, isNew }`. Bij onbekende/gebruikte code: `404 { error: 'invalid_code' }`.

  ```js
  exports.post = async (req, res, next) => {
    const { code } = req.body;
    const uniqueCode = await db.UniqueCode.findOne({
      where: { code, clientId: req.client.id },
    });
    if (!uniqueCode || uniqueCode.isUsed)
      return res.status(404).json({ error: 'invalid_code' });
    const isNew = !uniqueCode.userId;
    let user = uniqueCode.userId
      ? await db.User.findByPk(uniqueCode.userId)
      : null;
    if (!user) {
      user = await db.User.create({});
      await uniqueCode.update({ userId: user.id });
    }
    // rol-toekenning: zelfde logica als controllers/auth/code.js:111-136
    let userRole = await db.UserRole.findOne({
      where: { userId: user.id, clientId: req.client.id },
    });
    if (!userRole) {
      const defaultRoleId =
        req.client.config.defaultRoleId || authCodeConfig.defaultRoleId;
      userRole = await db.UserRole.create({
        userId: user.id,
        clientId: req.client.id,
        roleId: defaultRoleId,
      });
    }
    const role = await user.getRoleForClient(req.client.id);
    return res.json({ user, role, isNew });
  };
  ```

  (Response-shaping — welke uservelden terug — afstemmen op `controllers/admin/api/user.js:10-24`.)

- [ ] **Stap 3: route registreren** in `routes/adminApi.js`, zelfde middleware-keten als `POST /api/admin/unique-code` (`:128-131`), dus achter `passport.authenticate(['basic', 'oauth2-client-password'])` (`:25`):

  ```js
  app.post(
    '/api/admin/unique-code-login',
    auth,
    adminApiUniqueCodeLoginController.post
  );
  ```

- [ ] **Stap 4: unit tests** — geldige code (nieuw + al gekoppeld), gebruikte code, code van andere client (404), rol-rij aangemaakt met `defaultRoleId`, `withAll` met `userId`-filter.

- [ ] **Stap 5: verifieer** — `npm run test:unit:auth` groen; curl met Basic-auth tegen lokale auth-server (`http://localhost:31430`).

#### Taak 5: api-server — gedeelde helpers (`inline-login.js`): gate-check + user-upsert

**Precondities:** geen — P1, P2 en P6 zijn opgelost (zie §6); Taak 4 (auth-server endpoint + `userId`-filter) moet af zijn.

**Files:**

- Create: `apps/api-server/src/adapter/openstad/inline-login.js`
- Modify: `apps/api-server/src/adapter/openstad/router.js:274-372` (upsert extraheren)
- Modify: `apps/api-server/src/adapter/openstad/service.js` (nieuwe server-to-server calls)

- [ ] **Stap 1: extraheer de user-upsert uit digest-login**

  Verplaats de find-or-create-logica (`router.js:274-372`, keyed op `projectId` + `idpUser.identifier` + `provider`, incl. `canCreateNewUsers`-check) naar `upsertProjectUser({ authConfig, project, userData })` in `inline-login.js`; laat digest-login deze helper aanroepen (gedrag ongewijzigd).

- [ ] **Stap 2: service-calls toevoegen** in `service.js` naast de bestaande Basic-auth admin-calls (`:278-486`):

  ```js
  loginWithUniqueCode: async ({ authConfig, code }) =>
    postJson(`${authConfig.serverUrlInternal}/api/admin/unique-code-login`, { code }, basicAuth(authConfig)),
  fetchUniqueCodesForUser: async ({ authConfig, userId }) =>
    getJson(`${authConfig.serverUrlInternal}/api/admin/unique-codes?userId=${userId}`, basicAuth(authConfig)),
  ```

  (Zelfde http-helper/stijl als `fetchUserData` in `service.js:30-106`.)

- [ ] **Stap 3: gate-check helper**

  `checkClientGates({ authConfig, userData })` → haalt de client op (`service.fetchClient`) en geeft terug:

  ```js
  { ok: true }
  | { ok: false, status: 'uniquecode_required' }           // per P1-beleid
  | { ok: false, status: 'fields_required', missingFields } // requiredUserFields incl. accessCode,
                                                            // per-client privacyConsent/emailNotificationConsent
  ```

  Veldenlijst en per-client-specials spiegelen van `apps/auth-server/middleware/client.js:277-323` en `config/user.js:1-48`.

- [ ] **Stap 4: `mintJwt({ authConfig, userId, role, projectId, pending })`** — wrapper om de bestaande sign-logica (`router.js:403-429`) incl. `sessionDuration.getJwtExpiresInForRole`; bij `pending: true` een korte expiry (15 min) en claim `pending: true`.

- [ ] **Stap 5: unit tests** voor `checkClientGates` (alle drie de uitkomsten) en `upsertProjectUser` (bestaand/nieuw/`canCreateNewUsers=false`).

- [ ] **Stap 6: verifieer** — `npm run test:unit:api` groen; digest-login regressietest (bestaande login-flow in de browser blijft werken).

#### Taak 6: api-server routes `exchange`, `uniquecode-login`, `complete-fields`

**Files:**

- Modify: `apps/api-server/src/adapter/openstad/router.js` (routes registreren)
- Modify: `apps/api-server/src/adapter/openstad/inline-login.js` (handlers)

- [ ] **Stap 1: `POST /auth/project/:projectId/exchange`**

  Body: `{ sourceJwt }`. Handler:
  1. `jwt.verify(sourceJwt, authConfig.jwtSecret)` (P3) → weiger `pending`-claims → laad bron-userrow (`db.User.findByPk(claims.userId)`).
  2. Weiger als bronrol/provider `anonymous` is → `401 { status: 'not_allowed' }`.
  3. Haal actuele userdata op via `service.fetchUserData` met de **target**-clientcredentials (admin-lookup op `idpUser.identifier`).
  4. `checkClientGates(...)`:
     - `uniquecode_required` → `409`.
     - `fields_required` → upsert user (zodat er iets is om aan te vullen), mint `pendingJwt`, → `409 { status, missingFields, labels, pendingJwt }`.
     - `ok` → `upsertProjectUser`, mint JWT → `200 { jwt }`.

- [ ] **Stap 2: `POST /auth/project/:projectId/uniquecode-login`**

  Body: `{ code }`. Handler: `service.loginWithUniqueCode` → bij `invalid_code` `401`; anders userdata → `checkClientGates` (UniqueCode-gate is nu per definitie vervuld) → bij `fields_required` pendingJwt-pad, anders `200 { jwt }`.

- [ ] **Stap 3: `POST /auth/project/:projectId/complete-fields`**

  Body: `{ pendingJwt, fields }`. Handler:
  1. Verifieer `pendingJwt` en eis claim `pending: true`.
  2. Whitelist `fields` tegen de `missingFields` van de client (nooit blind doorsturen).
  3. `accessCode` in fields → eerst valideren via auth-server `POST /api/validation/code` (`apps/auth-server/middleware/access-code.js:35-45`).
  4. `service.updateUser` (Basic admin) met de nieuwe veldwaarden; per-client-velden (`privacyConsent`, `emailNotificationConsent`) volgens het formaat in `middleware/client.js:285-306`.
  5. Her-run `checkClientGates` → `ok` → definitieve JWT `200 { jwt }`; anders opnieuw `409 fields_required` (resterende velden).

- [ ] **Stap 4: rate limiting**

  Strengere limiter op `uniquecode-login` en `complete-fields` (brute force op stemcodes/accesscodes!), naar het patroon van `@openstad-headless/lib/rateLimiter` zoals gebruikt in `apps/api-server/src/routes/notification/*.js` — bijv. 10 requests / 15 min / IP.

- [ ] **Stap 5: routes registreren** in `router.js`, zelfde plek als `connect-user` (`:18`), zodat `useAuth`-provider-resolutie (`src/routes/auth/index.js:16-49`) gewoon werkt.

- [ ] **Stap 6: unit tests** per route: happy path, `uniquecode_required`, `fields_required` → complete-fields → jwt, invalid code, pendingJwt geweigerd als Bearer op reguliere API, anonymous-bron geweigerd.

- [ ] **Stap 7: verifieer** — `npm run test:unit:api` groen + curl-scenario tegen lokale stack:

  ```bash
  # gegeven een geldig project-1 jwt:
  curl -s -X POST http://localhost:31410/auth/project/2/exchange?useAuth=default \
    -H 'Content-Type: application/json' -d '{"sourceJwt":"<jwt1>"}'
  # verwacht: 200 {jwt} of 409 {status:...}
  ```

### Fase 3 — Frontend

#### Taak 7: `packages/lib/auth-broker.ts`

**Files:** Create `packages/lib/auth-broker.ts` (+ test), modify export-barrel van `packages/lib`.

- [ ] **Stap 1: implementatie**

  ```ts
  const KEY = 'openstad';

  export type KnownIdentity = { projectId: string; jwt: string };

  export function getKnownIdentities(
    excludeProjectId?: string | number
  ): KnownIdentity[] {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || '{}');
      return Object.entries(data)
        .filter(
          ([pid, v]: [string, any]) =>
            v?.openStadUser?.jwt && pid !== String(excludeProjectId)
        )
        .map(([projectId, v]: [string, any]) => ({
          projectId,
          jwt: v.openStadUser.jwt,
        }));
    } catch {
      return [];
    }
  }

  export function notifyAuthChange() {
    window.dispatchEvent(new CustomEvent('osc-auth-changed'));
  }

  export function onAuthChange(cb: () => void): () => void {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) cb();
    };
    window.addEventListener('osc-auth-changed', cb);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('osc-auth-changed', cb);
      window.removeEventListener('storage', onStorage);
    };
  }
  ```

  (`storage`-event dekt andere tabs; het CustomEvent dekt widgets op dezelfde pagina.)

- [ ] **Stap 2: unit tests** — identities lezen incl. exclude, corrupte JSON → `[]`, event-subscribe/unsubscribe.

- [ ] **Stap 3: verifieer** — `cd packages/lib && npx vitest run auth-broker.test.ts`.

#### Taak 8: data-store — API-calls + auth-state live bijwerken

**Files:**

- Modify: `packages/data-store/src/api/user.js`
- Modify: `packages/data-store/src/hooks/use-current-user.js`

- [ ] **Stap 1: API-calls toevoegen** in `api/user.js` (naast `fetchMe`/`connectUser`/`logout`):

  ```js
  exchangeLogin: async function ({ projectId }, sourceJwt) {
    return this.fetchRaw(`/auth/project/${projectId}/exchange?useAuth=default`,
      { method: 'POST', body: JSON.stringify({ sourceJwt }) });
  },
  loginWithUniqueCode: async function ({ projectId }, code) { /* idem, body {code} */ },
  completeFields: async function ({ projectId }, pendingJwt, fields) { /* idem */ },
  ```

  Let op: `doFetch` (`api/fetch.js:63-141`) gooit bij non-2xx. Voeg een `fetchRaw`-variant toe (of optie `allowStatuses: [401, 409]`) die de JSON-body van 401/409 teruggeeft in plaats van een `OpenStadRequestError` te dispatchen — de 409's zijn hier normale flow, geen fout.

- [ ] **Stap 2: state-update helper in `use-current-user.js`**

  ```js
  async function applyJwt(jwt) {
    storage.set('openStadUser', { jwt });
    self.api.currentUserJWT = jwt;
    notifyAuthChange();
    await mutate({ type: 'current-user', projectId: props.projectId }); // SWR revalidate → fetchMe
  }
  ```

  En: subscribe via `onAuthChange` zodat een login door widget X ook widget Y (zelfde project, andere widget-instantie) live bijwerkt.

- [ ] **Stap 3: unit tests** — `applyJwt` zet storage + JWT + triggert mutate; 409-responses komen als data terug, niet als exception.

- [ ] **Stap 4: verifieer** — `cd packages/data-store && npx vitest run`.

#### Taak 9: `packages/ui` — `LoginDialog`

**Files:** Create `packages/ui/src/login-dialog/index.tsx` + `index.css` (+ test), modify `packages/ui/src/index.tsx`.

- [ ] **Stap 1: component op basis van bestaande `Dialog`** (`packages/ui/src/dialog/index.tsx`)

  Props:

  ```ts
  type LoginDialogProps = {
    open: boolean;
    onOpenChange(open: boolean): void;
    step: 'uniquecode' | 'fields';
    missingFields?: Array<{
      key: string;
      label: string;
      type: 'text' | 'checkbox';
    }>;
    labels?: Record<string, string>; // per-project copy uit clientconfig
    error?: string;
    busy?: boolean;
    onSubmitCode(code: string): void;
    onSubmitFields(values: Record<string, string | boolean>): void;
  };
  ```

  WCAG-eisen (checklist in de test): elk input met `<label htmlFor>`, fout via `role="alert"` + `aria-describedby`, focus in dialog (Radix regelt trap/restore), submit met Enter, verplichte velden `aria-required`, zichtbare focus-stijl, teksten via props (vertaalbaar).

- [ ] **Stap 2: veldtypes** — `accessCode`/tekstvelden als text-input; `privacyConsent`/`emailNotificationConsent` als checkbox met linkbare label-copy (zelfde injectie als `controllers/auth/required.js:4-93` doet met de privacy-URL).

- [ ] **Stap 3: unit tests** (vitest + testing-library): rendert stemcode-stap, submit callback, foutmelding met `role="alert"`, velden-stap rendert `missingFields`.

- [ ] **Stap 4: verifieer** — `cd packages/ui && npx vitest run src/login-dialog`.

#### Taak 10: `useLoginFlow` hook (data-store)

**Files:** Create `packages/data-store/src/hooks/use-login-flow.js` (+ test), modify `packages/data-store/src/index.js` (binden zoals `useCurrentUser` op `index.js:47`).

- [ ] **Stap 1: implementatie**

  De hook levert `{ requireLogin, dialogProps }`. `requireLogin()` retourneert een Promise die resolvet met de ingelogde user of `null` (geannuleerd):
  1. Al ingelogd (`currentUser.id`)? → resolve.
  2. `getKnownIdentities(props.projectId)` → probeer per identiteit `exchangeLogin`:
     - `200 {jwt}` → `applyJwt` → resolve.
     - `409 uniquecode_required` → open dialog, stap `uniquecode`; na submit `loginWithUniqueCode(code)`; bij `409 fields_required` door naar velden-stap; bij `200` → `applyJwt` → resolve.
     - `409 fields_required` → open dialog, stap `fields` met `missingFields`; na submit `completeFields(pendingJwt, values)` → `200` → resolve; nieuwe `409` → resterende velden tonen.
     - `401` → volgende identiteit proberen.
  3. Geen identiteiten → fallback: `props.login.url` redirect (huidig gedrag; popup-variant komt in Taak 12).
  4. Dialog gesloten door gebruiker → resolve `null`.

- [ ] **Stap 2: unit tests** — mock API: direct-exchange-pad, stemcode-pad, velden-pad, stemcode→velden-keten, annuleren, geen identiteiten → geen dialog.

- [ ] **Stap 3: verifieer** — `cd packages/data-store && npx vitest run src/hooks/use-login-flow.test.js`.

#### Taak 11: integratie in `likes` en `stem-begroot`

**Files:**

- Modify: `packages/likes/src/likes.tsx:125-136`
- Modify: `packages/stem-begroot/src/stem-begroot.tsx:1354-1355` en `packages/stem-begroot/src/step-3/index.tsx:41-96`

- [ ] **Stap 1: likes** — vervang in de `!hasRole(...)`-branch de redirect:

  ```tsx
  const { requireLogin, dialogProps } = datastore.useLoginFlow({ ...props });
  // in doVote():
  if (!hasRole(currentUser, props.votes.requiredUserRole)) {
    const user = await requireLogin();
    if (!user) return; // geannuleerd
  }
  // render: <LoginDialog {...dialogProps} />
  ```

  De bestaande pending-vote-stash (`storage.set('osc-resource-vote-pending', ...)`, `likes.tsx:135`) blijft nodig voor de redirect-fallback, maar bij een geslaagde inline login wordt de stem direct uitgevoerd — geen reload, dus geen stash.

- [ ] **Stap 2: stem-begroot** — zelfde patroon op de submit-gate (`stem-begroot.tsx:1354-1355`) en in `step-3/index.tsx:44,95`. De post-login resume-flow (`stem-begroot.tsx:1438`) blijft intact voor de redirect-fallback.

- [ ] **Stap 3: `npm run build`** in beide packages (vereist voor admin-preview, zie CLAUDE.md).

- [ ] **Stap 4: verifieer (browser)** — testpagina met likes-widget van project 1 en stem-begroot-widget van project 2 (UniqueCode actief): log in via project 1; klik stem in project 2 → dialog vraagt stemcode → invullen → stem geregistreerd zonder page refresh; beide widgets tonen ingelogde staat.

- [ ] **Stap 5 (vervolg, apart in te plannen):** zelfde integratie voor `enquete`, `resource-form`, `comments`, `choiceguide`, `document-map`, `distribution-module`, `account`, `simple-voting`. Elk: `hasRole`-branch → `requireLogin` + `<LoginDialog>`.

### Fase 4 — Initiële login zonder refresh (popup-fallback) + admin

#### Taak 12: popup-login voor initiële login (geen identiteit bekend)

**Files:**

- Create: `apps/api-server/src/adapter/openstad/popup-callback.js` (mini-HTML-response), route in `router.js`
- Modify: `packages/data-store/src/hooks/use-login-flow.js` (fallback-stap 3)

- [ ] **Stap 1: callback-route `GET /auth/project/:projectId/popup-callback`**

  Digest-login redirect met `redirectUri` naar deze route (+ `origin`-param, gevalideerd via `isRedirectAllowed` — `apps/api-server/src/services/isRedirectAllowed.js`). Response is een kale HTML-pagina:

  ```html
  <script>
    window.opener &&
      window.opener.postMessage(
        {
          type: 'openstad-login',
          projectId: '<%= projectId %>',
          jwt: '<%= jwt %>',
        },
        '<%= validatedOrigin %>'
      );
    window.close();
  </script>
  ```

  **Nooit** `'*'` als target origin; alleen de gevalideerde origin.

- [ ] **Stap 2: frontend** — in `useLoginFlow`-fallback: `window.open(loginUrl + popupParams, 'osc-login', 'width=480,height=640')`; luister op `message` (check `event.origin` tegen de API-url en `event.data.projectId`); bij ontvangst `applyJwt(jwt)`. Popup geblokkeerd (`window.open` → null) → redirect-fallback.

  Dit werkt óók als stille SSO: bestaat er al een auth-server-sessie (bijv. admin ingelogd, of gebruiker eerder via Url ingelogd), dan flitst de popup alleen even en sluit direct — top-level navigatie, dus de `SameSite=Lax` sessiecookie gaat gewoon mee.

- [ ] **Stap 3: unit tests** — origin-validatie van de callback (afgewezen origin → geen script met token), message-handler negeert verkeerde origin/projectId.

- [ ] **Stap 4: verifieer (browser)** — uitgelogde staat, klik login → popup → inloggen → popup sluit, widget is ingelogd zonder refresh.

#### Taak 13: admin overal ingelogd — verificatie + kleine gaten

**Files:** geen wijziging voorzien; alleen verificatie en zo nodig follow-up.

- [ ] **Stap 1: verifieer API-niveau** — admin-JWT (project 1) op `GET /auth/project/2/me`: werkt via de superuser-elevatie (`apps/api-server/src/middleware/user.js:175-254`). Curl-check.
- [ ] **Stap 2: verifieer widget-preview in admin** — blijft werken via `globalOpenStadUser`-injectie (`apps/admin-server/src/components/widget-preview.tsx:17-31`), pickup in `use-current-user.js:46-49`.
- [ ] **Stap 3: verifieer embed-site-scenario** — admin logt in op admin-server (auth-server-sessie ontstaat, project 1); open embed-site met widgets van project 2 en 3; klik login → popup-SSO (Taak 12) logt direct in zonder prompt (auth-server-sessie bestaat, admin voldoet aan gates). Vervolgens dekken exchange-calls de overige widgets op de pagina.
- [ ] **Stap 4: documenteer beperking** — volledig automatisch (nul kliks) inloggen op een extern domein kan niet betrouwbaar door third-party-cookie-blokkering; één klik (popup) is het maximum. Vastleggen in de docs van Taak 15.

### Fase 5 — Afronding

#### Taak 14: E2E-tests

**Files:** Create spec in `apps/admin-server/cypress/e2e/` (bestaande Cypress-setup).

- [ ] **Stap 1:** E2E-scenario "multi-project pagina": twee widgets, login project A, inline stemcode-login project B, assert beide ingelogd + geen page reload (`cy.window()`-referentie blijft gelijk).
- [ ] **Stap 2:** E2E-scenario requiredFields: project B vereist adres → dialog toont adres-veld → submit → ingelogd.
- [ ] **Stap 3: verifieer** — `npm run test:e2e` groen.

#### Taak 15: documentatie

- [ ] **Stap 1:** beschrijf de nieuwe endpoints (request/response-contract, rate limits) en de `forceNewLoginOnWidgets`-flag in de bestaande docs-structuur van de repo.
- [ ] **Stap 2:** beschrijf de beperking uit Taak 13 stap 4 en het beleid uit §4 (wanneer stille exchange wel/niet mag).

---

## 8. Validatiechecklist (gates)

**CLI:**

- `npm run test:unit:api` — groen (nieuwe inline-login tests + regressie digest-login)
- `npm run test:unit:auth` — groen (uniquecode-login endpoint)
- `cd packages/lib && npx vitest run` / idem `packages/data-store`, `packages/ui`
- Curl-scenario uit Taak 6 stap 7 (exchange 200/409-contract)
- Curl: pendingJwt als Bearer op `GET /api/project/2/resource` → 401

**Browser (docker-stack draaiend):**

- Testpagina met widgets van 2 projecten: login A → inline stemcode-login B → beide ingelogd, geen reload
- requiredFields-dialog (project met adres verplicht) → na invullen direct ingelogd
- accessCode als required field → dialog vraagt code → foute code toont fout, goede code logt in
- Uitgelogd + popup-login (Taak 12): popup sluit, widget ingelogd
- Admin-scenario (Taak 13 stap 3)
- Regressie: single-project site met bestaande redirect-login werkt ongewijzigd
- Toegankelijkheid dialog: volledige flow met alleen toetsenbord; focus komt terug op de triggerende knop; screenreader-labels aanwezig (axe-check op de dialog)

---

## 9. Rollback

- **Geen databasemigraties** — rollback is puur code terugdraaien.
- Fase 1 (Taak 1-3) is los terugdraaibaar; `openstadprojectid` en de `projectId`-claim zijn additief (oude clients negeren ze).
- Nieuwe endpoints (Taak 4-6) zijn additief; uitzetten = routes deregistreren. Frontend valt dan automatisch terug op redirect (fallback-pad in `useLoginFlow`).
- Widget-integraties (Taak 11) per package terug te draaien; de redirect-code blijft als fallback aanwezig.
- Aandachtspunt: eenmaal uitgegeven JWT's met `projectId`-claim blijven geldig tot expiry — geen actie nodig, claims worden alleen gelezen.
- `forceNewLoginOnWidgets`: bij problemen op gedeelde computers per project weer aanzetten via projectconfig (geen deploy nodig).

---

## 10. Risico's en aandachtspunten

- **Brute force op stemcodes** via het nieuwe AJAX-endpoint: gemitigeerd met strikte rate limiting (Taak 6 stap 4); overweeg aanvullend een per-project teller/lockout als follow-up.
- **Gate-logica op twee plekken** (auth-server redirect-flow én api-server AJAX-flow): drift-risico. Mitigatie: gate-helper in één module (`inline-login.js`) met tests die de veldenlijst uit `config/user.js` spiegelen; documenteer de spiegelrelatie in beide bestanden.
- **`forceNewLogin`-default wijzigen** raakt stembureau-achtige scenario's (P5) — bewust als aparte, per project configureerbare stap.
- **pendingJwt-lek**: een pending token mag nergens als login werken — afgedekt in Taak 3 stap 2 + expliciete test.
- **Meerdere identiteiten in de browser** (bijv. via stemcode van iemand anders ingelogd in project X): `exchange` probeert identiteiten in volgorde; anonieme en niet-passende identiteiten worden overgeslagen. UX-keuze (welke identiteit wint) is triviaal zolang er in de praktijk één echte identiteit is; documenteren in Taak 15.
- **postMessage-beveiliging** (Taak 12): target origin altijd gevalideerd, message-handler checkt origin — expliciet getest.

---

## 11. Self-review (plan-builder checklist)

- [x] Elke stap verwijst naar een echt bestand of symbool uit de evidence
- [x] Geen vage werkwoorden zonder concreet doel (gate-semantiek die nog onbekend is, staat als preconditie P1, niet als vage stap)
- [x] Alle onbekenden staan als expliciete precondities (P1-P6), niet in de planbody
- [x] Validatie-gates zijn concrete commando's of browseracties (§8)
- [x] Scope verrekent bestaand werk (SSO-sessie, per-project storage, superuser-elevatie, connect-user-patroon worden hergebruikt, niet opnieuw gebouwd)
- [x] Stappen zijn bite-sized, één actie per stap
- [x] Codeblokken aanwezig bij elke stap die code wijzigt (waar het ontwerp nog van een preconditie afhangt, is de stap als contract + verwijzing beschreven)
