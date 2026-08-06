# Plan: Multi-project login (tegelijk ingelogd zijn in meerdere projecten)

> Status: **gereed voor uitvoering — review van 2026-07-07 verwerkt (alle CRITICAL/HIGH/MEDIUM/LOW-punten en extra taken A-D)**
> Formaat: volledig (multi-app, architectureel)
> Scope-bron: deep-search over auth-server, api-server, widget-packages en admin-server (juli 2026); plan-review 2026-07-07

---

## 1. Scope en constraints

**Doel:** op één website kunnen widgets van verschillende projecten draaien; een gebruiker moet in meerdere projecten tegelijk ingelogd kunnen zijn. Concreet:

1. Ingelogd in project A (bijv. via Url-loginmethode) → widget van project B met **UniqueCode** actief vraagt op het interactiemoment (bijv. stemmen) via een **popup in de widget** om de stemcode en logt **via AJAX** in, zonder page refresh, mét update van de auth-state.
2. Ontbrekende **requiredUserFields** voor project B (bijv. adres, waar project A alleen postcode vereiste) worden op dezelfde manier via een popup uitgevraagd. Zelfde mechanisme voor **accessCode** als required field.
3. **Admin**: na inloggen op de admin-server met een admin-account moet de admin op alle projecten en hun widgets ingelogd (kunnen) zijn.

**Buiten scope:** SSO / externe providers (oidc-adapter, `apps/api-server/src/adapter/oidc/`) — expliciet uitgesloten door de opdrachtgever. DigiD bestaat niet (uitgecommentarieerd in `apps/auth-server/config/auth.js:107-116`). CMS `connect-user`-flow blijft ongewijzigd. **Let op (kernteam-Q&A):** externe SSO-gebruikers worden vandaag per project als aparte user aangemaakt (upsert keyed op `projectId` + `idpUser.identifier` + `provider`, geen match op e-mail; `apps/api-server/src/adapter/oidc/router.js:32-55,227-278`) en dus níet samengevoegd met een bestaande OpenStad-gebruiker. Cross-SSO-identiteiten samenvoegen is een taak voor de latere SSO-plugin, niet voor dit plan; de exchange-broker (§4) is provider-neutraal en kan daar later op aanhaken.

**Opt-in via env-flag:** de hele uitbreiding staat standaard **uit** en wordt geactiveerd met `MULTI_PROJECT_LOGIN=1` (env-var, te zetten op api-server én auth-server):

- **api-server**: de nieuwe routes (`exchange`, `uniquecode-login`, `complete-fields`, `popup-callback`) worden alleen geregistreerd als de flag aan staat, en de flag wordt meegegeven in de widget-config zodat `useLoginFlow` zonder flag direct het bestaande redirect-pad kiest (geen kansloze AJAX-calls).
- **auth-server**: het nieuwe admin-endpoint (Taak 5) en de per-project logout (Taak 8) staan alleen aan mét de flag; zonder flag blijft logout `session.destroy()` (huidig gedrag).
- **Buiten de flag** (altijd actief, ook zonder flag): de pure security-fixes — JWT-hardening (Taak 3), sessie-hardening (Taak 4) en de project-scoped token-pickup (Taak 1, BC-veilig). Dat zijn gedragsneutrale verbeteringen voor legitieme flows, geen featuregedrag.
- Zonder flag is het functionele gedrag gelijk aan vandaag; uitzetten van de flag = functionele rollback zonder deploy van code.

**Betrokken apps/packages:**

| App/package                               | Rol in dit plan                                                                          |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| `apps/auth-server`                        | Nieuw admin-API endpoint (uniquecode-login), lockout-migratie, sessie-hardening, per-project logout |
| `apps/api-server`                         | Nieuwe AJAX-auth-endpoints, project-scoped token handoff, JWT-hardening                  |
| `apps/cms-server`                         | `projectId` meegeven aan `globalOpenStadUser`                                            |
| `packages/lib`                            | Auth-broker (cross-project identity-index)                                               |
| `packages/data-store`                     | Nieuwe API-calls, project-scoped token pickup, login-flow hook, seed-namespacing         |
| `packages/ui`                             | `LoginDialog` component (WCAG)                                                           |
| `packages/likes`, `packages/stem-begroot` | Eerste integraties (rest volgt)                                                          |
| `apps/admin-server`                       | Verificatie widget-preview; optioneel `projectId` op `globalOpenStadUser`                |

---

## 2. Huidige situatie (evidence-samenvatting)

De kern-ontdekking: **de auth-server is al een SSO-server** en de widget-opslag is **al per project genamespaced**. Het probleem zit in een handvol plekken:

### Wat al werkt

- **Auth-server sessie is gedeeld over alle clients** (SSO): één `express-session` (MySQL-store, cookie `openstad-authorization.sid`, `apps/auth-server/app-init.js:90-121`); passport serialiseert alleen `user.id` (`apps/auth-server/auth.js:272-283`). Per-client context (authType, 2FA, rol) zit in `session.clientAuth[client.id]` (`utils/clientAuth.js:18-55`).
- **Users zijn globaal** op de auth-server (`model/user.js`, geen clientId); rollen per client via `user_roles` (`model/user-role.js`); **unique codes zijn per client** (`model/unique~code.js` — let op de tilde in de bestandsnaam: `code`, `clientId`, `userId` nullable).
- **Per-client gates** op `/dialog/authorize`: `checkRequiredUserFields`, `check2FA`, `checkPhonenumberAuth`, `checkUniqueCodeAuth` (`apps/auth-server/middleware/client.js:203-323`, routes `routes/routes.js:451-464`).
- **Widget-opslag is per project**: localStorage key `openstad` → `data[projectId].openStadUser` (`packages/lib/local-storage.ts:20-24`). JWT gaat als `Authorization: Bearer` mee (`packages/data-store/src/api/fetch.js:77-79`).
- **Api-server superuser-elevatie**: een admin op `config.admin.projectId` wordt runtime `superuser` voor elk project, gekoppeld via `idpUser.identifier` (`apps/api-server/src/middleware/user.js:142-269`). Een admin-JWT werkt dus op API-niveau al cross-project.
- **Er is al een AJAX-loginpad als voorbeeldpatroon**: `connect-user` (`apps/api-server/src/adapter/openstad/router.js:18-81`) accepteert JSON en geeft `{ jwt }` terug.
- **Popup-bouwsteen bestaat**: Radix `Dialog` in `packages/ui/src/dialog/index.tsx`.

### Wat multi-project login nu blokkeert

1. **`forceNewLogin=1` staat hard in de standaard widget-login-URL** (`apps/api-server/src/routes/widget/widget.js:207`). Elke widget-login redirect daardoor eerst naar de auth-server-logout (force-logout-tak in de login-handler, `adapter/openstad/router.js:88-119`; de eigenlijke logout-route zit op `:437-486`) en **vernietigt daarmee de SSO-sessie** — de gedeelde sessie die multi-project juist mogelijk maakt.
2. **`openstadlogintoken`-pickup is niet project-scoped**: elke widget op de pagina consumeert het token uit de URL, ongeacht voor welk project het gemunt is (`packages/data-store/src/hooks/use-current-user.js:62-69`). Op een multi-project pagina slaat widget B het JWT van project A op in zijn eigen namespace → kapotte state.
3. **`globalOpenStadUser` is page-breed, niet project-scoped**: elke widget seedt zijn current user uit één JS-global (`use-current-user.js:48,95-97`), gezet vanuit één projectsessie (CMS: `apps/cms-server/modules/openstad-auth/index.js:102`; admin-preview: `apps/admin-server/src/components/widget-preview.tsx:25`). Op een multi-project pagina stuurt widget B zo de JWT van project A als Bearer naar B's API.
4. **Er is geen AJAX-pad voor UniqueCode, requiredFields of accessCode**: die zitten alleen achter server-rendered schermen op de auth-server (`controllers/auth/code.js`, `controllers/auth/required.js`), bereikbaar via full-page redirect.
5. **Geen gedeelde "require login"-abstractie**: elke widget dupliceert `hasRole(...)` + `document.location.href = loginUrl` (o.a. `packages/likes/src/likes.tsx:125-136`, `packages/stem-begroot/src/stem-begroot.tsx:1354-1355`).
6. **Logout is globaal**: uitloggen bij één client doet `req.session.destroy()` (`apps/auth-server/controllers/auth/local.js:186-200`) en sloopt daarmee de gedeelde SSO-sessie van álle projecten. De widget-logout redirect naar exact deze flow (`adapter/openstad/router.js:451-481`).
7. **Cookie-realiteit**: de auth-server sessiecookie is `SameSite=Lax` — die gaat **niet** mee in cross-site iframes/AJAX, wél bij top-level navigatie (redirect of popup-venster). Stil inloggen via hidden iframe is dus geen optie; token-uitwisseling moet via de api-server lopen (server-to-server) of via een popup-venster.

