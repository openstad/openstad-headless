# Plan: fixes na browsertest multi-project login

> Status: **grotendeels uitgevoerd op 2026-10-07, zie §7** (niet gecommit)
> Bron: browsertest 2026-10-06 (Brave/Chromium, lokale stack, `MULTI_PROJECT_LOGIN=true`), curl-tests en code-review van branch `feat/one-login-for-all-projects-plan` (b9562fe3b)
> Testdata: project 4 (Url, likes-widget 8), project 5 (alleen stemcode, naam + postcode verplicht, likes-widget 9), project 6 (alleen stemcode, begroten, widget 10)

Elke bevinding: wat er gebeurde (bewijs), oorzaak, kleinste fix, de test die eerst moet falen, en of er een teambesluit nodig is (verwijzing naar open besluiten a–d uit de overdracht).

---

## 1. Blokkerend

### F1 — Taak 2 staat niet achter de vlag: `forceNewLogin` verdwijnt bij álle installaties

**Bewijs (getest):** met `MULTI_PROJECT_LOGIN=false` gaat een like-klik naar `/auth/project/5/login?useAuth=default&redirectUri=…`, zonder `forceNewLogin=1`. Vóór deze branch stond die er hard in.

**Oorzaak:** `apps/api-server/src/routes/widget/widget-default-config.js:2-6` kijkt alleen naar `project.config.auth.forceNewLoginOnWidgets`, niet naar de vlag. Dat is in strijd met §1 ("zonder flag is het functionele gedrag gelijk aan vandaag") en §9 ("vlag uit = rollback") van het plan.

**Gevolg:** na een upgrade krijgt elke installatie het gedeeld-apparaat-probleem uit F2, ook zonder opt-in.

**Fix:** default afhankelijk van de vlag:

```js
const forceNewLoginDefault = process.env.MULTI_PROJECT_LOGIN !== 'true';
const force = project.config?.auth?.forceNewLoginOnWidgets ?? forceNewLoginDefault;
```

**Test eerst:** `widget-default-config.test.js`: vlag uit en geen projectconfig → `forceNewLogin=1` in `login.url` en `login.anonymous.url`.

**Besluit:** nee, dit is gewoon plan-conform. Wat de default mét vlag wordt, valt onder F2.

### F2 — Gedeeld apparaat: volgende persoon wordt stil ingelogd als de vorige stemmer

**Bewijs (getest, Brave):**

1. Een eerdere stemmer (user 15, code `E4M6…`) had in deze browser een auth-server-sessie.
2. In widget 10 een plan kiezen en op "Vul je stemcode in" klikken. De popup flitst, zonder code, en de widget toont "Het controleren van je stemcode is gelukt": ingelogd als user 15. Console: `user authenticated: userId=15`, api: `digest-login complete: userId=15 projectId=6`.
3. "Vul een andere stemcode in" (volledige redirect) komt terug als dezelfde user 15. Er is geen manier om een andere code in te vullen.
4. Na het indienen "logt" stem-begroot uit met `currentUser.logout({ url: <huidige pagina> })` (`packages/stem-begroot/src/stem-begroot.tsx:986-1004`). Dat wist alleen localStorage (`packages/lib/local-storage.ts:60-62`) en herlaadt; de auth-server wordt niet aangeroepen. Dit was al zo vóór deze branch, maar toen ving `forceNewLogin=1` de volgende login af.
5. Met `forceNewLoginOnWidgets: true` op project 6 gaat "Vul een andere stemcode in" via logout naar het stemcodescherm. De mitigatie werkt.

**Oorzaak:** de sessie op de auth-server (gedeelde SSO) blijft na de "logout" van stem-begroot bestaan. Zonder `forceNewLogin` wordt hij bij de volgende login hergebruikt.

**Fix (gericht, los van de algemene default):** acties waarbij je expliciet van identiteit wisselt, forceren altijd een nieuwe login, ongeacht de projectconfig:

