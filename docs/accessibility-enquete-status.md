# Toegankelijkheid (WCAG 2.2) — status enquête-widget

Bron: audit `audit.draad.dev` (16-07-2026). Deze batch behandelt de **enquête**-widget en de
form-elementen die zij gebruikt. Bredere analyse: `.claude/audit-split.md` en
`.claude/audit-per-onderdeel.md` (lokaal).

Laatst bijgewerkt: 27-07-2026 · branch `fix/accessibility-3-3`.

---

## ✅ Opgelost en gebuild (10/13 enquête-punten)

| #   | WCAG          | Punt                                                   | Oplossing                                                                                                                                                          | Bestand(en)                                                            |
| --- | ------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| 1   | 1.3.1         | `label for` verwees naar niet-bestaand/verborgen input | Titel als tekst-met-id i.p.v. `<label>`; FilePond krijgt `aria-labelledby`                                                                                         | `map/index.tsx`, `document-upload/index.tsx`, `image-upload/index.tsx` |
| 2   | 1.3.1         | Lege eerste tabelheader in matrix                      | Hoekcel gevuld met sr-only label (`rowHeaderLabel`, default "Onderwerp") + `scope="col"` op kolomkoppen                                                            | `matrix/index.tsx`                                                     |
| 3   | 1.3.5         | `autocomplete` ontbrak/ongeldig (`on` op tel)          | Herkenning uitgebreid (name/username/tel/postal-code/…) via substring-match                                                                                        | `text/index.tsx`                                                       |
| 4   | 1.4.2 / 2.2.2 | Autoplay video + oneindig bewegend pijltje             | Video start gepauzeerd (geen autoplay/`playVideo()`); pijltje-animatie niet meer `infinite` en achter `prefers-reduced-motion`                                     | `video/src/video.tsx`, `enquete.scss`                                  |
| 5   | 1.4.3         | Witte tekst op FilePond-groen `#369763` = 3,6:1        | Groen → `#2b7d4f` (~5:1)                                                                                                                                           | `document-upload.css`, `image-upload.css`                              |
| 7   | 1.4.11        | Contrast UI-componenten <3:1                           | Scorebalk-track → `#8c8c8c`; voortgangs-dots donkerder; leaflet zoom-disabled `#bbb` → `#6b6b6b`                                                                   | `enquete.scss`, `form.scss`, `base-map.css`                            |
| 8   | 2.4.3         | Focus bleef op 'volgende'-knop staan bij paginawissel  | Focus verspringt naar eerste vraag (heading/`.question`) van de nieuwe pagina                                                                                      | `form/src/form.tsx`                                                    |
| 9   | 2.5.3         | Engelse FilePond-knoppen ('Abort'/'Retry'/'Undo')      | Vertaald naar Nederlands                                                                                                                                           | `document-upload/index.tsx`, `image-upload/index.tsx`                  |
| 10  | 3.3.2         | Slider las andere tekst voor dan de instructie         | Schaal-uitleg uit dezelfde labels gegenereerd als `.sr-only` en via `aria-describedby` aan de slider gekoppeld; zienden zien de smileys/cijfers als visuele schaal | `tickmark-slider/index.tsx`                                            |
| 11  | 1.3.1         | Kop opgemaakt als `<strong>` i.p.v. heading            | InfoField-titel is een echte `<h2/3/4>` (instelbaar `headingLevel`, default 3)                                                                                     | `info/index.tsx`                                                       |

**Build:** 19 widget-bundles herbouwd (`tsc` schoon). `dist/` is grotendeels gitignored;
alleen `packages/video/dist` is getrackt en meegecommit.

---

## 🟡 Reflow (1.4.10) — grotendeels geverifieerd op 320px

Getest via de dev-harness (`npm run dev`) met de widget-container vastgezet op 320px
(de automation-browser gaf geen echte 320px-viewport).

**Geverifieerd — geen horizontale overflow:**

