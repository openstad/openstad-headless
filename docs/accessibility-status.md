# Toegankelijkheid (WCAG 2.2) — overzicht & handoff

Centrale status voor de audit-remediatie van `audit.draad.dev` (audit 16-07-2026).
**Branch:** `fix/accessibility-3-3`. Laatst bijgewerkt: 03-08-2026.

Dit is het startpunt voor een nieuwe sessie. Detail per onderdeel staat in aparte docs;
de volledige audit-analyse staat lokaal in `.claude/` (niet gecommit).

## Bron-analyse (lokaal, `.claude/`)

- `.claude/audit-split.md` — alle 27 audit-bevindingen gesplitst in **content** vs **build**.
- `.claude/audit-per-onderdeel.md` — bevindingen gegroepeerd per widget/onderdeel (met C/B per regel).

## Detail-status per afgeronde batch

- `docs/accessibility-enquete-status.md` — enquête (13 punten).
- `docs/accessibility-navbar-status.md` — navBar (5 punten).
- Reacties (5 punten) — detail staat inline in dit document (zie ✅ Afgerond).

---

## ✅ Afgerond

### Enquête (13 punten) — commits `db7120bd3` … `ad371e364`

Alle punten gefixt, gebouwd en op 320px in de browser geverifieerd. Kort:
label-for koppeling (map/uploads), matrix lege hoekcel + scope, autocomplete,
video autoplay uit + animatie stoppen, FilePond-groen contrast, UI-contrast
(scorebalk/dots/zoom), focusvolgorde bij paginawissel, Engelse FilePond-knoppen,
slider-schaaluitleg als sr-only, InfoField-titel als echte heading.
**Reflow (1.4.10)** volledig doorlopen op 320px incl. de kaart (grid `min-width:0`),
document-/afbeelding-upload, en swipe (kaartstapel + toelichting-modal via React-portal

- box-sizing + samenvatting-grid `minmax(min(250px,100%),1fr)`). Plus onderweg:
  swipe-toelichting-textarea's `aria-label`.

### navBar (5 punten) — commits `10a822ba3`, `c2b6d7a1c`, `5d6ff7f17`

Submenu als `ul/li` (1.3.1), Escape sluit + focus terug (1.4.13), chevron togglet en is
klikbaar — `pointer-events:none` weg (2.4.4), chevron target ≥24px + negatieve marge weg
(2.5.8), en eigen `#navbar .sr-only` (globale `.osc .sr-only` matchte niet). Keuze: link +
chevron blijven **gesplitst** (split-navigation), nu volledig toetsenbord/muis/touch + Escape.
Live geverifieerd op de demo (31490).

### Reacties (5 code-punten) + gedeelde filter/paginator — commit `329f82fc9`

Alle 5 code-punten gefixt, gebouwd **en live geverifieerd** op de demo (`/inzendingen`,
`/inzendingen/resource?openstadResourceId=17`). De 6e (lege kop) is content — zie content-acties.

| Crit           | Fix                                                                                                           | Bestand                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1.3.1          | Paginering nu `<ul>/<li>` in bestaande `<nav aria-label="Paginering">`                                        | `packages/ui/src/paginator/index.tsx`                                    |
| 1.4.4          | Paginering-reflow: `.osc-paginator-list { flex-wrap:wrap; list-style:none }` (comments-centrering geretarget) | `packages/ui/src/paginator/index.css`, `packages/comments/src/index.css` |
| 2.4.11 / 2.4.3 | Collapsible filter-popup: Tab-focus gevangen, Escape sluit + focus terug naar toggle-knop                     | `packages/ui/src/stem-begroot-and-resource-overview/filter/index.tsx`    |
| 3.3.2          | Reactie-textarea heeft nu zichtbaar `<label>` "Uw reactie" (placeholder telt niet)                            | `packages/comments/src/parts/comment-form.tsx`                           |
| 1.1.1 / 2.4.6  | Zoek-submit sr-only "Filters toepassen" → "Zoeken"                                                            | `packages/ui/src/stem-begroot-and-resource-overview/filter/index.tsx`    |