- **"Vul een andere stemcode in"** (`packages/stem-begroot/src/step-3/index.tsx`): login-URL altijd met `forceNewLogin=1`, en in de popup-variant ook (`popupLoginUrl` in `packages/data-store/src/login-flow.js`).
- **Logout na stemmen** (`moveToStep4AndLogout`): ook de auth-server-sessie beëindigen.
  - **Optie A:** via `config.logout.url` (api → auth-server `/logout`, met `redirectUri` terug naar de pagina).
  - **Optie B:** de eerstvolgende stemcode-login van die widget krijgt een "force"-markering (sessionStorage), zodat de popup of redirect `forceNewLogin=1` meekrijgt.
  - Optie A is zuiverder, maar vereist dat de embed-URL als logout-redirect is toegestaan (zie F9).

**Niet doen:** `storage.destroy()` per project laten wissen. Op een gedeeld apparaat blijven dan de tokens van A en B staan voor de volgende persoon. Dat hoort bij taak 8 (per-project logout), niet bij deze fix.

**Test eerst:**

- Unit: `step-3` "andere stemcode" bouwt een URL met `forceNewLogin=1` ook als `forceNewLoginOnWidgets` uit staat.
- Browser: stem met code X, wacht op de herlaad, klik op de stemcode-knop. Je moet een stemcodescherm of -dialog krijgen, niet "gelukt".

**Besluit (a/d):** welke default `forceNewLoginOnWidgets` met de vlag aan krijgt. Aanbeveling: aan voor projecten met `UniqueCode` als enige authType (stembureau-achtig), uit voor de rest.

---

## 2. Hoog

### F3 — `complete-fields` valideert waarden niet; project-user blijft half leeg terwijl de login slaagt

**Bewijs (getest):**

- Postcode `abc` in de dialog geeft `complete-fields` 200, en de auth-server slaat `abc` op (auth-user 8).
- api-log: `user update failed: userId=17 projectId=5 error=Validation error: Ongeldige postcode`.
- User 17 in project 5 heeft `name` en `postcode` NULL, maar krijgt wel een definitieve JWT, en de like telt mee.

**Oorzaak:**

- `inline-login-routes.js:269-291` stuurt de whitelisted waarden ongevalideerd naar `service.updateUser`.
- `upsertProjectUser` (`inline-login.js:99-111`) slikt de update-fout en geeft toch een `userId` terug.
- De api-validatie staat in `apps/api-server/src/models/User.js:350-355`.

**Fix:**

1. **Waarden valideren vóór `updateUser`**, met dezelfde regels als het api-model. Bij een fout: `422 { status: 'invalid_fields', invalidFields }`; dat contract bestaat al voor `accessCode`, en de dialog toont het al.
   - Hergebruik waar mogelijk de validators van het `User`-model (bijvoorbeeld `db.User.build(fields).validate({ fields: [...] })`) in plaats van regex-duplicatie.
2. **De upsert-fout niet meer slikken op het inline-pad:** een optie `throwOnUpdateError` of een aparte aanroep.
   - Digest-login gedraagt zich nu zo; dat gedrag niet ongemerkt wijzigen, en de keuze expliciet noteren.

**Test eerst:**

- `complete-fields` met `postcode: 'abc'` geeft 422 `invalidFields: ['postcode']`, en `updateUser` wordt niet aangeroepen.
- Faalt de upsert na de update, dan volgt een 5xx in plaats van een JWT.

**Besluit:** nee.

### F4 — Lockout per client is een DoS-knop voor een hele stemronde

**Bewijs (getest):**

- 205 foute codes met wisselende `X-Forwarded-For` (180× 401, daarna 429).
- Daarna geeft een **geldige** code vanaf een "nieuw" IP 429 `too_many_attempts`.
- Een andere client (project 6) werkt gewoon. De lock duurt 15 minuten en is direct te herhalen.
- Na 20 pogingen per IP grijpt de per-IP-lockout correct in, maar is te omzeilen met een vervalste `X-Forwarded-For`.