---

## 3. Strawman vs. Steelman

### Strawman — "popup-venster naar bestaande schermen"

Verwijder `forceNewLogin=1`, maak token-pickup project-scoped, en open de bestaande auth-server loginschermen in een `window.open()` popup die het token via `postMessage` terugstuurt. Geen nieuwe endpoints.

- ✅ Minimale backendwijziging; hergebruikt álle gates (incl. 2FA) exact.
- ❌ Niet de gevraagde UX: geen in-widget popup, geen AJAX; auth-server-styling in een los venster; popup-blockers; stemcode/velden-invoer buiten de widgetcontext.
- ❌ requiredFields-uitvraag blijft een compleet servergerenderd formulier i.p.v. gerichte vraag op het interactiemoment.

### Steelman — "AJAX-auth-API + broker + in-widget dialog"

Nieuwe JSON-endpoints op de api-server (uniquecode-login, exchange, complete-fields) die server-to-server met de auth-server praten (Basic client auth — cookies zijn dan irrelevant), een cross-project identity-broker in de frontend, en een herbruikbare `LoginDialog`. Popup-venster als fallback voor _initiële_ logins (Url/Local vereisen nu eenmaal e-mail-roundtrip of wachtwoordscherm) én voor gates die inline niet veilig te reproduceren zijn (2FA, telefoonbevestiging).

- ✅ Exact de gevraagde UX: stemcode/velden-popup op het interactiemoment, AJAX, geen refresh, auth-state live bijgewerkt.
- ✅ Omzeilt third-party-cookie-problematiek volledig voor de exchange-flows.
- ❌ Meer werk: nieuwe endpoints, gate-logica gespiegeld op de api-server, hardening (rate limiting + lockout, pending-tokens).

### Keuze: **Steelman, met de popup uit de strawman als fallback** (hybride)