- Intro-/info-pagina's, tekstvelden, smiley-/score-slider, keuze-opties (radio/checkbox).
- Smiley-rij (`.range-slider-labels`) had een kleine intrinsieke overflow (±5px door 16px padding); opgelost met `box-sizing: border-box`, `padding: 0` en `gap`.
- Basis toegevoegd op `.form-container`: woordafbreking, `max-width` op media, `min-width:0`.
- Swipe-kaartstapel ("sleep-opties"): past via `max-width: calc(100vw - 86px)` + `@media (max-width:400px)`.
- Swipe **toelichting-dialog** liep wél weg op echte 320px. Twee oorzaken: (1) de `position: fixed` modal zat gevangen in een voorouder met `transform`/`will-change: transform` (swipe-kaarten), waardoor `95%` t.o.v. die bredere voorouder rekende; (2) `padding` zat niet in de breedte. Opgelost door de modal via een **React-portal** (met `.openstad`-wrapper voor de geprefixte CSS) in `document.body` te renderen + `box-sizing: border-box` in `swipe.scss`. **Geverifieerd op echte 320px-viewport: `horizontalOverflow: 0`.**
  - Let op: bron is `swipe.scss` (de component importeert die), niet het gegenereerde `swipe.css`.
- Swipe **"Gemaakte keuzes"-samenvatting** had ook een scrollbalk: `.swipe-summary` gebruikte `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))` → de 250px-minimum kon niet krimpen op 320px. Opgelost met `minmax(min(250px, 100%), 1fr)`. Geverifieerd op 320px: `overflow 0`.
- Onderweg opgeruimd: swipe-toelichting-textarea's (samenvatting + modal) hadden alleen een placeholder → `aria-label` toegevoegd (samenvatting incl. de stelling), en het samenvatting-veld visueel opgeschoond (net omrand veld i.p.v. grijze band).

- **Interactieve kaart**: veroorzaakte een grote overflow (kaart forceerde ~746px). Oorzaak: `.osc-enquete-item-content.--youth` is een grid en het grid-item had standaard `min-width: auto`, dus het kon niet krimpen onder de min-content van de kaart. Opgelost met `> * { min-width: 0 }` op de youth-grid. **Geverifieerd op 320px: `overflow 0`, kaart 242px.**
- **Document-/afbeelding-upload**: geen overflow op 320px (profiteren van dezelfde grid-fix + `.form-container`-basis). Geverifieerd.

**Nog niet geverifieerd:**

- Matrix-tabel (zat niet in de harness-mock; de audit prees juist de mobiele tabelweergave, dus laag risico).
- De tijdlijn-reflow uit de audit hoort bij **begroot/stem**, niet bij enquête.

**Losse bevinding (geen reflow):** de kaart crasht onder `React.StrictMode` in de dev-harness ("Map container is already initialized") door dubbel-mount. Niet in productie (geen StrictMode), maar wijst op ontbrekende Leaflet-cleanup bij re-mount — meenemen bij de aparte kaart-taak.

---

## ⏸️ Bewust buiten deze batch (aparte taak)

| #   | WCAG  | Punt                                         | Reden                                                                                                  |
| --- | ----- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| —   | 2.1.1 | Reactie op kaart niet via toetsenbord        | Kaart-_bediening_ apart opgepakt (keuze gebruiker). Kaart-contrast (#7) en label (#1) zijn wél gedaan. |
| —   | 2.5.7 | Kaart pannen alleen via slepen (geen kompas) | idem                                                                                                   |

---

## ✍️ Content-acties (redacteur — code kan dit niet afdwingen)

- **#10:** Verwijder in de demo de handmatig getypte schaal-tekst ("1 = zeer ontevreden … 5 = zeer tevreden") uit de vraag; de slider genereert die nu zelf en consistent.
- **#11:** Kies per infoblok het juiste `headingLevel` zodat de koppenhiërarchie in de demo klopt (component ondersteunt dit nu).

---

## Losse aandachtspunten in de repo (niet van deze batch)

- Merge-conflicten (`AA`) in `packages/ui/types/*.d.ts` stonden al vóór deze wijzigingen open — apart oplossen.