**Oorzaak:**

- Het plafond van 200 per client per 15 minuten (`apps/auth-server/utils/uniqueCodeLockout.js`) telt álle mislukte pogingen, ook die van een aanvaller.
- `trust proxy: true` maakt `req.ip` op de api-server vervalsbaar (`inline-login-routes.js:195`).

**Beperking van de schade:** alleen het inline-pad gebruikt deze lockout. Het stemcodescherm op de auth-server (popup of redirect) gebruikt hem niet, dus wie geen bekende identiteit heeft, merkt niets. Maar wie al in een ander project is ingelogd, krijgt de dialog en loopt vast.

**Fix-opties (besluit d):**

1. **`trust proxy`** beperken tot het werkelijke aantal proxy-hops (bijvoorbeeld `1`, of de ingress-CIDR), zodat `req.ip` betrouwbaar wordt. Dat is een kleine wijziging met grote impact en raakt alle rate limiting.
2. **Bij een actief plafond terugvallen op popup of redirect** in plaats van de dialog met 429: de frontend behandelt `too_many_attempts` op client-niveau als "gebruik de auth-server-flow". Daarvoor moet de response onderscheid maken tussen een lock per IP en per client.
3. **Plafond verhogen** of laten meeschalen met het aantal codes van de client.

**Aanbeveling:** 1 + 2.

**Test eerst:** unit op `uniqueCodeLockout` (plafond bereikt geeft een eigen status) en `useLoginFlow` (die status leidt naar de popup, niet naar een foutmelding).

### F10 — Popupvenster voor de eerste login: behouden, maar robuuster

**Besluit (Rudi, 2026-10-07):** de eerste login (nog geen bekende identiteit) blijft in een popupvenster (`window.open`), zoals taak 14. Er komt geen dialog in de widget voor e-mail of wachtwoord. De bestaande inline stemcode- en velden-dialog uit fase 3, die alleen opent bij een bekende identiteit, blijft ongewijzigd.

**Problemen die blijven bestaan en hier worden aangepakt:**

1. **Popup-blockers.**
   - `window.open` gebeurt pas na de async `exchange` (`packages/data-store/src/hooks/use-login-flow.js`). Daardoor valt het buiten de klik-gebeurtenis en wordt het eerder geblokkeerd.
   - De terugval naar een redirect werkt alleen als `window.open` `null` teruggeeft. Sluit een blocker of de gebruiker het venster direct, dan krijgt de gebruiker niets.
2. **Stille SSO via de popup is de oorzaak van F2** (de volgende persoon wordt de vorige).
3. **Magic link opent een nieuw tabblad zonder opener.** De popup blijft dan op "E-mail verstuurd" staan en de actie gaat niet door (bekend uit taak 14).
4. **Testbaarheid:** Claude in Chrome kan het popupvenster niet bedienen, en Cypress (taak 16) ook niet goed.

**Fixes:**

- **10a — Popup synchroon openen in de klik.**
  - `requireLogin` opent direct bij de klik een leeg venster: `window.open('about:blank', 'osc-login', …)`.
  - Daarna volgt de `exchange`.
  - Levert de exchange een JWT of een inline stap (stemcode, velden) op, dan sluit het venster weer.
  - Moet er wél via de popup worden ingelogd, dan krijgt hetzelfde venster de login-URL (`popup.location = loginUrl`).
  - Zo valt de opening binnen de klik en blokkeren browsers hem niet.
  - Nadeel: bij een bekende identiteit flitst er kort een leeg venster. Alternatief: alleen synchroon openen als er geen bekende identiteit is (dan is de popup zeker nodig) en anders eerst de `exchange` doen. Aanbeveling: dat alternatief, want het voorkomt het flitsen in de inline-gevallen.