De AJAX-flows dekken de kerncase (identiteit bestaat al ergens → alleen aanvullende credential/velden nodig). De popup-fallback dekt (a) de initiële login op een pagina waar nog géén enkele identiteit bekend is, en (b) 2FA- en telefoonbevestiging-flows die sessie-gebonden zijn en dus niet stateless via exchange kunnen. De volledige redirect blijft als laatste fallback bestaan (backwards compatible).

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
│        │                 6. → 200 {jwt} → storage + refresh, geen reload     │
│        │                 (409 two_factor_required / phonenumber_required     │
│        │                  → popup/redirect naar de echte auth-server-flow)   │
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
409 { status: 'two_factor_required' }                      → géén stille exchange; popup/redirect
409 { status: 'phonenumber_required' }                     → géén stille exchange; popup/redirect
401 { status: 'invalid_code' | 'invalid_token' | 'not_allowed' }
429 { status: 'too_many_attempts' }                        → lockout actief
```

`pendingJwt` is een kortlevend JWT met claim `pending: true` dat **uitsluitend** door `complete-fields` geaccepteerd wordt en door de reguliere auth-middleware als geen-auth (anoniem) wordt behandeld.

**Beleidsregel voor stille exchange (spiegelt álle vier de auth-server gates — `routes/routes.js:457-460` draait ze in serie: `checkRequiredUserFields`, `check2FA`, `checkPhonenumberAuth`, `checkUniqueCodeAuth`):**

- Target-client heeft `UniqueCode` als **enige** authType (`authTypes.length === 1`) en de gebruiker heeft voor die client geen gekoppelde `unique_codes`-rij én geen geprivilegieerde rol → `uniquecode_required` (spiegelt `apps/auth-server/middleware/client.js:152-193`).
- `requiredUserFields` van de target-client onvolledig (incl. per-client velden `privacyConsent`/`emailNotificationConsent` en `accessCode`) → `fields_required`.
- Target-client heeft `Phonenumber` in `authTypes` en de gebruiker heeft geen `phoneNumberConfirmed` én geen geprivilegieerde rol → `phonenumber_required` (spiegelt `client.js:195-221`). Telefoonbevestiging vereist de SMS-flow op de auth-server; niet inline op te lossen.
- De rol van de gebruiker op de target-client valt onder `twoFactorRoles` → `two_factor_required`. **Harde uitzondering op stille exchange:** 2FA-validiteit is sessie-gebonden (`req.currentClientAuth.twoFactorValid`, `client.js:226-263`) en stateless niet te reproduceren; exchange mag hiervoor nooit stil een JWT minten. De frontend forceert de popup/redirect naar `/dialog/authorize`, waar de echte 2FA-flow draait.
- Bron-identiteit is `anonymous` → exchange geweigerd (`not_allowed`); anonieme users hebben geen overdraagbare identiteit.
- Alles vervuld → direct `{ jwt }`.

---

## 5. Bestandenkaart

**Nieuw:**

| Bestand                                                          | Verantwoordelijkheid                                                                                               |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `apps/api-server/src/adapter/openstad/inline-login.js`           | Route-handlers voor `uniquecode-login`, `exchange`, `complete-fields` + gedeelde gate-check en user-upsert helpers |
| `apps/api-server/src/adapter/openstad/inline-login.test.js`      | Unit tests (jest — apps/api-server draait jest, niet vitest)                                                       |
| `apps/auth-server/controllers/admin/api/uniqueCodeLogin.js`      | Admin-API: code → user (logica gespiegeld van de passport-strategy)                                                |
| `apps/auth-server/controllers/admin/api/uniqueCodeLogin.test.js` | Unit tests (jest)                                                                                                  |
| `apps/auth-server/migrations/010-add-login-attempts.js`          | Additieve migratie: teller-tabel voor uniquecode-lockout                                                           |
| `packages/lib/auth-broker.ts`                                    | Cross-project identity-index + change-events                                                                      |
| `packages/lib/auth-broker.test.ts`                               | Unit tests (vitest)                                                                                                |
| `packages/data-store/src/hooks/use-login-flow.js`                | Orchestratie: exchange → dialogstappen → state-update                                                              |
| `packages/data-store/src/hooks/use-login-flow.test.js`           | Unit tests (vitest)                                                                                                |
| `packages/ui/src/login-dialog/index.tsx` (+ `index.css`)         | Toegankelijke dialog met stappen: stemcode / velden / accesscode                                                   |
| `packages/ui/src/login-dialog/login-dialog.test.tsx`             | Unit tests (vitest)                                                                                                |
| `apps/api-server/src/adapter/openstad/popup-callback.js`         | Popup-callback (postMessage-handoff)                                                                               |
| `cypress/e2e/multi-project-login.cy.js`                          | E2E-spec (root-level Cypress-setup; `apps/admin-server/cypress/` bestaat niet)                                     |

**Gewijzigd:**

| Bestand                                                               | Wijziging                                                                                                                    |
| --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `apps/api-server/src/adapter/openstad/router.js`                      | `openstadprojectid` in redirect (digest-login :157-168); routes registreren; upsert-logica (:274-372) extraheren naar helper |
| `apps/api-server/src/adapter/openstad/service.js`                     | `loginWithUniqueCode()`, `fetchUniqueCodesForUser()` (server-to-server)                                                      |
| `apps/api-server/src/middleware/user.js`                              | `pending`-tokens afvangen in `parseAuthHeader`; optionele `projectId`-claim-check                                            |
| `apps/api-server/src/util/auth-settings.js`                           | Startup-assertie: per-project `jwtSecret`-override luid laten falen                                                          |
| `apps/api-server/src/routes/widget/widget.js:207`                     | `forceNewLogin` configureerbaar i.p.v. hardcoded `1`                                                                         |
| `apps/auth-server/routes/adminApi.js`                                 | Route voor `POST /api/admin/unique-code-login`                                                                               |
| `apps/auth-server/middleware/code.js:34-40`                           | `userId`-queryparam-filter in `withAll`                                                                                      |
| `apps/auth-server/middleware/client.js:228-229`                       | Inerte globale `req.session?.twoFactorValid`-fallback verwijderen (2FA-bypass-footgun)                                       |
| `apps/auth-server/controllers/auth/local.js:186-200`                  | Per-project logout i.p.v. `session.destroy()`                                                                                |
| Auth-server login-succespaden (o.a. `controllers/auth/*.js`)          | `req.session.regenerate()` rond login (session fixation)                                                                     |
| `apps/cms-server/modules/openstad-auth/index.js:102`                  | `projectId` meegeven op `globalOpenStadUser`                                                                                 |
| `apps/cms-server/app.js:495-498`                                      | `forceNewLogin` in CMS-login-URL configureerbaar (Taak 15b, cross-site logout)                                              |
| `apps/admin-server/src/components/widget-preview.tsx:25`              | Idem (optioneel; zie Taak 1 stap 4)                                                                                          |
| `packages/lib/index.ts` (of bestaande export-barrel)                  | Export `auth-broker`                                                                                                         |
| `packages/data-store/src/api/user.js`                                 | `exchangeLogin`, `loginWithUniqueCode`, `completeFields` API-calls                                                           |
| `packages/data-store/src/api/resources.js:2-3,15-19`                  | `pseudoRandomSortSeed` per project namespacen                                                                                |
| `packages/data-store/src/hooks/use-current-user.js`                   | Project-scoped token-pickup én global-user-pickup; `notifyAuthChange` na login/logout; luisteren op broker-events            |
| `packages/data-store/src/index.js`                                    | `useLoginFlow` binden                                                                                                        |
| `packages/ui/src/index.tsx`                                           | Export `LoginDialog`                                                                                                         |
| `packages/likes/src/likes.tsx:125-136`                                | Redirect vervangen door `useLoginFlow` (+ `isBusy`-reset via try/finally)                                                    |
| `packages/stem-begroot/src/stem-begroot.tsx` + `src/step-3/index.tsx` | Idem                                                                                                                         |

**Migraties:** één kleine additieve migratie op de auth-server (lockout-teller, Taak 5). Alle overige benodigde modellen (unique_codes, user_roles, users.accessCode, per-client consent-maps) bestaan al.

---

## 6. Precondities — allemaal opgelost (onderzocht juli 2026, aangescherpt na review 2026-07-07)

- **P1 — gate-semantiek: OPGELOST, verbreed naar alle vier de gates.** Het echte inlogscherm draait vier gates in serie (`routes/routes.js:457-460`). De exchange-beleidsregel in §4 spiegelt ze alle vier: `checkUniqueCodeAuth` (`client.js:152-193`; alleen afgedwongen als `UniqueCode` de enige authType is, geprivilegieerde rollen passeren), `checkRequiredUserFields` (`client.js:277-323`), `checkPhonenumberAuth` (`client.js:195-221` → `phonenumber_required`), en `check2FA` (`client.js:226-263` → `two_factor_required`, nooit stil minten — sessie-gebonden).
- **P2 — Unique codes per user+client opvraagbaar: OPGELOST, kleine toevoeging nodig.** `codeMw.withAll` (`apps/auth-server/middleware/code.js:34-40`) filtert alleen op `clientId` + zoekterm op `code`, níet op `userId`. Taak 5 voegt een `userId`-queryparam-filter toe. Admin-API-routes staan in `apps/auth-server/routes/adminApi.js:112-141` (niet routes.js), beveiligd met `passport.authenticate(['basic', 'oauth2-client-password'])` (`adminApi.js:25`); padconventie is `/api/admin/unique-code...`.
- **P3 — `jwtSecret`: OPGELOST, als afgedwongen invariant.** "Staat alleen globaal ingesteld" is een deployment-feit, geen code-invariant: `getConfig` merget `project.config.auth` over de defaults en zet `jwtSecret: projectConfig.jwtSecret` (`apps/api-server/src/util/auth-settings.js:42`), dus een project kán in code een eigen secret zetten. Daarom: (a) `exchange` verifieert het bron-JWT tegen het **globale** `config.auth['jwtSecret']`, net als `parseJwt` (`apps/api-server/src/middleware/user.js:121`) — niet tegen het target-`authConfig.jwtSecret`; (b) Taak 3 voegt een startup-assertie toe die luid faalt als een project `config.auth.jwtSecret` overschrijft. Let op de bestaande latente mismatch: digest-login mint met `req.authConfig.jwtSecret` (`router.js:407`) terwijl `parseJwt` met de globale verifieert (`user.js:121`) — vandaag gelijk, breekt zodra een project afwijkt; de assertie dekt ook dit af.
- **P4 — CORS: OPGELOST, geen wijziging nodig.** `security-headers.js` zet `Access-Control-Allow-Origin` op de request-origin als die in de `allowedDomains` van het project staat (`apps/api-server/src/middleware/security-headers.js:13-25`), met POST/OPTIONS, `Authorization`- en `Content-Type`-headers toegestaan en preflight-afhandeling (`:84-86`). Volgorde klopt: project-middleware (`src/Server.js:154`) draait vóór security-headers (`:156`). Precedent: `connect-user` wordt vandaag al via AJAX vanuit widgets aangeroepen. Enige vereiste: de embed-site moet in de `allowedDomains` van élk gebruikt project staan — dat is nu al zo voor widgets.
- **P5 — `forceNewLogin`-default: BESLIST.** Default uit, per project configureerbaar via `project.config.auth.forceNewLoginOnWidgets` (Taak 2).
- **P6 — Rolbepaling: OPGELOST.** Rollen zijn `user_roles`-rijen per client; `resolveRoleForClient` valt terug op de default-rol als er geen rij is (`apps/auth-server/utils/clientAuth.js:75-94`). De interactieve UniqueCode-login maakt bij eerste login een `UserRole`-rij aan met `client.config.defaultRoleId`, met fallback naar de authType-config (`apps/auth-server/controllers/auth/code.js:111-136`). Het nieuwe uniquecode-login endpoint (Taak 5) repliceert precies dit; de exchange-flow gebruikt dezelfde default-rol-fallback als er geen rol-rij bestaat.
- **P7 — Herbruikbaarheid van unique codes: BESLIST.** Het model (`model/unique~code.js`) heeft géén `isUsed`-veld; de `isUsed`-check in de bestaande TokenStrategy (`auth.js:104-107`) leest altijd `undefined` en is dode code. Codes zijn dus de facto herbruikbaar, en dat is ook het legitieme gedrag: een code is aan een user gekoppeld en fungeert als her-login-credential. **Keuze: herbruikbaar houden en documenteren** (echte single-use zou her-login met je stemcode breken). Het nieuwe endpoint neemt de dode check niet over. Compensatie tegen raden: server-side lockout (Taak 5) + rate limiting (Taak 7), want de bestaande brute-force-middleware bestaat alleen uit lege stubs (`apps/api-server/src/middleware/brute-force.js`) en `packages/lib/rateLimiter.js` is een in-memory IP-limiter per instance (niet gedeeld, private IPs uitgezonderd).

---

## 7. Taken

### Fase 1 — Fundament (fixes die ook standalone waardevol zijn)

#### Taak 1: Project-scoped token- én identity-handoff

**Files:**

- Modify: `apps/api-server/src/adapter/openstad/router.js:157-168` (digest-login redirect-URL-opbouw)
- Modify: `packages/data-store/src/hooks/use-current-user.js:48,61-69,95-97`
- Modify: `apps/cms-server/modules/openstad-auth/index.js:102`
- Modify (optioneel): `apps/admin-server/src/components/widget-preview.tsx:25`
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

- [ ] **Stap 3: maak `globalOpenStadUser`-pickup project-scoped**

  De global (`use-current-user.js:48,95-97`) is page-breed; op een multi-project pagina lekt zo de JWT van project A naar de API van project B. Laat de CMS-setter (`apps/cms-server/modules/openstad-auth/index.js:102`) een `projectId` meegeven op het object, en gebruik in de hook de global alleen als `globalOpenStadUser.projectId` ontbreekt (BC: bestaande single-project pagina's en admin-preview) óf gelijk is aan `props.projectId`.

- [ ] **Stap 4: admin-preview** — de admin-preview (`widget-preview.tsx:25`) injecteert bewust een superadmin-JWT die via de superuser-elevatie cross-project werkt; die mag zónder `projectId` blijven (valt onder de BC-tak van stap 3). Optioneel: `projectId` van de preview-widget meegeven voor uniformiteit.

- [ ] **Stap 5: unit test**

  Test: twee storage-instanties (projectId 1 en 2), URL met `openstadlogintoken=X&openstadprojectid=2` → alleen namespace 2 krijgt het token; zonder `openstadprojectid` → huidig gedrag. Global met `projectId: 1` → alleen widget 1 seedt eruit; global zonder `projectId` → beide (BC).

- [ ] **Stap 6: verifieer**

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

- [ ] **Stap 2: unit test** (jest) in `apps/api-server` op `getDefaultConfig`-output met/zonder de config-flag.

- [ ] **Stap 3: verifieer**

  Run: `cd apps/api-server && npm test` — groen. Browser: widgetbundel opvragen (`/widget/...`) en controleren dat `forceNewLogin` afwezig is zonder flag.

#### Taak 3: JWT-hardening (pending-tokens + projectId-claim + jwtSecret-assertie)

**Files:**

- Modify: `apps/api-server/src/adapter/openstad/router.js:403-429` en `:62-67` (JWT-mint plekken)
- Modify: `apps/api-server/src/middleware/user.js:85-112` (`parseAuthHeader`)
- Modify: `apps/api-server/src/util/auth-settings.js` (assertie)

- [ ] **Stap 1: voeg `projectId` toe aan geminte JWT's**

  Op beide mint-plekken: `jwt.sign({ userId, authProvider, projectId: parseInt(req.params.projectId, 10) }, ...)`.

- [ ] **Stap 2: behandel `pending`-tokens als geen-auth in `parseAuthHeader`**

  Niet throwen in `parseJwt` — een throw propageert via de getUser-catch (`user.js:65-70`) als request-error (500), niet als anonieme fallback. Vang de claim af in `parseAuthHeader` (`user.js:85-112`): decodeer, en bij `claims.pending` het token behandelen alsof er geen Authorization-header is (anoniem). Beschermde routes geven dan netjes 401, conform de validatiechecklist (§8).

- [ ] **Stap 3: géén harde `projectId === req.project.id`-afwijzing**

  De bestaande cross-project admin-fallback (`user.js:175-196`) moet blijven werken; de claim is nu alleen defense-in-depth/observability. Documenteer dit met een comment bij de claim-extractie (`user.js:92-94`).

- [ ] **Stap 4: startup-assertie op `jwtSecret`-overrides (P3)**

  In `auth-settings.js` (naast de bestaande sanity-check op `:50`): als `project.config.auth.jwtSecret` gezet is en afwijkt van het globale `config.auth.jwtSecret` → error loggen en de config-load hard laten falen. Daarmee wordt P3 een afgedwongen invariant en is ook de latente mismatch tussen mint (`router.js:407`, per-project) en verify (`user.js:121`, globaal) afgedekt.

- [ ] **Stap 5: verifieer** — `cd apps/api-server && npm test` groen; handmatig: bestaand token zonder claims blijft werken (BC); pendingJwt als Bearer op beschermde route → 401.

#### Taak 4: auth-server sessie-hardening

**Files:**

- Modify: `apps/auth-server/middleware/client.js:228-229`
- Modify: auth-server login-succespaden (o.a. `controllers/auth/local.js`, `code.js`, `phonenumber.js`, url-login)

- [ ] **Stap 1: verwijder de inerte globale 2FA-fallback**

  `check2FA` leest `req.currentClientAuth?.twoFactorValid || req.session?.twoFactorValid` (`client.js:228-229`). De tweede tak is een globale sessie-vlag die nergens wordt gezet (2FA-validiteit staat alleen per client in `session.clientAuth[clientId]`) en dus inert is — maar zodra iemand tijdens dit multi-project werk per ongeluk een top-level `session.twoFactorValid` zet, is het een directe globale 2FA-bypass over alle projecten. Verwijder de fallback.

- [ ] **Stap 2: session-regeneration bij login (session fixation)**

  De auth-server roept nergens `req.session.regenerate()` aan, en `saveUninitialized: true` (`app-init.js:112`) mint al een sessie voor anonieme bezoekers. Bij een gedeelde, lang-levende SSO-sessie (tot 7 dagen, `utils/clientAuth.js:7-8`) over meerdere projecten geeft één gefixeerde `openstad-authorization.sid` toegang tot elk project waar het slachtoffer daarna op inlogt. Regenereer de sessie-id op de login-succespaden vlak vóór `req.logIn(...)`; kopieer bestaande `clientAuth`-context over de regeneratie heen (een al-ingelogde SSO-gebruiker die bij een extra client inlogt mag zijn andere client-logins niet verliezen).

- [ ] **Stap 3: unit tests** (jest) — 2FA vereist zonder `currentClientAuth.twoFactorValid` → geblokkeerd, ook met een handmatig gezette `session.twoFactorValid`; sessie-id verandert na login, `clientAuth` van andere clients blijft behouden.

- [ ] **Stap 4: verifieer** — `cd apps/auth-server && npm test` groen; browser: login-flow werkt, cookie-waarde vóór/na login verschilt.

### Fase 2 — AJAX-auth-API (backend)

#### Taak 5: auth-server endpoint `POST /api/admin/unique-code-login` + `userId`-filter + lockout

**Files:**

- Create: `apps/auth-server/controllers/admin/api/uniqueCodeLogin.js` (+ jest-test)
- Create: `apps/auth-server/migrations/010-add-login-attempts.js` (nummer aansluiten op bestaande reeks)
- Modify: `apps/auth-server/routes/adminApi.js` (registreren naast de bestaande unique-code-routes, `:112-141`)
- Modify: `apps/auth-server/middleware/code.js:34-40` (`userId`-filter in `withAll`)

- [ ] **Stap 1: `userId`-filter toevoegen aan `codeMw.withAll`** (nodig voor de exchange-gate, P2)

  In `middleware/code.js`, na de bestaande `where`-opbouw (`:34-40`):

  ```js
  if (req.query.userId) {
    where.userId = parseInt(req.query.userId, 10);
  }
  ```

- [ ] **Stap 2: lockout-migratie + teller**

  Additieve migratie: tabel `login_attempts` (`clientId`, `createdAt`, evt. doorgegeven `ip`). Het endpoint registreert elke mislukte codepoging en weigert met `429 { error: 'too_many_attempts' }` zodra het aantal mislukte pogingen per client binnen het venster (bijv. 20 / 15 min) overschreden is. Dit zit bewust op de auth-server: die ziet álle pogingen van álle api-server-instances (de IP-limiter uit Taak 7 is per instance en per IP, en dus alleen een eerste linie — zie P7).

- [ ] **Stap 3: controller — spiegel de passport-strategy én de rol-toekenning**

  Codelogica volgt de `uniqueCode` TokenStrategy (`apps/auth-server/auth.js:87-144`): zoek code op `code` + `clientId` (client komt uit de Basic-auth-context), laad gekoppelde user óf maak lege user aan en koppel (`uniqueCode.userId = user.id`). De `isUsed`-check uit de strategy is dode code en wordt bewust **niet** overgenomen (P7: codes zijn herbruikbare credentials). Rol-toekenning identiek aan de interactieve flow (`controllers/auth/code.js:111-136`): als er nog geen `UserRole`-rij voor deze client is, maak er één met `req.client.config.defaultRoleId`, fallback naar de authType-config (P6). Response: `{ user: { id, ...velden }, role, isNew }`. Bij onbekende code: `404 { error: 'invalid_code' }` + poging registreren (stap 2).

  ```js
  exports.post = async (req, res, next) => {
    const { code } = req.body;
    if (await lockout.isLocked(req.client.id))
      return res.status(429).json({ error: 'too_many_attempts' });
    const uniqueCode = await db.UniqueCode.findOne({
      where: { code, clientId: req.client.id },
    });
    if (!uniqueCode) {
      await lockout.registerFailure(req.client.id);
      return res.status(404).json({ error: 'invalid_code' });
    }
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

- [ ] **Stap 4: route registreren** in `routes/adminApi.js`, zelfde middleware-keten als `POST /api/admin/unique-code` (`:128-131`), dus achter `passport.authenticate(['basic', 'oauth2-client-password'])` (`:25`). Alleen registreren als `process.env.MULTI_PROJECT_LOGIN` truthy is (opt-in, zie §1):

  ```js
  app.post(
    '/api/admin/unique-code-login',
    auth,
    adminApiUniqueCodeLoginController.post
  );
  ```

- [ ] **Stap 5: unit tests** (jest) — geldige code (nieuw + al gekoppeld), her-login met al gekoppelde code logt in als gekoppelde user, code van andere client (404), lockout na N mislukte pogingen (429), rol-rij aangemaakt met `defaultRoleId`, `withAll` met `userId`-filter.

- [ ] **Stap 6: verifieer** — `cd apps/auth-server && npm test` groen (let op: het root-script `test:unit:auth` is vitest en struikelt over de jest-testfiles; gebruik het app-lokale script); curl met Basic-auth tegen lokale auth-server (`http://localhost:31430`).

#### Taak 6: api-server — gedeelde helpers (`inline-login.js`): gate-check + user-upsert

**Precondities:** geen — P1, P2, P6 en P7 zijn beslist (zie §6); Taak 5 (auth-server endpoint + `userId`-filter) moet af zijn.

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

- [ ] **Stap 3: gate-check helper — alle vier de gates**

  `checkClientGates({ authConfig, userData })` → haalt de client op (`service.fetchClient`) en geeft terug:

  ```js
  { ok: true }
  | { ok: false, status: 'uniquecode_required' }            // per P1-beleid (§4)
  | { ok: false, status: 'fields_required', missingFields } // requiredUserFields incl. accessCode,
                                                            // per-client privacyConsent/emailNotificationConsent
  | { ok: false, status: 'phonenumber_required' }           // Phonenumber in authTypes,
                                                            // geen phoneNumberConfirmed, geen privileged rol
  | { ok: false, status: 'two_factor_required' }            // rol valt onder twoFactorRoles:
                                                            // NOOIT stil minten (sessie-gebonden, §4)
  ```

  Veldenlijst en per-client-specials spiegelen van `apps/auth-server/middleware/client.js:277-323` en `config/user.js:1-48`; phonenumber-gate van `client.js:195-221`; 2FA-rolbepaling van `client.js:226-263`. Zonder de laatste twee gates zou de exchange een privilege-escalatie over projecten heen zijn (gebruiker met alleen e-mail-login krijgt stil een token voor een 2FA-plichtig project).

- [ ] **Stap 4: `mintJwt({ authConfig, userId, role, projectId, pending })`** — wrapper om de bestaande sign-logica (`router.js:403-429`) incl. `sessionDuration.getJwtExpiresInForRole`; bij `pending: true` een korte expiry (15 min) en claim `pending: true`.

- [ ] **Stap 5: unit tests** (jest) voor `checkClientGates` (alle vijf de uitkomsten) en `upsertProjectUser` (bestaand/nieuw/`canCreateNewUsers=false`).

- [ ] **Stap 6: verifieer** — `cd apps/api-server && npm test` groen; digest-login regressietest (bestaande login-flow in de browser blijft werken).

#### Taak 7: api-server routes `exchange`, `uniquecode-login`, `complete-fields`

**Files:**

- Modify: `apps/api-server/src/adapter/openstad/router.js` (routes registreren)
- Modify: `apps/api-server/src/adapter/openstad/inline-login.js` (handlers)

- [ ] **Stap 1: `POST /auth/project/:projectId/exchange`**

  Body: `{ sourceJwt }`. Handler:
  1. `jwt.verify(sourceJwt, config.auth['jwtSecret'])` — het **globale** secret, net als `parseJwt` (P3) → weiger `pending`-claims → laad bron-userrow (`db.User.findByPk(claims.userId)`).
  2. Weiger als bronrol/provider `anonymous` is → `401 { status: 'not_allowed' }`.
  3. Haal actuele userdata op via `service.fetchUserData` met de **target**-clientcredentials (admin-lookup op `idpUser.identifier`).
  4. `checkClientGates(...)`:
     - `uniquecode_required` / `phonenumber_required` / `two_factor_required` → `409` met die status (geen JWT, geen pendingJwt).
     - `fields_required` → upsert user (zodat er iets is om aan te vullen), mint `pendingJwt`, → `409 { status, missingFields, labels, pendingJwt }`.
     - `ok` → `upsertProjectUser`, mint JWT → `200 { jwt }`.

- [ ] **Stap 2: `POST /auth/project/:projectId/uniquecode-login`**

  Body: `{ code }`. Handler: `service.loginWithUniqueCode` → bij `invalid_code` `401`, bij `too_many_attempts` `429` doorgeven; anders userdata → `checkClientGates` (UniqueCode-gate is nu per definitie vervuld; de overige drie gelden nog) → bij `fields_required` pendingJwt-pad, bij `phonenumber_required`/`two_factor_required` `409`, anders `200 { jwt }`.

- [ ] **Stap 3: `POST /auth/project/:projectId/complete-fields`**

  Body: `{ pendingJwt, fields }`. Handler:
  1. Verifieer `pendingJwt` (globale secret) en eis claim `pending: true`.
  2. Whitelist `fields` tegen de `missingFields` van de client (nooit blind doorsturen).
  3. `accessCode` in fields → eerst valideren via auth-server `POST /api/validation/code/` (let op de trailing slash; `apps/auth-server/routes/routes.js:336`, `middleware/access-code.js:35-45`).
  4. `service.updateUser` (Basic admin) met de nieuwe veldwaarden; per-client-velden (`privacyConsent`, `emailNotificationConsent`) volgens het formaat in `middleware/client.js:285-306`.
  5. Her-run `checkClientGates` → `ok` → definitieve JWT `200 { jwt }`; anders opnieuw `409 fields_required` (resterende velden).

- [ ] **Stap 4: rate limiting (eerste linie)**

  Strengere limiter op `uniquecode-login` en `complete-fields`, naar het patroon van `@openstad-headless/lib/rateLimiter` zoals gebruikt in `apps/api-server/src/routes/notification/*.js` — bijv. 10 requests / 15 min / IP. Bekende beperkingen (P7): in-memory per instance, IP-key, private IPs uitgezonderd — daarom is de échte bescherming de server-side lockout op de auth-server (Taak 5 stap 2), die alle instances en NAT-scenario's dekt.

- [ ] **Stap 5: routes registreren** in `router.js`, zelfde plek als `connect-user` (`:18`), zodat `useAuth`-provider-resolutie (`src/routes/auth/index.js:16-49`) gewoon werkt. **Alleen registreren als `process.env.MULTI_PROJECT_LOGIN` truthy is** (opt-in, zie §1); geef de flag ook mee in de widget-config (naast de login-URL's in `src/routes/widget/widget.js`) zodat `useLoginFlow` zonder flag direct het redirect-pad kiest.

- [ ] **Stap 6: unit tests** (jest) per route: happy path, `uniquecode_required`, `fields_required` → complete-fields → jwt, `phonenumber_required`, `two_factor_required` (rol onder `twoFactorRoles` → nooit 200), invalid code, 429-doorgifte, pendingJwt als Bearer op reguliere API → anoniem/401, anonymous-bron geweigerd.

- [ ] **Stap 7: verifieer** — `cd apps/api-server && npm test` groen + curl-scenario tegen lokale stack:

  ```bash
  # gegeven een geldig project-1 jwt:
  curl -s -X POST http://localhost:31410/auth/project/2/exchange?useAuth=default \
    -H 'Content-Type: application/json' -d '{"sourceJwt":"<jwt1>"}'
  # verwacht: 200 {jwt} of 409 {status:...}
  ```

#### Taak 8: per-project logout

**Files:**

- Modify: `apps/auth-server/controllers/auth/local.js:186-200`

- [ ] **Stap 1: logout van één client mag de SSO-sessie niet slopen**

  Nu doet de logout-flow `req.session.destroy()`, waardoor uitloggen bij project A je ook uitlogt bij B en C — precies het gedrag dat deze feature bestrijdt. **Keuze: per-project logout, alleen als `MULTI_PROJECT_LOGIN` aan staat** (zonder flag blijft `session.destroy()` — huidig gedrag, zie §1). Vervang door: `clearClientAuth(req.session, client)` (bestaat al, `utils/clientAuth.js:57`) + access-/refresh-tokens van díe client voor die user verwijderen; pas als `session.clientAuth` daarna leeg is: `req.logout()` + `req.session.destroy()` (volledige SSO-logout).

- [ ] **Stap 2: unit tests** (jest) — logout client A: `clientAuth[A]` weg, `clientAuth[B]` intact, sessie leeft; logout laatste client: sessie vernietigd.

- [ ] **Stap 3: verifieer** — `cd apps/auth-server && npm test` groen; browser: ingelogd bij 2 projecten, logout bij A → B blijft ingelogd; logout bij B → volledige logout. Frontend-kant: de widget wist alleen zijn eigen storage-namespace (bestaand gedrag) en roept `notifyAuthChange()` aan (Taak 10).

### Fase 3 — Frontend

#### Taak 9: `packages/lib/auth-broker.ts`

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

#### Taak 10: data-store — API-calls + auth-state live bijwerken + seed-namespacing

**Files:**

- Modify: `packages/data-store/src/api/user.js`
- Modify: `packages/data-store/src/hooks/use-current-user.js`
- Modify: `packages/data-store/src/api/resources.js:2-3,15-19`

- [ ] **Stap 1: API-calls toevoegen** in `api/user.js` (naast `fetchMe`/`connectUser`/`logout`):

  ```js
  exchangeLogin: async function ({ projectId }, sourceJwt) {
    return this.fetchRaw(`/auth/project/${projectId}/exchange?useAuth=default`,
      { method: 'POST', body: JSON.stringify({ sourceJwt }) });
  },
  loginWithUniqueCode: async function ({ projectId }, code) { /* idem, body {code} */ },
  completeFields: async function ({ projectId }, pendingJwt, fields) { /* idem */ },
  ```

  Let op: `doFetch` (`api/fetch.js:63-141`) gooit bij non-2xx. Voeg een `fetchRaw`-variant toe (of optie `allowStatuses: [401, 409, 429]`) die de JSON-body van 401/409/429 teruggeeft in plaats van een `OpenStadRequestError` te dispatchen — de 409's zijn hier normale flow, geen fout.

- [ ] **Stap 2: state-update helper in `use-current-user.js`**

  ```js
  function applyJwt(jwt) {
    storage.set('openStadUser', { jwt });
    self.api.currentUserJWT = jwt;
    notifyAuthChange();
    self.refresh(); // packages/data-store/src/index.js:142-154
  }
  ```

  Let op: `use-current-user.js` destructureert geen `mutate` uit `useSWR`; het bestaande revalidatie-pad is `self.refresh()` (`packages/data-store/src/index.js:142-154`) — gebruik dat, geen lokale `mutate`. En: subscribe via `onAuthChange` zodat een login door widget X ook widget Y (zelfde project, andere widget-instantie) live bijwerkt.

- [ ] **Stap 3: `pseudoRandomSortSeed` per project namespacen**

  `api/resources.js:2-3,15-19` gebruikt globale localStorage-keys (`pseudoRandomSortSeed`, `pseudoRandomSortSeedTimestamp`) buiten de `LocalStorage`-class om; twee random-gesorteerde overzichten van verschillende projecten delen zo één seed/rotatie. Maak de keys project-scoped (bijv. `pseudoRandomSortSeed:${projectId}`).

- [ ] **Stap 4: unit tests** — `applyJwt` zet storage + JWT + triggert `self.refresh`; 409-responses komen als data terug, niet als exception; seed-keys per project gescheiden.

- [ ] **Stap 5: verifieer** — `cd packages/data-store && npx vitest run`.

#### Taak 11: `packages/ui` — `LoginDialog`

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

#### Taak 12: `useLoginFlow` hook (data-store)

**Files:** Create `packages/data-store/src/hooks/use-login-flow.js` (+ test), modify `packages/data-store/src/index.js` (binden zoals `useCurrentUser` op `index.js:47`).

- [ ] **Stap 1: implementatie**

  De hook levert `{ requireLogin, dialogProps }`. `requireLogin()` retourneert een Promise die resolvet met de ingelogde user of `null` (geannuleerd):
  1. Al ingelogd (`currentUser.id`)? → resolve.
  2. `getKnownIdentities(props.projectId)` → probeer per identiteit `exchangeLogin`:
     - `200 {jwt}` → `applyJwt` → resolve.
     - `409 uniquecode_required` → open dialog, stap `uniquecode`; na submit `loginWithUniqueCode(code)`; bij `409 fields_required` door naar velden-stap; bij `429` foutmelding "te veel pogingen" tonen; bij `200` → `applyJwt` → resolve.
     - `409 fields_required` → open dialog, stap `fields` met `missingFields`; na submit `completeFields(pendingJwt, values)` → `200` → resolve; nieuwe `409` → resterende velden tonen.
     - `409 two_factor_required` / `409 phonenumber_required` → niet inline oplosbaar: door naar de popup/redirect-fallback (stap 3), waar de echte 2FA-/SMS-flow op de auth-server draait.
     - `401` → volgende identiteit proberen.
  3. Geen identiteiten (of alleen niet-inline-oplosbare statussen) → fallback: `props.login.url` redirect (huidig gedrag; popup-variant komt in Taak 14).
  4. Dialog gesloten door gebruiker → resolve `null`.

- [ ] **Stap 2: unit tests** — mock API: direct-exchange-pad, stemcode-pad, velden-pad, stemcode→velden-keten, `two_factor_required` → fallback (geen dialog, geen jwt), annuleren, geen identiteiten → geen dialog.

- [ ] **Stap 3: verifieer** — `cd packages/data-store && npx vitest run src/hooks/use-login-flow.test.js`.

#### Taak 13: integratie in `likes` en `stem-begroot`

**Files:**

- Modify: `packages/likes/src/likes.tsx:125-136`
- Modify: `packages/stem-begroot/src/stem-begroot.tsx:1354-1355` en `packages/stem-begroot/src/step-3/index.tsx:41-96`

- [ ] **Stap 1: likes** — vervang in de `!hasRole(...)`-branch de redirect:

  ```tsx
  const { requireLogin, dialogProps } = datastore.useLoginFlow({ ...props });
  // in doVote():
  if (!hasRole(currentUser, props.votes.requiredUserRole)) {
    try {
      const user = await requireLogin();
      if (!user) return; // geannuleerd
    } finally {
      setIsBusy(false);
    }
  }
  // render: <LoginDialog {...dialogProps} />
  ```

  Let op `isBusy`: `doVote` zet `isBusy=true` (`likes.tsx:118-119`) vóór de rol-check en de huidige redirect-branch reset dat nooit (de pagina navigeerde weg). Met een awaited `requireLogin()` die bij annuleren `null` resolvet, blijft de widget anders in busy-state hangen — vandaar de try/finally. De bestaande pending-vote-stash (`storage.set('osc-resource-vote-pending', ...)`, `likes.tsx:135`) blijft nodig voor de redirect-fallback, maar bij een geslaagde inline login wordt de stem direct uitgevoerd — geen reload, dus geen stash.

- [ ] **Stap 2: stem-begroot** — zelfde patroon op de submit-gate (`stem-begroot.tsx:1354-1355`) en in `step-3/index.tsx:44,95`; controleer daar hetzelfde busy-state-patroon en reset via try/finally. De post-login resume-flow (`stem-begroot.tsx:1438`) blijft intact voor de redirect-fallback.

- [ ] **Stap 3: `npm run build`** in beide packages (vereist voor admin-preview, zie CLAUDE.md).

- [ ] **Stap 4: verifieer (browser)** — testpagina met likes-widget van project 1 en stem-begroot-widget van project 2 (UniqueCode actief): log in via project 1; klik stem in project 2 → dialog vraagt stemcode → invullen → stem geregistreerd zonder page refresh; beide widgets tonen ingelogde staat. Annuleren van de dialog → widget niet in busy-state.

- [ ] **Stap 5 (vervolg, apart in te plannen):** zelfde integratie voor `enquete`, `resource-form`, `comments`, `choiceguide`, `document-map`, `distribution-module`, `account`, `simple-voting`. Elk: `hasRole`-branch → `requireLogin` + `<LoginDialog>`.

### Fase 4 — Initiële login zonder refresh (popup-fallback) + admin

#### Taak 14: popup-login voor initiële login (geen identiteit bekend) en 2FA/telefoon-flows

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

- [ ] **Stap 2: frontend** — in `useLoginFlow`-fallback: `window.open(loginUrl + popupParams, 'osc-login', 'width=480,height=640')`; luister op `message` (check `event.origin` tegen de API-url en `event.data.projectId`); bij ontvangst `applyJwt(jwt)`. Popup geblokkeerd (`window.open` → null) → redirect-fallback. Dit pad dekt ook `two_factor_required`/`phonenumber_required` uit Taak 12: de popup draait de volledige `/dialog/authorize`-gates (incl. echte 2FA-/SMS-flow).

  Dit werkt óók als stille SSO: bestaat er al een auth-server-sessie (bijv. admin ingelogd, of gebruiker eerder via Url ingelogd), dan flitst de popup alleen even en sluit direct — top-level navigatie, dus de `SameSite=Lax` sessiecookie gaat gewoon mee.

- [ ] **Stap 3: unit tests** — origin-validatie van de callback (afgewezen origin → geen script met token), message-handler negeert verkeerde origin/projectId.

- [ ] **Stap 4: verifieer (browser)** — uitgelogde staat, klik login → popup → inloggen → popup sluit, widget is ingelogd zonder refresh. Project met 2FA-plichtige rol: exchange geeft `two_factor_required` → popup → 2FA-flow → ingelogd.

#### Taak 15: admin overal ingelogd — verificatie + kleine gaten

**Files:** geen wijziging voorzien; alleen verificatie en zo nodig follow-up.

**Scope (kernteam-Q&A):** dit gaat over de **site-kant** — widgets die een beheerder gebruikt/test op een gewone pagina of in de preview. De login op het adminpanel zelf verandert niet; daar log je één keer in en heb je overal toegang (superuser-elevatie).

- [ ] **Stap 1: verifieer API-niveau** — admin-JWT (project 1) op `GET /auth/project/2/me`: werkt via de superuser-elevatie (`apps/api-server/src/middleware/user.js:175-254`). Curl-check.
- [ ] **Stap 2: verifieer widget-preview in admin** — blijft werken via `globalOpenStadUser`-injectie (`apps/admin-server/src/components/widget-preview.tsx:17-31`), pickup in `use-current-user.js` (na Taak 1 stap 3/4: global zonder `projectId` valt onder de BC-tak).
- [ ] **Stap 3: verifieer embed-site-scenario** — admin logt in op admin-server (auth-server-sessie ontstaat, project 1); open embed-site met widgets van project 2 en 3; klik login → popup-SSO (Taak 14) logt direct in zonder prompt (auth-server-sessie bestaat, admin voldoet aan gates). Vervolgens dekken exchange-calls de overige widgets op de pagina.
- [ ] **Stap 4: documenteer beperking** — volledig automatisch (nul kliks) inloggen op een extern domein kan niet betrouwbaar door third-party-cookie-blokkering; één klik (popup) is het maximum. Vastleggen in de docs van Taak 17.

#### Taak 15b: CMS-login-URL onder de `forceNewLogin`-flag (Apostroph cross-site logout)

**Aanleiding:** een beheerder die aan meerdere CMS-sites (cms-server, Apostroph) werkt raakt cross-site uitgelogd. De Apostroph-sessie is al per site geïsoleerd (eigen cookie `openstad-<projectId>.sid`, eigen secret, eigen MongoDB) en veroorzaakt dit dus niet. De enige gedeelde laag is de auth-server SSO-sessie, die door `forceNewLogin=1` volledig vernietigd wordt. De CMS-login-URL hardcodeert die flag op het reguliere pad (`apps/cms-server/app.js:495-498`), terwijl Taak 2 alleen de widget-login-URL configureerbaar maakte. Het `/admin/login`-pad (`loginPriviliged`) zet de flag al níet, dus een zuivere admin-login zou de SSO-sessie vandaag al niet moeten slopen.

**Files:**

- Modify: `apps/cms-server/app.js:495-498`

- [ ] **Stap 1: verifieer de trigger** — reproduceer het cross-site uitloggen en stel vast via welk login-pad het gebeurt (`/login` regulier met `forceNewLogin=1`, of `/admin/login` zonder). Alleen als het reguliere pad de oorzaak is, is stap 2 nodig; anders is het al opgelost door de per-project logout (Taak 8) en `forceNewLogin`-default (Taak 2).
- [ ] **Stap 2: trek dezelfde flag door** — maak `forceNewLogin` in de CMS-login-URL configureerbaar via dezelfde projectconfig als Taak 2 (`project.config.auth.forceNewLoginOnWidgets`), i.p.v. hardcoded `&forceNewLogin=1`. Gate op `MULTI_PROJECT_LOGIN` (opt-in, §1).
- [ ] **Stap 3: verifieer** — ingelogd op CMS-site A, inloggen op CMS-site B → A blijft ingelogd. Regressie: single-site CMS-login werkt ongewijzigd.

_Raming: 1-2 uur incl. verificatie._

### Fase 5 — Afronding

#### Taak 16: E2E-tests

**Files:** Create spec in root `cypress/e2e/` (bestaande root-level Cypress-setup: `cypress.config.ts` + `cypress/e2e/1-smoke-test/admin.cy.js`, gedraaid met `npm run test:e2e`; `apps/admin-server/cypress/` bestaat niet).

- [ ] **Stap 1:** E2E-scenario "multi-project pagina": twee widgets, login project A, inline stemcode-login project B, assert beide ingelogd + geen page reload (`cy.window()`-referentie blijft gelijk).
- [ ] **Stap 2:** E2E-scenario requiredFields: project B vereist adres → dialog toont adres-veld → submit → ingelogd.
- [ ] **Stap 3:** E2E-scenario per-project logout: ingelogd bij A en B, logout A → B blijft ingelogd.
- [ ] **Stap 4: verifieer** — `npm run test:e2e` groen.

#### Taak 17: documentatie

- [ ] **Stap 1:** beschrijf de nieuwe endpoints (request/response-contract incl. `two_factor_required`/`phonenumber_required`/429, rate limits + lockout), de `MULTI_PROJECT_LOGIN`-env-flag (opt-in, op api-server én auth-server; wat wel/niet onder de flag valt — zie §1) en de `forceNewLoginOnWidgets`-flag in de bestaande docs-structuur van de repo.
- [ ] **Stap 2:** beschrijf de beperking uit Taak 15 stap 4 en het beleid uit §4 (wanneer stille exchange wel/niet mag; 2FA nooit stil).
- [ ] **Stap 3:** documenteer P7: unique codes zijn herbruikbare credentials (bewuste keuze), beschermd door lockout + rate limiting; en de nieuwe per-project logout-semantiek (Taak 8).

---

## 8. Validatiechecklist (gates)

**CLI (let op: apps draaien jest via hun app-lokale scripts; de root `test:unit:*`-scripts zijn vitest en niet bruikbaar voor de apps):**

- `cd apps/api-server && npm test` — groen (nieuwe inline-login tests + regressie digest-login)
- `cd apps/auth-server && npm test` — groen (uniquecode-login endpoint, lockout, sessie-hardening, per-project logout)
- `cd packages/lib && npx vitest run` / idem `packages/data-store`, `packages/ui`
- Curl-scenario uit Taak 7 stap 7 (exchange 200/409-contract)
- Curl: pendingJwt als Bearer op `GET /api/project/2/resource` → 401 (behandeld als anoniem, geen 500)
- Curl: N+1 foute stemcodes → `429 too_many_attempts`

**Browser (docker-stack draaiend):**

- Testpagina met widgets van 2 projecten: login A → inline stemcode-login B → beide ingelogd, geen reload
- requiredFields-dialog (project met adres verplicht) → na invullen direct ingelogd
- accessCode als required field → dialog vraagt code → foute code toont fout, goede code logt in
- Project met 2FA-plichtige rol: exchange mint nóóit stil een token; popup-flow doorloopt echte 2FA
- Uitgelogd + popup-login (Taak 14): popup sluit, widget ingelogd
- Per-project logout: logout bij A → B blijft ingelogd; logout laatste project → volledige logout
- Admin-scenario (Taak 15 stap 3)
- Regressie: single-project site met bestaande redirect-login werkt ongewijzigd
- Toegankelijkheid dialog: volledige flow met alleen toetsenbord; focus komt terug op de triggerende knop; screenreader-labels aanwezig (axe-check op de dialog)

---

## 9. Rollback

- **Eerste knop: `MULTI_PROJECT_LOGIN` uitzetten** — deactiveert de nieuwe endpoints, de widget-config-flag en de per-project logout in één keer, zonder code-deploy; frontend valt automatisch terug op redirect.
- **Eén additieve migratie** (lockout-tabel, Taak 5) — geen destructieve schemawijzigingen; rollback van code laat de tabel ongebruikt achter, geen down-migratie nodig voor functioneel herstel.
- Fase 1 (Taak 1-4) is los terugdraaibaar; `openstadprojectid`, de `projectId`-claim en het `projectId`-veld op `globalOpenStadUser` zijn additief (oude clients negeren ze). Session-regeneration en de 2FA-fallback-verwijdering zijn gedragsneutraal voor legitieme flows.
- Nieuwe endpoints (Taak 5-7) zijn additief; uitzetten = routes deregistreren. Frontend valt dan automatisch terug op redirect (fallback-pad in `useLoginFlow`).
- Per-project logout (Taak 8): terugdraaien herstelt globale logout — functioneel de oude situatie.
- Widget-integraties (Taak 13) per package terug te draaien; de redirect-code blijft als fallback aanwezig.
- Aandachtspunt: eenmaal uitgegeven JWT's met `projectId`-claim blijven geldig tot expiry — geen actie nodig, claims worden alleen gelezen.
- `forceNewLoginOnWidgets`: bij problemen op gedeelde computers per project weer aanzetten via projectconfig (geen deploy nodig).

---

## 10. Risico's en aandachtspunten

- **Brute force op stemcodes** via het nieuwe AJAX-endpoint: codes zijn herbruikbaar (P7) en de bestaande brute-force-middleware is een lege stub. Mitigatie is tweelaags: IP-rate-limiting op de api-server (eerste linie, Taak 7 stap 4) én een server-side lockout-teller op de auth-server (Taak 5 stap 2) die alle api-instances en NAT-scenario's dekt.
- **Gate-logica op twee plekken** (auth-server redirect-flow én api-server AJAX-flow): drift-risico. Mitigatie: gate-helper in één module (`inline-login.js`) die álle vier de gates spiegelt, met tests die de veldenlijst uit `config/user.js` spiegelen; documenteer de spiegelrelatie in beide bestanden.
- **2FA is sessie-gebonden** en per ontwerp uitgesloten van stille exchange (`two_factor_required` → popup/redirect). Elke toekomstige "optimalisatie" die dit inline probeert op te lossen is per definitie een 2FA-bypass — vastgelegd in §4 en Taak 17.
- **`forceNewLogin`-default wijzigen** raakt stembureau-achtige scenario's (P5) — bewust als aparte, per project configureerbare stap.
- **pendingJwt-lek**: een pending token mag nergens als login werken — afgedekt in Taak 3 stap 2 (als anoniem behandeld) + expliciete test.
- **Meerdere identiteiten in de browser** (bijv. via stemcode van iemand anders ingelogd in project X): `exchange` probeert identiteiten in volgorde; anonieme en niet-passende identiteiten worden overgeslagen. UX-keuze (welke identiteit wint) is triviaal zolang er in de praktijk één echte identiteit is; documenteren in Taak 17.
- **postMessage-beveiliging** (Taak 14): target origin altijd gevalideerd, message-handler checkt origin — expliciet getest.
- **Session-regeneration** (Taak 4 stap 2) raakt álle loginpaden; regressierisico op bestaande flows. Mitigatie: `clientAuth`-context expliciet over de regeneratie heen kopiëren + regressietests per loginmethode.
- **Privacy/AVG-invariant — passief ingelogd zijn mag geen user-rij in een ander project aanmaken (kernteam-Q&A).** Enkel ingelogd zijn in project B maakt de gebruiker niet zichtbaar in project A. Een user-rij (incl. e-mail) ontstaat in een project pas bij daadwerkelijke deelname: `requireLogin()` wordt getriggerd door een gate-actie (stemmen/liken), niet bij page-load, en pas dán draait de exchange die via `upsertProjectUser` een rij aanmaakt (Taak 6/7). Dit is gelijk aan het huidige gedrag (je staat vandaag ook alleen in een projectlijst na deelname). **Bewaak deze invariant:** de broker/`useLoginFlow` (Taak 9/12) mag nooit een exchange-upsert doen op enkel page-load of stille achtergrond-sync — anders lekt een identiteit uit project B naar de gebruikerslijst van project A. Test: widget van project A op de pagina, gebruiker alleen ingelogd in B, geen interactie → geen user-rij/`/me`-hit in project A.

**Bekende bestaande problemen, expliciet búiten dit plan (niet hier oplossen, wel apart oppakken):**

- **Vote DELETE/TOGGLE is niet project-scoped**: `apps/api-server/src/routes/api/vote.js:549-551` en `:579-581` doen `db.Vote.findOne({ where: { id: voteId } })` zonder `projectId`; delete is alleen gated door `vote.can('delete')`. Een editor in project A kan votes van project B verwijderen/togglen op numeriek id. Bestaat vandaag al; multi-login maakt editor-coexistentie waarschijnlijker. Apart oplossen.
- **CORS path-exceptie reflecteert elke origin + `Allow-Credentials: true`** voor projectloze paden (`apps/api-server/src/middleware/security-headers.js:32-43,66`), incl. `GET /api/user`. Afgezwakt risico: de api-server auth leest geen cookies (puur Bearer). Opruimen is netjes, geen blocker voor deze feature.

---

## 11. Self-review (plan-builder checklist)

- [x] Elke stap verwijst naar een echt bestand of symbool uit de evidence (paden gecorrigeerd na review: `auth.js` i.p.v. `config/auth.js` voor passport/TokenStrategy, `model/unique~code.js`, root `cypress/e2e/`, trailing slash op `/api/validation/code/`)
- [x] Geen vage werkwoorden zonder concreet doel
- [x] Alle onbekenden staan als expliciete precondities/beslissingen (P1-P7), niet in de planbody
- [x] Validatie-gates zijn concrete commando's of browseracties (§8), met de juiste testrunner per app (jest in apps, vitest in packages)
- [x] Scope verrekent bestaand werk (SSO-sessie, per-project storage, superuser-elevatie, connect-user-patroon, `clearClientAuth` worden hergebruikt, niet opnieuw gebouwd)
- [x] Alle vier de auth-server gates zijn gespiegeld in de exchange (geen stille 2FA-/telefoon-bypass)
- [x] Stappen zijn bite-sized, één actie per stap
- [x] Codeblokken aanwezig bij elke stap die code wijzigt

---

## 12. Kernteam-Q&A (V3) — besluiten en waar ze landen

Uit de feedbackronde met het kernteam. Alleen de punten met impact op de implementatie; commerciële/product-vragen (kosten, "sturen op één project") staan in het kernteam-document `plans/multi-project-login-kernteam.md` en raken de code niet.

| Vraag (kernteam) | Besluit | Weerslag in dit plan |
| --- | --- | --- |
| Kost aan/uitzetten geld of maatwerk? | Nee, puur de env-flag. | §1 (opt-in), §9 (rollback) |
| SSO koppelen/samenvoegen? | Externe SSO-users blijven per project aparte users; samenvoegen is werk voor de latere SSO-plugin, buiten dit plan. | §1 buiten scope |
| "Projecten" = admin-projecten? | Ja. | n.v.t. (terminologie) |
| CMS of Apostroph als host? | Maakt niet uit; site moet in `allowedDomains` staan (geldt al). | P4 |
| Verrijkt dit een profiel cross-project? | Ja; ontbrekende velden vullen de globale auth-server-user aan en worden hergebruikt. | §4 (exchange/`fields_required`), P1 |
| Beheerder maar 1x inloggen? | Adminpanel ongewijzigd; dit gaat over de site-kant (widgets/preview). | Taak 15 (scope-noot) |
| Bescherming tegen stemcode-raden nodig? | Ja, volgt rechtstreeks uit het nieuwe AJAX-endpoint. | Taak 5 (lockout), Taak 7 stap 4 (rate limit), P7, §10 |
| Uit Apostroph gegooid bij meerdere sites? | Zelfde oorzaak (gedeelde SSO-sessie + `forceNewLogin`); eerst deze feature, dan resterend CMS-werk (±1-2u). | Taak 15b |
| Word je in project A zichtbaar door alleen in B in te loggen? | Nee; user-rij ontstaat pas bij deelname, niet bij passief ingelogd zijn. Te bewaken invariant. | §10 (AVG-invariant) |
| Popup optimaliseerbaar over devices/widgets? | Ja; één gedeeld, responsive + toegankelijk component; browservenster alleen als fallback. | Taak 11, Taak 14 |
| Werkt de popup-blocked fallback on the fly? | Ja, automatisch per poging (terug naar redirect); losstaand van de env-flag. | Taak 12 stap 3, Taak 14 stap 2 |
