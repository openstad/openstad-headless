# Toegankelijkheid (WCAG 2.2) — overzicht & handoff

Centrale status voor de audit-remediatie van `audit.draad.dev` (audit 16-07-2026).
**Branch:** `fix/accessibility-3-3`. Laatst bijgewerkt: 27-07-2026.

Dit is het startpunt voor een nieuwe sessie. Detail per onderdeel staat in aparte docs;
de volledige audit-analyse staat lokaal in `.claude/` (niet gecommit).

## Bron-analyse (lokaal, `.claude/`)

- `.claude/audit-split.md` — alle 27 audit-bevindingen gesplitst in **content** vs **build**.
- `.claude/audit-per-onderdeel.md` — bevindingen gegroepeerd per widget/onderdeel (met C/B per regel).

## Detail-status per afgeronde batch

- `docs/accessibility-enquete-status.md` — enquête (13 punten).
- `docs/accessibility-navbar-status.md` — navBar (5 punten).

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

---

## ⏭️ Nog te doen

- **Reacties** (6 punten): paginering als lijst + nav-landmark (1.3.1), lege kop, paginering-reflow
  200% (1.4.4), filter-popup focus trap (2.4.11), 2 velden zonder label (3.3.2), zoek-icoon alt
  'Filters toepassen' → 'Zoeken' (1.1.1/2.4.6). Deelt filter-sidebar/zoekbalk met inzendingen-overzicht.
- **Keuzewijzer + Stemmodule** (8 samen): score/stap alleen via kleur (1.4.1), score niet voorgelezen,
  `aria-current`, reflow tijdlijn (1.4.10), text-spacing stapnummers (1.4.12), focus-not-obscured
  filter-popup (2.4.11).
- **Interactieve kaart — bediening** (bewust apart): toetsenbord om reactie te plaatsen (2.1.1) +
  on-screen kompas voor single-pointer pannen (2.5.7). Raakt alle kaart-gebruikers.
  - Losse bevinding: kaart crasht onder `React.StrictMode` (dubbel-mount, "Map container is already
    initialized") — ontbrekende Leaflet-cleanup bij re-mount; meenemen bij deze taak.
- **Matrix-tabel reflow** — niet getest (zat niet in de dev-harness mock; audit prees juist de
  mobiele tabelweergave → laag risico).
- **Overige audit-onderdelen** buiten deze widgets: teller, interactieve afbeelding, contentwidgets
  (accordeon/carousel/share/agenda-tijdlijn), begroot/stem-tijdlijn, verdeelmodule/emoji-slider
  status-messages, beeldkiezer, agenda, auth/login. Zie `.claude/audit-per-onderdeel.md`.

---

## ✍️ Content-acties (redacteur/config — code kan dit niet afdwingen)

- Enquête-slider: verwijder de handmatig getypte schaal-tekst in de demo (slider genereert 'm nu zelf).
- InfoField: kies per infoblok het juiste `headingLevel` zodat de koppenhiërarchie klopt.
- Footer-logo `alt` → `"OpenStad.org (logo)"` (via config).
- Header-logo (link + `title`): zit in de CMS/demo-header, niet in een widget.

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