- **10b — Blokkade of direct sluiten herkennen.**
  - Is het venster binnen ~1 s gesloten zonder `openstad-login`-bericht, of is `popup.closed` direct `true`, toon dan in de widget een melding met een knop "Inloggen in dit venster". Die knop doet de bestaande redirect, na `onBeforeRedirect`.
  - Niet automatisch redirecten: de gebruiker kan de popup ook bewust hebben gesloten.
  - De melding gaat via `role="status"` en de focus gaat naar de knop.
- **10c — Magic link in een nieuw tabblad oppikken.**
  - Geen code in de mail: de magic link blijft het enige mechanisme (besluit 2026-10-07).
  - Opent de link in een nieuw tabblad zonder opener, dan logt dat tabblad in zoals nu.
  - Zolang de popup open staat, luistert `useLoginFlow` via `onAuthChange` (het `storage`-event) of er een login voor dit project binnenkomt. Zo ja, dan sluit het de popup en resolvet `requireLogin` met `true`, zodat de actie (like of stem) alsnog doorgaat.
  - Alleen frontend, geen werk op de auth-server.
  - Op een ander apparaat logt alleen dat apparaat in, net als nu.
- **10d — Stille SSO beperken (samen met F2).**
  - De popup hergebruikt de auth-server-sessie alleen als dat veilig is.
  - Bij clients met alleen `UniqueCode`, bij `forceNewLoginOnWidgets` en bij expliciete identiteitswissels gaat `forceNewLogin=1` mee in de popup-URL (`popupLoginUrl` in `packages/data-store/src/login-flow.js`).
  - Bij `Url`/`Local`-clients blijft stille SSO bestaan; dat is wat de admin-flow uit taak 15 gebruikt.
- **10e — Testbaarheid.**
  - Cypress (bestaande setup, taak 16) ondersteunt geen tweede venster of tab. Een echte popup kan het dus niet volgen. Wel te testen door `window.open` te stubben (`cy.stub(win, 'open')`):
    - controleren dat het synchroon met de juiste URL wordt aangeroepen;
    - daarna de login-URL in hetzelfde venster bezoeken;
    - of het `openstad-login`-bericht simuleren met `win.postMessage`.
  - Daarmee is de logica van de widget gedekt, maar niet het echte popupvenster met de auth-server-schermen.
  - Voor die volledige flow: Playwright (`page.waitForEvent('popup')`), of handmatig.
  - Voor handmatige tests met Claude in Chrome blijft de redirect-fallback (10b) bruikbaar.
  - F8b (postMessage naar een `http:`-origin) blijft relevant.

**Admins op een externe site:**

- Blijft zoals taak 15 heeft geverifieerd: één klik, de popup flitst en sluit via stille SSO, ook met 10d (admins loggen in via `Url`/`Local`).
- Op de site-kant krijgt de admin de rol die de auth-server voor die client geeft (`member` in de test), geen `superuser`.
- Nul klikken op een extern domein kan niet zonder third-party cookies (taak 15 stap 4). Volgens het oorspronkelijke plan wordt dit alleen gedocumenteerd (taak 17).

**Test eerst:**

- **`useLoginFlow`:**
  - geen identiteit → `window.open` wordt synchroon in de klik aangeroepen, vóór enige `await`;
  - venster direct gesloten zonder bericht → status "geblokkeerd" en geen automatische redirect;
  - storage-wijziging voor het eigen project terwijl de popup open is → resolve `true` en popup sluiten.
- **`popupLoginUrl`:** met `forceNewLogin` bij UniqueCode-clients, zonder bij Url-clients.
- **Browser (Playwright of handmatig):** uitgelogd → like → popup → e-mail → magic link uit mailpit in een nieuw tabblad → popup sluit vanzelf → like geregistreerd zonder reload.
- **Cypress:** `window.open` gestubd: synchroon aangeroepen met `popup=1`, en een gesimuleerd `openstad-login`-bericht leidt tot een geregistreerde like.

---

## 3. Middel

### F5 — Focus raakt kwijt na een geslaagde inline login (WCAG 2.4.3)