**Meegelift (gedeelde componenten):** de focus-trap + zoek-icoon zitten in de gedeelde `Filters`, en de
paginator-fix in de gedeelde `Paginator` → dit fixt in één klap ook **Zoekbalk (#10)** en
**Filter-zijbalk (#11)** op inzendingen-overzicht + projectenoverzicht.

**Rebuild:** omdat deze componenten per widget mee-gebundeld worden (zie build-valkuil onder), zijn
**alle 10 consumers** herbouwd: `comments`, `resource-detail`, `resource-detail-with-map`,
`resource-overview`, `resource-overview-with-map`, `document-map`, `leaflet-map`, `stem-begroot`,
`multi-project-resource-overview`, `simple-voting`. Verificatie: geen enkele `dist/*.iife.js` bevat
nog "Filters toepassen".

**Live-verificatie (ingelogd, 27-07-2026):** label "Uw reactie" gekoppeld via `element.labels` op beide
sentiment-textarea's; paginator rendert `‹ 1 2 ›` als `<ul>`/`<li>` zonder bullets, `flex-wrap:wrap`,
`aria-current="page"`; filter-popup Tab-trap beide richtingen (`preventDefault`) + Escape sluit
(`aria-hidden=true`) en focus terug op toggle; zoek-submit leest `sr-only "Zoeken"`.

### Stemmodule + Begrootmodule (4 punten) — gedeelde `Stepper` — commit `5a3e6083e`

Alle 4 code-punten gefixt in de gedeelde stappen-tijdlijn `packages/ui/src/stepper/` en **live geverifieerd**
op de admin-preview (stemmodule, poort 31470). Omdat stemmodule (`simple-voting` → wrapt `stem-begroot`) én
begrootmodule dezelfde `Stepper` renderen, fixt dit **beide widgets in één klap**.

| Crit   | Fix                                                                                                                                                                                                                                                         | Bestand                                           |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| 1.3.1  | `aria-current="step"` op de actieve stap — was al aanwezig, live bevestigd (behouden bij refactor)                                                                                                                                                          | `packages/ui/src/stepper/index.tsx`               |
| 1.4.1  | `done`-stap toont een `✓`-vinkje (`aria-hidden`) i.p.v. het cijfer → niet-kleur-onderscheid t.o.v. `active` (in dit thema is de done-cirkel bovendien wit-op-wit, dus het vinkje is de énige zichtbare done-indicatie)                                      | `packages/ui/src/stepper/index.tsx` + `index.css` |
| 1.4.10 | Reflow: `flex-wrap:wrap` verplaatst naar de juiste laag (`.stepper-list`, de `<ol>`); stappen `flex-basis:100%` + decoratieve dividers verborgen onder `max-width:480px` → verticale stack, geen horizontale scroll                                         | `packages/ui/src/stepper/index.css`               |
| 1.4.12 | Stapnummer viel buiten het rondje bij text-spacing: vaste `width/height` → `min-width/height` + `aspect-ratio:1` + `box-sizing:content-box`, cijfer `margin:0;line-height:1` → rondje groeit rond mee (geverifieerd 28×28 → 30×30 rond bij line-height 1.5) | `packages/ui/src/stepper/index.css`               |

**Rebuild:** `simple-voting` én `stem-begroot` herbouwd (Stepper wordt per widget mee-gebundeld). Fix aanwezig
in beide `dist/*.css`.

### Keuzewijzer (4 punten) — `packages/choiceguide`

Score-punten **live geverifieerd met echte data** (dummy keuze-opties + scoorbaar veld + gewichten in demo-widget 30):
de scores renderen nu als tekst naast de balk (bv. "88%"/"89%") binnen een `role="status"` live region.

| Crit          | Fix                                                                                                                                                                                                                                                                             | Bestand                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| 1.3.1 + 1.4.1 | Scorewaarde als zichtbare tekst naast de balk (hergebruik bestaande, tot dan dode `.osc-with-percentage`/`.osc-percentage`-CSS) → voorleesbaar **én** niet-kleur. Plus lege-kop-guard: geen `<h4>` meer als de titel ontbreekt.                                                 | `choiceguide/src/includes/sidebarItem.tsx` |
| 1.4.4         | Mobiel/zoom-paneel (`max-width:768px`, `position:fixed`) krijgt `max-height:calc(100vh - 20px)` + `overflow-y:auto` → paneel blijft binnen beeld en de collapse-knop bovenaan bereikbaar. ⚠️ 200%-zoom nog handmatig te checken (automation-browser forceert de viewport niet). | `choiceguide/src/style.css`                |
| 2.4.11        | Keuzewijzer heeft **geen eigen filter** (0 hits); verschijnt er één dan is het de al-gefixte gedeelde `Filters` → niets te doen.                                                                                                                                                | —                                          |

**Meegelift:** `choiceguide-results` hergebruikt dezelfde `ChoiceItem`/`Sidebar` → percentage-tekst werkt daar ook;
clearfix voor de gefloate balk+percentage toegevoegd. **Rebuild:** `choiceguide` + `choiceguide-results`.
Kanttekening: `choiceguide-results/src/style.css` is een **gedupliceerde kopie** van de choiceguide-CSS — losse opschoning waard.

### Interactieve kaart + Interactieve afbeelding — volledig (§3 + §15)

Twee losse kaart-implementaties, beide voorzien van een **kompas** (↑↓←→ pan-knoppen, single-pointer, geen slepen)
en een **"Plaats … in het midden"-knop** (keyboard) met een centraal **kruisje** dat toont waar het landt.
Knoppen zijn focusbaar met zichtbare focus-outline en ≥40px targets.

| Onderdeel                                      | Component                                           | 2.5.7 kompas                | 2.1.1 plaatsen                                                                                                                                                                           |
| ---------------------------------------------- | --------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Interactieve **kaart** (geografisch, audit §3) | `leaflet-map/src/base-map.tsx` + `css/base-map.css` | pan-knoppen → `map.panBy()` | plaats-knop → synthetisch `onClick({latlng: map.getCenter(), isInArea})`; laat `EditorMap.updateLocation` ongewijzigd de marker/locatie zetten. `role="status"` sr-melding bij plaatsen. |
| Interactieve **afbeelding** (audit §15)        | `document-map/src/document-map.tsx` + `.css`        | idem                        | plaats-knop → `setPopupPosition(map.getCenter())` opent het bestaande reactie-popupformulier; focus springt naar de textarea.                                                            |

**Kompas raakt álle kaart-gebruikers**; de plaats-knop + kruisje tonen alleen waar plaatsen mogelijk is
(`onClick` aanwezig resp. `canComment && !isDefinitive`).

**StrictMode-crash ("Map container is already initialized"):** gereproduceerd in de `leaflet-map` dev-harness.
Oorzaak = react-leaflet v4 maakt de Leaflet-instance bij ref-attach; StrictMode's synchrone dubbel-attach
botst op de nog-geïnitialiseerde container. **Productie is niet geraakt:** `lib/load-widget.tsx` rendert
`<Component/>` **zonder** StrictMode (geen dubbel-invoke). Toegevoegd als hardening voor echte unmount/remount
via de widget-loader: expliciete `map.remove()`-cleanup in `base-map.tsx` + wissen van de globale
`window.oscMap`-cache in `map-consumer.tsx` (was een leak/stale-ref). De resterende dev-only StrictMode-ruis is
een react-leaflet-limitatie (fix: StrictMode uit de dev-harness óf react-leaflet upgraden — losse keuze).

**Rebuild:** BaseMap/EditorMap worden per widget gebundeld → herbouwd: `leaflet-map`, `resource-overview(-with-map)`,
`resource-detail(-with-map)`, `resource-form`, `stem-begroot`, `enquete`, `choiceguide`, `document-map`.
**Live geverifieerd** (harness zonder StrictMode): pannen verschuift de kaart, "Plaats op het midden" zet de
marker op het kruisje/centrum.

**Resterende kaart-punten uit de audit (code geverifieerd in de bundles):**

| Crit   | Onderdeel | Fix                                                                                                                                                                                                                                                | Bestand                                                          |
| ------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 2.4.4  | §3 kaart  | Marker-popup-link "Lees verder" → `aria-label="Lees verder over {title}"` (linkdoel duidelijk).                                                                                                                                                    | `leaflet-map/src/area.tsx`                                       |
| 1.1.1  | §3 kaart  | Gedeelde `Image` forceerde altijd `role="presentation"` → een meegegeven `alt` werd genegeerd. Nu conditioneel: `role` alleen `presentation` zónder alt. (Popup zelf heeft geen `<img>`.)                                                          | `ui/src/image/index.tsx`                                         |
| 1.4.10 | §3 kaart  | Reflow: overzicht klapt al naar 1 kolom via `@container` (`.map-wrapper` heeft `container-type`), detail via `@media`. Hardening: `min-width:0` op grid-kinderen + kapotte `@container(`-syntax gerepareerd. ⚠️ nog handmatig op 320px te checken. | `resource-overview-with-map` + `resource-detail-with-map` `.css` |
| 2.4.3  | §15 afb.  | Bij openen van een marker-popup springt focus nu ín de popup (close-knop) i.p.v. op de zoom/info-knoppen die in de DOM ervóór staan.                                                                                                               | `document-map/src/document-map.tsx`                              |
| 4.1.2  | §15 afb.  | Icon-only "Terug naar boven"-knop kreeg `aria-label` + `aria-hidden` op het icoon.                                                                                                                                                                 | `document-map/src/document-map.tsx`                              |

⚠️ **Verificatie-caveat:** deze 5 zijn code + bundle geverifieerd, maar niet los live (document-map dev-harness heeft
een pre-existing render-loop; de §3-popup/Image vergen een geconfigureerde resource-kaart-widget). 1.4.10 vraagt nog
een handmatige 320px-check.

### Widget-batch (losse punten) — commits `0f7727dea`, `32d999737`

Losse audit-punten over kleinere widgets, allemaal via het api-server-pad (build → live). **Code + build geverifieerd**
(nog niet allemaal los live). Gedekt:

| Crit  | Fix                                                                                                                                   | Bestand                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1.1.1 | like/reactie-duimen `aria-hidden` + altijd een (sr-only) naam, ook in small/micro-variant                                             | `likes/src/likes.tsx`, `comments/src/parts/comment.tsx`         |
| 4.1.2 | carousel prev/next `aria-label="Vorige/Volgende afbeelding"`                                                                          | `ui/src/carousel/index.tsx`                                     |
| 1.3.1 | agenda: enkele link niet in een lijst (pas bij ≥2 een `<ul>`)                                                                         | `agenda/src/agenda.tsx`                                         |
| 1.3.1 | dubbel `id="search"` weg → `useId()` in de gedeelde filter                                                                            | `ui/src/stem-begroot-and-resource-overview/filter/index.tsx`    |
| 4.1.3 | verdeelmodule fout-containers + gedeelde `NotificationProvider` → `role="status"`/`aria-live` (dekt emoji-slider "Enquête ingediend") | `distribution-module/...tsx`, `lib/NotificationProvider/...tsx` |
| 1.4.1 | beeldkiezer: zichtbare "✓ Gekozen"-badge op de gekozen optie                                                                          | `ui/src/form-elements/image-choice/index.tsx`                   |
| 1.3.5 | autocomplete op account (naam/gebruikersnaam/adres) + postcode-veld                                                                   | `account/src/account.tsx`, `ui/src/location/index.tsx`          |
| 1.4.4 | teller-cijfer niet meer afgesneden bij 200% (`overflow`/relatieve padding)                                                            | `counter/src/counter.css`                                       |

⚠️ **Postcode-autocomplete-caveat:** het postcode-veld is een custom combobox (`role="combobox"`); browser-autofill kan
met de suggestielijst botsen — functioneel testen. **Teller 1.3.1/1.3.2 bleek al gefixt** (aria-label stond er al).

### CMS-contentwidgets — commit `f7001b462`

CMS/apostrophe-pad (build → kopie naar `apps/cms-server/public/widget-assets/` → `docker restart cms-server`;
scss hercompileert bij restart). Lokaal gedeployd; live-audit-verificatie volgt bij deploy naar audit.draad.dev.

| Crit  | Fix                                                               | Bestand                                                         |
| ----- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| 1.1.1 | accordeon-chevron (Utrecht-svg) via ref+`useEffect` `aria-hidden` | `apostrophe-widgets/accordion/src/accordion.tsx`                |
| 1.3.1 | share-links nu `<ul>/<li>` i.p.v. losse div-links                 | `apostrophe-widgets/share-links/src/share-links.{tsx,css}`      |
| 1.4.3 | tijdlijn-blok (#f3f3f3) linkkleur `#0b5394` (≥4,5:1)              | `cms-server/modules/openstad-timeline-widget/ui/src/index.scss` |

### Auth/login — commit `fa4a1be88`

`apps/auth-server` (bind-mount; `docker restart openstad-auth-server`).

| Crit  | Fix                                                | Bestand                                                      |
| ----- | -------------------------------------------------- | ------------------------------------------------------------ |
| 2.4.6 | 'Neem contact met ons op' → 'Stuur ons een e-mail' | `views/auth/choose.html`, `views/auth/url/confirmation.html` |
| 2.5.3 | `aria-label="close message"` → `"sluit melding"`   | `views/elements/flash.html`, `error-flash.html`              |
| 3.3.1 | e-mail-foutmelding ontkennend i.p.v. instructie    | `public/javascripts/jquery.validate.nl.js`                   |

**⚠️ Nagekomen (03-08-2026, na live-check):** de eerste 2.4.6-fix miste de pagina die de audit
juist noemde. De contactlink op de **"Bevestig jouw e-mailadres"**-loginpagina zit in
`views/auth/url/login.html` (regel 61) + de default `helpText` in `config/auth.js` — die stonden nog
op "neem contact met ons op." Nu ook omgezet naar "stuur ons een e-mail", plus dezelfde mailto-link in
de sms-flow (`config/auth.js` `smsCodeHelpText`) en de two-factor-pagina (`views/auth/two-factor/authenticate.html`).
(De variant in `views/auth/required-fields.html` staat in een uitgecommentarieerd blok → niet gerenderd, gelaten.)

| Crit  | Fix                                                       | Bestand                                                                                                               |
| ----- | --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 2.4.6 | login/sms/two-factor contactlink → "stuur ons een e-mail" | `views/auth/url/login.html`, `config/auth.js` (helpText + smsCodeHelpText), `views/auth/two-factor/authenticate.html` |

### Kopniveau instelbaar (1.3.1)

InfoField rendert de titel al als échte kop (niet `<strong>`) en had de prop
`headingLevel` (2/3/4) — die stond alleen op de default (3) omdat de redacteur 'm
nergens kon zetten. Nu een select **"Kopniveau van de titel"** in de admin bij het
info-blok van enquête én keuzewijzer. De waarde stroomt via de bestaande field-spread
door naar InfoField, dus geen render-wijziging nodig; widgets herbouwd.

| Onderdeel      | Wijziging                                              | Bestand                                                                                                                    |
| -------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| enquête-admin  | select 2/3/4 + schema/defaults/reset/onSubmit          | `admin-server/.../widgets/enquete/[id]/items.tsx`                                                                          |
| enquête-widget | `headingLevel` in `Item` + doorzet in `case 'none'`    | `enquete/src/enquete.tsx`, `enquete/src/types/enquete-props.ts`                                                            |
| keuzewijzer    | select 2/3/4 (gated op `type==='none'`) + item-doorzet | `admin-server/.../widgets/choiceguide/[id]/items.tsx`, `choiceguide/src/parts/init-fields.tsx`, `choiceguide/src/props.ts` |

Admin draait `npm run dev` in de container met source gemount → fast-refresh, geen
restart nodig. Overige widgets die InfoField gebruiken (resourceform) kregen géén
control — niet in de audit; toe te voegen wanneer nodig.

### Homepage 400%-zoom: hamburger-sluitknop achter banner (1.4.10)

Bij een open mobiel menu (fullscreen overlay) zat de sluitknop áchter de sticky
`.status-banner` bij 400% zoom. Oorzaak: stacking-context-val — de overlay is
`position:fixed; z-index:99` maar zit gevangen in de stacking-context van `<header>`
(`z-index:11`), terwijl de banner op root-niveau `z-index:99` heeft (99 > 11 → banner
bovenop). Fix: `header:has(.header_navbar-container.--show) { z-index: 100 }` — alleen
in open-state, dus gesloten blijft de banner normaal bovenop.

| Crit   | Fix                                                | Bestand                                                 |
| ------ | -------------------------------------------------- | ------------------------------------------------------- |
| 1.4.10 | header boven de sticky banner tillen bij open menu | `cms-server/modules/openstad-assets/ui/src/header.scss` |

cms-server herstart (scss hercompileert bij restart). Live-audit-verificatie volgt bij deploy naar audit.draad.dev.

### Tijdlijn: huidige fase (1.3.1)

De content-tijdlijn had geen "huidige fase"-status en de items hebben géén datumveld
(`title` is vrije tekst als "March 8th"), dus niet uit data afleidbaar. Toegevoegd: een
boolean `current` ("Mark as current phase") per item; de render zet `aria-current="step"`
op de item-`<div>`. De losse agenda-widget had `aria-current` al.

| Crit  | Fix                                                    | Bestand                                                                         |
| ----- | ------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 1.3.1 | boolean `current` → `aria-current="step"` in de render | `cms-server/modules/openstad-timeline-widget/index.js`, `.../views/widget.html` |

cms-server herstart (apostrophe pikt schema + template op). Redacteur moet per tijdlijn
het huidige item aanvinken. Live-audit-verificatie volgt bij deploy naar audit.draad.dev.

---

## 🔎 Live-verificatie op audit.draad.dev (03-08-2026)

Alle pagina's doorgeklikt in Chrome, per fix de DOM/ARIA gecontroleerd (content overgeslagen).

**✅ Groen — de api-server-widgets (deployen automatisch vanaf disk):** navBar (submenu-`ul`,
chevron 40px, Escape sluit), teller (`aria-label` + samengevoegde cijfers), agenda (losse link niet in
`li`, `aria-current`, `<time>`), interactieve afbeelding + kaart (kompas, plaats-knop, `role=application`),
likes (knopnamen, `aria-pressed`, duim `aria-hidden`), reacties (paginering-`ul`, filter `inert`, "Uw
reactie", zoek="Zoeken"), enquête (0 kapotte `label[for]`, matrix-hoekcel "Onderwerp"+`scope`,
slider `aria-valuetext`), stem/begroot (stepper `aria-current=step`), keuzewijzer (score-tekst in
`role=status`), verdeel + emoji-slider (`role=status`/`aria-live` bij laden), inzending-detail (unieke
id's), inzendingen-overzicht (zoek-label, postcode-autocomplete), inzending-formulier (`autocomplete=tel`),
auth-login e-mail-foutmelding (ontkennend). Auth e-mail-error 3.3.1 is dus live.

**❌ Twee gaten gevonden:**

1. **CMS-contentwidgets niet uitgerold naar audit.draad.dev** — de fixes uit commit `f7001b462` +
   tijdlijn `48e0a4161` staan wél in de repo maar niet live op de audit-server: accordeon-chevron mist
   `aria-hidden` (1.1.1), carousel-knoppen hebben lege toegankelijke naam ("Vorige/Volgende slide" in
   `aria-hidden`-wrapper, 4.1.2), tijdlijn mist `aria-current` (1.3.1). De tijdlijn-**linkkleur**
   (`#0b5394`, scss) ís live, en navBar ook → alleen de apostrophe-**widget-assets** ontbreken.
   - **Extra bevinding (carousel 4.1.2):** de fix zat wél in de gedeelde `packages/ui/src/carousel`
     (`aria-label="Vorige/Volgende afbeelding"`, commit `0f7727dea`), maar de apostrophe-carousel-bundle
     `widget-assets/carousel.iife.js` was nooit herbouwd (stond nog op de build van 20-07) → oude, lege
     namen. **03-08-2026 herbouwd** (`packages/apostrophe-widgets/carousel` → `npm run build` → kopie naar
     `widget-assets/`) en de bundle bevat nu "Volgende afbeelding".
   - **Lokaal uitgerold (03-08-2026):** `docker restart openstad-cms-server`; de cms-server serveert nu de
     gefixte `carousel.iife.js` (met "Volgende afbeelding") en `accordion.iife.js` (met `aria-hidden`).
     Geverifieerd via `curl /widget-assets/*.iife.js`.
     **→ Resterende actie (deploy, geen code):** dezelfde bundles + tijdlijn-module naar de cms-server op
     audit.draad.dev + `docker restart`. Daarna live herverifiëren.
2. **Auth contactlink (2.4.6) — gemiste template, nu gefixt** (zie ⚠️ Nagekomen hierboven). Code staat;
   **lokaal uitgerold** (`docker restart openstad-auth-server`, bind-mount → nieuwe tekst bevestigd in de
   container). Auth-server op audit.draad.dev moet nog uitgerold/gerestart worden.

---

## 🔎 Herverificatie op audit.draad.dev (10-08-2026)

**De twee openstaande deploys blijken uitgerold.** Gecheckt op de live server:
`widget-assets/carousel.iife.js` bevat "Volgende afbeelding", `accordion.iife.js` bevat `aria-hidden`,
`share-link.iife.js` bevat `link-container`/`<li>`, en de auth-loginpagina toont "stuur ons een e-mail"
(geen "Neem contact met ons op" meer). Gat #1 en #2 hierboven zijn daarmee dicht.

**Drie nieuwe code-punten gevonden en gefixt** (commit volgt op deze doc-update):

| Crit           | Bevinding                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Fix                                                                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.3.1 / 2.4.11 | `id="search"` was gefixt, maar er stonden nog meer vaste id's dubbel bij twee filters op één pagina: `stem-begroot-filter`, `filters-container`, `filter-status`, `sortField`, `locationField`, `proximityField`, `suggestion-list`, `suggestion-N`, `a-b-description` + de placeholder-slugs in de tag-filters. Erger: `document.querySelector('#stem-begroot-filter')` pakte altijd de eerste filter, dus reset en focus-terug raakten de verkeerde instance. | Alles wat via `label[for]`/`aria-controls`/`aria-activedescendant` verwezen wordt → `useId()`; de rest → class. Sectie-lookups via een eigen `ref` i.p.v. een gedeeld id. |
| 1.4.4 / 1.4.10 | Accountgegevens: het e-mailveld was een `readOnly` input en kapte het adres af bij 200% zoom.                                                                                                                                                                                                                                                                                                                                                                   | Leestekst i.p.v. input, met `overflow-wrap: anywhere`.                                                                                                                    |
| 2.4.6          | `apps/auth-server/config/auth.js` stond bij de unieke-code-helpText nog op "Neem contact met ons op".                                                                                                                                                                                                                                                                                                                                                           | → "stuur ons een e-mail" (laatste van de vier).                                                                                                                           |

**Regressietest:** `packages/ui/cypress/component/stem-begroot-and-resource-overview.cy.tsx` mount twee
`<Filters>` naast elkaar en eist dat elk `id` uniek is. Negatief gecheckt: faalt zodra één vast id terugkomt.
**Rebuild:** 18 packages; scan over alle `packages/*/dist/*` geeft nul hardcoded id's.

---

## ⏭️ Nog te doen

- **`dist/`-bundles uitrollen naar audit.draad.dev** — de fixes van 10-08 staan lokaal gebouwd.
- **Matrix-tabel reflow (1.4.10)** — code staat al (`matrix.css`: mobiele card-stack <480px +
  `overflow:auto` fallback); alleen nog handmatig op 320px verifiëren. Laag risico.
- **Verify-only op de live site** (niet in de browser-automation af te dwingen): reflow 1.4.10 (320/400px),
  resize-text 1.4.4 (200%), contrast 1.4.3 / non-text-contrast 1.4.11 (kleurmeting), text-spacing 1.4.12,
  focus-not-obscured 2.4.11 (200%), close-message 2.5.3 (vereist e-mail-submit), beeldkiezer "✓ Gekozen"-
  badge (samenvattingsstap).
- **Bewuste afwijking om te kennen (2.4.4)** — de auditor vroeg link + chevron "Alle widgets" samen te
  voegen tot één interactief element; ze zijn gesplitst gelaten. De link wijst nu wel naar een echte
  `/alle-widgets`-pagina en de chevron togglet met een naam, dus de kern is weg — maar de auditor kan
  hierop terugkomen.

> **Code-kant is dicht.** Wat rest is uitrollen, de verify-only metingen, en de content-/config-acties
> hieronder die code niet kan afdwingen.

---

## ✍️ Redacteurs-checklist (content/config — code kan dit niet afdwingen)

De code staat; deze punten moet de redacteur in de demo/CMS zetten. **Alle punten hieronder zijn op
10-08-2026 live op `audit.draad.dev` gecontroleerd en stonden op dat moment nog open.** Op volgorde van
impact.

> **Stand 14-08-2026 (tweede hercontrole) — het meeste hieronder is inmiddels gedaan.** Nog open
> zijn er twee: het **kopniveau van de widget op `h3`** op zeven pagina's, en de **eigen CSS bij de
> twee keuzewijzer-widgets** (die blaast het keuzevlak op van 180 naar 610px, waardoor het paneel
> het scherm bedekt bij 200% zoom). De rest — logo-alt, de "Voorbeeld"-koppen, de lege kop op
> `/reacties`, de tijdlijn, de paginatitel, de sitemap, de autoplay, de schaaltekst — is live
> nagemeten en afgevinkt. De actuele lijst staat in
> [`accessibility-overzicht.md`](accessibility-overzicht.md) § Deel 0A; deze sectie is de historie.

### 1. Logo-alt + logo-link (1.1.1 + 2.4.4) — sitebreed, hoogste prioriteit

Live is de `alt` nog `"Logo openstad"` (header) en `"Logo OpenStad"` (footer); de link eromheen heeft
géén `title` of toegankelijke naam.

- [ ] `alt` → `"OpenStad.org (logo)"` — in de site-/header-config, niet per pagina.
- [ ] Logo-**link** een naam geven ("Naar de homepage").
- [ ] Idem voor het footer-logo.

### 2. Koppen-hiërarchie (1.3.1) — grootste content-post

De regel: precies **één `<h1>`** per pagina, en **geen niveaus overslaan**.

- [ ] **3× `<h1>`** op `/interactieve-afbeelding` en `/inzending-detailpagina` (volgens de audit ook op
      `/begrootmodule` en `/stemmodule`). Het zijn CMS-titelwidgets waar `h1` is gekozen. → houd de
      pagina-`h1` aan, zet de rest op h2/h3.
- [ ] **Nep-koppen** — 2× `h2` met de lange "Lorem ipsum…"-zin op `/interactieve-afbeelding`. Dat is
      gewone tekst, geen kop. → kop-opmaak eraf.
- [ ] **"Voorbeeld 1/2: …" naar `h2`** — lost twéé bevindingen tegelijk op. Nu staan ze op `h3`: - op `/aftelbalk` lijken ze daardoor subkoppen van h2 "Hoe maak je de widget op maat?"; - op `/reacties` levert het de **lege kop** op (h3 "Voorbeeld 2: Maximale versie" direct gevolgd
      door h3 "12 reacties oneens").
      Zet je "Voorbeeld …" op `h2`, dan nestelen de widgetkoppen (h3) correct en vervallen beide.
- [ ] **Lege kop uit de Reacties-widget** — op `/reacties` staat een volledig lege `<h3>`: de widgettitel
      is leeggelaten in de config. → vul 'm in, bv. `[[nr]] reacties`.
- [ ] **Kopniveau per infoblok** (enquête + keuzewijzer) — in de admin bij het info-blok staat de select
      **"Kopniveau van de titel"** (2/3/4). Kies zo dat de titel aansluit op de koppen eromheen.
      _(De `<strong>`-als-kop uit de audit — "Jouw buurt, jouw toekomst" — is hiermee al opgelost:
      live is het nu een echte `H3`.)_
- [ ] **Tijdlijn: huidige fase** (contentwidget) — geen enkel tijdlijn-item op `/contentwidgets` heeft
      `aria-current`; het vinkje **"Mark as current phase"** staat nergens aan. → per tijdlijn de lopende
      fase aanvinken.

### 3. Paginatitels & navigatie

- [ ] **Paginatitel (2.4.2)** — de `<title>` van `/inzending-detailpagina` begint nog met "Lorem ipsum
      dolor sit amet". Beter dan eerst (de paginanaam staat er nu achter), maar nog niet beschrijvend.
      → geef de demo-inzending een echte titel.
- [x] **Meerdere manieren om te navigeren (2.4.5)** — opgelost 14-08: `/sitemap` staat live met een
      `h1` en 31 links, en de footer verwijst er op elke pagina naartoe. Navigatie + sitemap zijn
      samen de twee vereiste manieren; een zoekveld is niet meer nodig.

### 4. Misleidende linktekst (2.5.3) — **niet de redacteur**

- Vervallen als redacteursactie op 14-08. De zichtbare tekst **"Reageer op deze inzending"** op
  `/inzending-detailpagina` is geen widgettekst maar de **projectstatus** van de inzending, die binnen
  de klikbare-afbeelding-link viel. Hernoemen zou de status kapotmaken (die staat ook op de kaartjes),
  dus dit is opgelost in code: de link omsluit nu alleen de afbeelding. Wacht op de deploy.

### 5. Formulierteksten

- [ ] **Slider-instructie vs. voorgelezen schaal (3.3.2)** — de code genereert de sr-only schaaltekst uit
      de ingestelde labels. Typt de redacteur er "1 staat voor zeer ontevreden … 5 voor zeer tevreden"
      boven terwijl de labels "heel slecht … heel goed" zijn, dan blijft de mismatch. → handmatige
      schaaltekst weghalen, óf de labels gelijktrekken met de omschrijving.
- [ ] **Foutmeldingen inzending-formulier (3.3.1)** — de foutteksten per veld (`requiredWarning`) zijn
      admin-config, geen code. → herschrijf als ontkenning ("Dit is geen geldig e-mailadres…"), niet als
      instructie ("Controleer of…").

### 6. Demo-assets (code heeft de nette variant al)

- [ ] **Video-autoplay (1.4.2)** — code start de video gepauzeerd; controleer dat de demo autoplay niet
      alsnog forceert.
- [ ] **Bewegende pijl (2.2.2)** — code begrenst de animatie; vervang de auto-animerende demo-asset door
      een statische (of een variant met pauze).

---

## 🔧 Bouwen & testen (belangrijk voor een nieuwe sessie)

**Losse widget bekijken:** `cd packages/<widget> && npm run dev` → `http://localhost:5173/`
(elke widget heeft een `src/main.tsx` met mock-data).

**Reflow op 320px:** de automation-browser kan de CSS-viewport niet naar 320 forceren; test met
DevTools device-toolbar (⌘⇧M) op 320, of — voor intrinsieke overflow — zet de widget-container
tijdelijk op 320px. Let op: `position:fixed`/`100vw`/media-queries reageren daar niet op; die
vereisen een échte 320-viewport.

**Deploy naar de demo (31490) — twee mechanismen:**

1. **api-server-widgets** (enquête, form, swipe, resource-_, stem-begroot, …): de api-server (poort 31410) leest `packages/_/dist` **per request van disk** (`apps/api-server/.../widget.js`,
   `fs.readFileSync`). Dus `npm run build`van het package volstaat → automatisch live op de demo
   (hooguit browser hard-refresh ⌘⇧R). Mapping:`apps/api-server/src/routes/widget/widget-settings.js`.
   - ⚠️ **VALKUIL — gedeelde componenten worden per widget mee-gebundeld.** Wijzig je iets in
     `packages/ui/src` (bv. `Filters`, `Paginator`) of in `packages/comments`, dan moet je **élke widget
     die het bundelt** herbouwen — niet alleen het "eigen" package. Bv. het reactieformulier op een
     resource-detailpagina komt uit de **`resource-detail`**-bundle, niet uit `comments`. Consumers van
     de shared filter/paginator/comments: `comments`, `resource-detail(-with-map)`, `resource-overview(-with-map)`,
     `document-map`, `leaflet-map`, `stem-begroot`, `multi-project-resource-overview`, `simple-voting`.
     Check achteraf: scan alle `packages/*/dist/*.iife.js` op de oude tekst — geen hit = alles herbouwd.
2. **CMS-widgets** (navBar, Footer): de CMS serveert een **gekopieerde** bundle uit
   `apps/cms-server/modules/asset/ui/public/` — JS in `navBar.iife.js`, CSS in `style.css` (apart!).
   Flow: build package → **kopieer** `dist/navBar.iife.js` én `dist/navBar.css` (→ `style.css`) naar die
   map → **`docker restart openstad-cms-server`** (apostrophe herbouwt assets, ~5-30s) → commit de
   kopieën (git-getrackt). Beide bestanden bijwerken (JS-only laat de CSS oud).

**Draaiende omgeving:** Docker-services (`docker ps`): cms-server (31490), api-server (31410),
auth/admin/image-servers, mysql/mongo/redis. Widget-instances laden via `http://localhost:31410/widget/{id}`.

---

## Repo-hygiëne (niet van deze batches)

- Merge-conflicten (`AA`) in `packages/ui/types/*.d.ts` stonden al vóór deze sessie open — apart oplossen.
- Gegenereerde bestanden (`packages/*/dist` grotendeels gitignored; `packages/ui/types/*.d.ts`,
  `packages/video/dist/video.iife.js`) kunnen als "modified" verschijnen na rebuilds — dat is build-output.