**Bewijs (getest):** na Escape gaat de focus correct terug naar "Ja02 stemmen". Na een geslaagde stemcode- plus velden-login staat `document.activeElement` op `BODY`.

**Vermoedelijke oorzaak (nog niet bevestigd):** `LoginDialog` (`packages/ui/src/login-dialog/index.tsx:232-239`) zet de focus alleen terug als `target.isConnected`. Bij succes rendert de widget opnieuw (currentUser verandert), het knop-element wordt vervangen en het opgeslagen element bestaat niet meer.

**Fix:** de focus-terugkeer overlaten aan de widget. Bijvoorbeeld:

- `requireLogin` resolvet pas na de re-render, en de widget zet de focus op de (nieuwe) knop via een `ref`; of
- `LoginDialog` krijgt een `returnFocusRef`-prop, zodat de widget een stabiel element meegeeft.

**Test eerst:** browsertest (focus na succes op de like-knop). Unit is lastig zonder testing-library.

### F6 — Enter in een heropende stemcode-dialog leek de eerste keer niet te verzenden

**Bewijs (niet bevestigd):** na heropenen en direct typen plus Enter ging er geen `uniquecode-login`-request uit. De tweede Enter werkte wel. Mogelijk timing: Enter tijdens de lopende `exchange` (busy?).

**Actie:** eerst handmatig reproduceren. Is dat bevestigd, dan bij `busy` het formulier niet stil negeren maar de submit uitstellen of zichtbaar uitschakelen.

### F7 — UniqueCode maakt een aparte identiteit; geen profielverrijking over projecten heen

**Bewijs (getest):** ingelogd in project 4 als "Tester Een" (auth-user 7). De stemcode-login in project 5 maakt auth-user 8 aan, die opnieuw om **Naam** vraagt.

**Oorzaak:** `uniqueCodeLogin` op de auth-server koppelt een ongebruikte code aan een **nieuwe** user (zoals de interactieve flow ook doet).

**Besluit:** dit botst met het kernteam-antwoord "ontbrekende velden vullen de globale user aan". De code koppelen aan de ingelogde identiteit zou stemmen herleidbaar maken tot een e-mailadres.

**Aanbeveling:** gescheiden houden, en in de docs (taak 17) en het kernteam-document vastleggen dat verrijking niet geldt voor stemcode-projecten.

### F8 — Rest uit code-review (niet in de browser getest)

| # | Bevinding | Plek | Fix |
|---|---|---|---|
| F8a | De CMS pakt `openstadlogintoken` van elk project af, zonder `openstadprojectid` te vergelijken | `apps/cms-server/modules/openstad-auth/index.js:74-91` | Alleen consumeren bij een `openstadprojectid` gelijk aan het CMS-project, of zonder param (BC) |
| F8b | Popup-postMessage gaat naar de origin van een `http:`-returnTo: de allowlist vergelijkt alleen de host | `apps/api-server/src/adapter/openstad/router.js:214-229`, `popup-login-page.js` | In productie (`NODE_ENV=production`, geen `FORCE_HTTP`) alleen een `https:`-origin toestaan |
| F8c | Race bij eerste gebruik van een code: twee gelijktijdige requests maken twee users | `apps/auth-server/controllers/admin/api/uniqueCodeLogin.js:51-53` | Conditionele update `UPDATE … SET userId=? WHERE id=? AND userId IS NULL` plus herlezen; bij verlies de gemaakte user opruimen |
| F8d | De jwtSecret-check faalt niet hard: de server luistert eerst, en een DB-fout wordt alleen gelogd | `apps/api-server/server.js:40-53`, `src/util/auth-settings.js:66-77` | Check uitvoeren vóór `Server.start()`; bij een DB-fout ook stoppen. `assertNoJwtSecretOverrides` gebruiken of verwijderen |
| F8e | Plan §1 noemt `MULTI_PROJECT_LOGIN=1`, de code eist `'true'` | plan §1 | Plan aanpassen, of in de code `['1','true'].includes(...)` accepteren (één helper) |
| F8f | Plandocument loopt achter: taak 1–4 niet afgevinkt, kop "gereed voor uitvoering", taak 10 stap 4 claimt gescheiden seed-keys terwijl stap 3 is uitgesteld | `plans/multi-project-login.md` | Bijwerken |
| F8g | De submit-gate van stem-begroot (`stem-begroot.tsx:~1354`) gebruikt nog geen `requireLogin` | stem-begroot | Bewust? Zo ja, als afwijking in taak 13 vastleggen |

### F9 — Logout-redirect naar een embed-URL met poort geweigerd (lokaal artefact?)

**Bewijs (getest):** `auth-logout redirect not allowed: clientId=7 requested=http://localhost:8090/?openstadlogout=true`, terwijl `allowedDomains` `localhost` bevat. Daardoor bleef de JWT van user 15 in localStorage staan. De api-kant matcht alleen op host, de auth-server (`safeRedirectUri`, `apps/auth-server/controllers/auth/local.js:204-219`) waarschijnlijk op host plus poort.

**Actie:** eerst controleren of dit alleen lokaal speelt (in productie geen poorten). Is dat zo, dan alleen documenteren. Het raakt wel F2 optie A.

---

## 4. Wél bevestigd goed (browser of curl)

- **Stemcode-dialog:** `exchange` geeft 409 en de dialog opent zonder reload. Bij openen staat de focus in het veld, `aria-labelledby` wijst naar de titel en de sluitknop heeft `aria-label="Sluiten"`.
- **Foute code:** `role="alert"` met "Deze stemcode is niet geldig.", plus `aria-invalid` en `aria-describedby` op het veld.
- **Escape:** sluit zonder redirect, de focus gaat terug naar de knop en de knop werkt weer.
- **Velden-stap:** toont de projectlabels; daarna telt de like (user 17).
- **Meerdere projecten tegelijk ingelogd:** keys 4, 5 en 6 met elk een eigen JWT. Bij laden één `/me` per project.
- **Lockout:** na 20 foute pogingen per IP volgt 429, ook voor een geldige code.
- **pendingJwt:**
  - als Bearer op `/me` → anoniem, op `vote` → 401;
  - als `sourceJwt` voor `exchange` → 401;
  - op `complete-fields` van een ander project → 401.
- **Whitelist van `complete-fields`:** `role`, `email` en `isAdmin` worden genegeerd.
- **Vlag uit:** `exchange` geeft 404, `multiProjectLogin:false` en de oude redirect-flow, maar zie F1.
- **Passieve privacy-invariant (gedeeltelijk):** bij laden van een pagina met widgets van projecten waar de gebruiker niet is ingelogd, gaan er geen `exchange`-calls uit; die volgen pas op een klik. De database heb ik hiervoor niet apart gecontroleerd.

## 5. Niet getest

- **Interactieve popup** (e-mail of code invullen in het popupvenster): de extensie kan popupvensters niet bedienen. Alleen het stille SSO-pad van de popup is waargenomen. Zie F10e voor testbaarheid.
- **accessCode** als verplicht veld.
- **2FA- en telefoonflow.**
- **Firefox en Safari.**
- **CMS-pagina** met widgets van meerdere projecten (F8a).
- **Geblokkeerde popup** terug naar redirect.

## 6. Voorgestelde volgorde

1. F1 (vlag-gate) — klein, blokkeert merge.
2. F2 (identiteitswissel forceert een nieuwe login) — na besluit over de default.
3. F3 (validatie van `complete-fields`).
4. F10a–F10d (alleen frontend, klein, samen met F2).
5. F4 (`trust proxy` + terugval bij plafond) — na besluit d.
6. F5, F8a–F8d.
7. F6/F9 eerst reproduceren; F7 en F8e–g zijn docs en plan.

Per fix: eerst de falende test, dan de fix, dan de browsertest uit dit plan opnieuw.

## 7. Uitvoering 2026-10-07

Unit-tests: `npx vitest run` in de root, 100 bestanden groen. Elke nieuwe test faalde eerst.

| # | Resultaat | Geverifieerd |
|---|---|---|
| F1 | `forceNewLoginOnWidgets ?? (MULTI_PROJECT_LOGIN !== 'true')` | unit + curl op `/widget/9` met vlag uit en aan |
| F2 | Default met vlag aan: **server-side** in de eerste `/login`-middleware (`shouldForceNewLogin`). Forceert bij clients met alleen `UniqueCode` als het project niets expliciet zet. Marker `newLoginDone=1` tegen de lus. "Vul een andere stemcode in" forceert altijd. Logout na stemmen: **optie A** via `logout.url` (alleen met de vlag aan). | Browser (widget 10): stemcodescherm in plaats van stil inloggen als vorige stemmer. Na de logout geeft een login zonder force ook het stemcodescherm, dus de auth-sessie is weg. |
| F10a | Popup synchroon in de klik als er geen bekende identiteit is | unit + browser |
| F10b | Geblokkeerd of binnen 1,5 s dicht: dialogstap `blocked` met de knop "Inloggen in dit venster" (`role="status"`, `aria-describedby`, autofocus). Geen automatische redirect. | unit + browser |
| F10c | Polling op localStorage (500 ms) in plaats van het `storage`-event: nieuwe JWT voor het eigen project, dan popup sluiten en resolve | unit + browser (magic link uit Mailpit in een tweede tabblad, like zonder reload) |
| F10e | Cypress-spec `cypress/e2e/2-multi-project-login/popup-login.cy.js`, zelfvoorzienend (besluit Rudi): via de fixed admin-token maakt hij een project met alleen `UniqueCode` (`requiredUserFields: []`), een stemcode, een resource en een likes-widget aan. De hostpagina is een `cy.intercept` op `ADMIN_URL`. `window.open` is gestubd met een verborgen iframe; de iframe dient als echte `source` voor het bericht. Controles: één aanroep met `'about:blank'`, binnen de klik (`window.event` is de klik), daarna navigeert de popup naar `/login` met `popup=1` (geïntercept). De JWT komt via `uniquecode-login`; na het `openstad-login`-bericht volgt een vote-POST 200, `aria-pressed="true"` en `yes: 1` in de API. `MULTI_PROJECT_LOGIN=true` staat in `docker-compose.e2e.yml` (api + auth); `API_URL` en `API_FIXED_AUTH_KEY` in `expose`. | Lokaal groen. Mutatietests op de likes-dist in de container (daarna teruggezet): `window.open` na een microtask → faalt op "opened within the click"; ander berichttype → faalt op het uitblijven van de vote. De eerste detector (bubble-listener op `window`) ving de async-mutatie níet, door `e.stopPropagation()` in `doVote`; daarom `window.event`. |
| F10d | Geen extra frontend-code nodig: F2 server-side plus `login.url` met `forceNewLogin` bij expliciete projectconfig | |
| F3 | `findInvalidFields` (validators van het api-`User`-model), 422 `invalid_fields`, en de dialog markeert alleen de afgewezen velden. Het inline-pad gooit bij een upsert-fout (`throwOnUpdateError`); digest-login slikt de fout nog steeds. | unit + browser (widget 9) |
| F4a | `TRUST_PROXY` (`packages/lib/trust-proxy.js`), default `true` en dus ongewijzigd. Helm via `extraEnvVars`, lokaal via `docker-compose.yml`. | unit |
| F4b | Lockout geeft `scope` mee, de api maakt er `client_locked` van, de widget valt terug op de popup | unit + curl (na 200 foute codes: `client_locked`) |
| F5 | **Niet gereproduceerd**. In de variant code → velden → afgewezen postcode → correctie stond de focus daarna op de like-knop. De oorspronkelijke flow niet opnieuw getest. | browser |
| F8a | De CMS consumeert het token alleen bij eigen of ontbrekende `openstadprojectid` | unit |
| F8b | `returnTo` moet in productie `https:` zijn (behalve met `FORCE_HTTP`), voor redirect en popup. **Ook met de vlag uit** (besluit Rudi). | unit |
| F8c | Conditionele claim `UPDATE … WHERE userId IS NULL`; de verliezer ruimt zijn user op en wordt de winnaar | unit |
| F8d | `assertNoJwtSecretOverrides` vóór `Server.start()`, stoppen bij een DB-fout. Het schema komt uit aparte init-stappen. | unit + opstarten lokaal |
| F8e | Plan §1 aangepast naar `MULTI_PROJECT_LOGIN=true` | |
| F8g | De verwijzing klopte niet. Stem-begroot heeft geen submit-gate die naar de login redirect; stap 3 gebruikt al `requireLogin`. Geen code nodig. | code gelezen |
| F8f | Taak 1–4 afgevinkt met bewijs. Taak 4 stap 4 (cookie vóór/na login) in de browser gecontroleerd: sid wisselt bij de stemcode-login, de oude sessierij is weg en de nieuwe bevat de user. Taak 10 stap 4 claimt de seed-keys niet meer. | code + tests |
| F9 | Alleen lokaal: productie-URL's hebben geen poort, en de `allowedDomains` van de client worden bij create/update overgenomen van het project (`service.js`). Lokaal omzeild door `localhost:8090` toe te voegen aan client 7. | |

**Bekende gaten (bewust, besluit Rudi):**

- De auth-server valideert `postcode` niet op de server (alleen in de browser). Via het popup- of redirect-pad kan een half lege project-user met een geldige JWT ontstaan, omdat digest-login updatefouten slikt.
- `exchange` geeft een 500 bij een identiteit met oude ongeldige data. De widget valt dan terug op de popup.
- `user_roles` heeft geen unique-index op `(clientId, userId)`: bij een gelijktijdige eerste stemcode-login zijn dubbele rol-rijen mogelijk.

**Nieuw gevonden (al in v2.8):** `GET /auth/project/:id/digest-login` met een toegestane `returnTo` en zonder `code` gooit in een async handler (`throw createError(403, …)`). Dat geeft een unhandled rejection en laat het api-proces stoppen. **Opgelost** in deze branch met `return next(createError(…))`; routetest `router.digest-login.test.js`.

**Gedrag dat ook verandert met de vlag uit:**

- `returnTo` moet https zijn;
- de CMS kijkt naar `openstadprojectid`;
- de lockout-429 bevat `scope`;
- `newLoginDone=1` wordt aan de login-URL toegevoegd;
- de API start niet bij een DB-fout tijdens de jwtSecret-check.

**Documentatie:** `doc/setup-options.md` beschrijft nu `MULTI_PROJECT_LOGIN` (inclusief F7: stemcode-identiteit blijft gescheiden, de popup-beperking en de default van `forceNewLogin`), `TRUST_PROXY` en de https-eis. De rest van taak 17 staat in `doc/multi-project-login.md` (Engels): request/response-contracten van `exchange`, `uniquecode-login` en `complete-fields` (inclusief alle 4xx-statussen en wat de widget ermee doet), het exchange-beleid (2FA en telefoon nooit stil), lockout en rate limiting, P7 (stemcodes zijn herbruikbare credentials), logout (nog globaal) en de bekende gaten. Contracten zijn uit de code overgenomen, niet uit het plan. Gelinkt vanuit `setup-options.md`, geformatteerd met Prettier.

**Helm:** `multiProjectLogin` (values.yaml) zet `MULTI_PROJECT_LOGIN` op de api- en auth-container, gecontroleerd met `helm template`.

**Nog open:**

- F6 reproduceren: de browsertest liep vast op een overlay van een andere extensie op het codeveld. Handmatig testen.
- F10e in CI: de spec en de admin-smoketest zijn niet gedraaid op een verse e2e-stack met de vlag aan. De smoketest loopt nu ook met `MULTI_PROJECT_LOGIN=true`.
