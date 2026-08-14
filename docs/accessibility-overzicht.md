# Toegankelijkheid — alle bevindingen uit beide onderzoeken

Eén gecombineerde lijst van **audit.draad.dev** (WCAG-EM rapport 16-07-2026, 27 gefaalde
criteria) en de **Den Haag-inspectie** (spreadsheet, 19 rijen). Peildatum: **14-08-2026**.

> **Belangrijk kader — bijgewerkt 14-08:** de branch `fix/accessibility-3-3` **is inmiddels
> gedeployd** op audit.draad.dev, tot en met commit `42b06cc5e` (14-08, 08:57). Alles daarvóór is
> live en opnieuw te testen. De commits van ná 10:00 — de klikbare afbeelding (`71465775a`), de
> e-mailfoutmelding (`ecf9f99f0`) en `aria-describedby` (`7593441f4`) — zitten er nog niet in.
> **denhaag.nl** draait nog wel een oudere versie; Deel B is daar dus niet aan te toetsen.

## Waar staat wat?

Alle paden in **Deel A** zijn relatief aan `https://audit.draad.dev` (login-pagina's aan
`https://auth.audit.draad.dev`). **Deel B** verwijst naar drie pagina's op `www.denhaag.nl`; die
staan met een eigen legenda bovenaan dat deel.

## Legenda — wie lost het op?

|     | Wie           | Betekenis                                                                                    |
| --- | ------------- | -------------------------------------------------------------------------------------------- |
| ✅  | ontwikkelaar  | Code, live werkend en geverifieerd in de DOM op audit.draad.dev                              |
| 🔧  | ontwikkelaar  | Code, opgelost op deze branch maar nog niet gedeployd (alleen de commits van ná 14-08 10:00) |
| ✍️  | **redacteur** | **Content of configuratie in het CMS/de admin — code kan dit niet afdwingen**                |
| 🏛️  | gemeente      | Buiten OpenStad: styling of projectinstelling                                                |
| ❓  | tester        | Vereist handmatige meting of interactie, niet automatisch te controleren                     |

Sommige regels hebben twee markeringen (bv. ✅ / ✍️). Dan is de code klaar, maar moet de
redacteur nog iets zetten voordat het effect heeft. Dat staat er dan expliciet bij.

---

# Deel 0 — de scheidslijn: content of code?

## A. Kan de redacteur zelf oplossen — nog 4 open

Geen enkele hiervan vraagt een release. Alles kan vandaag in het CMS of de admin. Doorgestreepte
regels zijn op 14-08 afgerond en live geverifieerd; ze blijven staan zodat de auditor de historie
kan volgen. **Open:** 2 (alleen nog `/begrootmodule`), 4, 10 en 11.

| #     | Actie                                                                                                                                                                                                                                                    | Pagina                                                                                                                                                                                                                    | Lost op                                        |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1     | ~~Logo-alt~~ — **gedaan 14-08**, beide velden live geverifieerd: header `"OpenStad.org, naar de homepage"` (dat ís een link, dus het doel hoort erin), footer `"OpenStad.org"` (dat logo is géén link, dus zonder navigatiebelofte)                      | Sitebreed — Algemene instellingen, `logoAltText` en `footerLogoAltText`                                                                                                                                                   | 2.4.4                                          |
| 2     | ~~"Voorbeeld …"-koppen van h3 naar **h2**~~ — **gedaan 14-08** op 18 van de 19 pagina's                                                                                                                                                                  | Nog één over: `/begrootmodule`, tweede kop ("Voorbeeld: Maximale versie") staat nog op `h3`                                                                                                                               | 1.3.1                                          |
| 3     | ~~Widgettitel Reacties invullen~~ — **gedaan 14-08**, staat op `[[nr]] Reacties`                                                                                                                                                                         | `/reacties` — widgetconfig                                                                                                                                                                                                | 1.3.1                                          |
| 4     | Demo-inzending een echte titel geven                                                                                                                                                                                                                     | `/inzending-detailpagina` — de resource zelf                                                                                                                                                                              | 2.4.2 — `<title>` begint nog met "Lorem ipsum" |
| 5     | ~~Kop **H1 "Sitemap"** boven de lijst zetten~~ — **gedaan 14-08**, `h1` "Sitemap" gevolgd door vier `h2`'s                                                                                                                                               | `/sitemap`                                                                                                                                                                                                                | 1.3.1 / 2.4.6                                  |
| 6     | ~~Linktekst "Reageer op deze inzending" → "Bekijk afbeelding"~~ — **vervallen 14-08: dit is code, zie Deel 0B**                                                                                                                                          | `/inzending-detailpagina`                                                                                                                                                                                                 | 2.5.3                                          |
| 7     | ~~**Beschrijving** van de schaalvraag herschrijven~~ — **gedaan 14-08**: staat op "1 staat voor heel slecht en 5 voor heel goed", gelijk aan wat de schermlezer voorleest                                                                                | `/enquete` — Enquête-widget, tab **Items**                                                                                                                                                                                | 3.3.2                                          |
| ~~8~~ | **Vervalt** — dit bleek geen redactie-actie: de foutteksten zijn niet in de admin in te vullen. Opgelost in code, zie 3.3.1 in Deel A                                                                                                                    | —                                                                                                                                                                                                                         | 3.3.1                                          |
| 9     | ~~Autoplay uit~~ — **gedaan 14-08**, de YouTube-player start met `autoplay: 0`                                                                                                                                                                           | `/enquete` — de video                                                                                                                                                                                                     | 1.4.2                                          |
| 10    | Auto-animerende pijl vervangen door een statische                                                                                                                                                                                                        | `/enquete` — demo-asset                                                                                                                                                                                                   | 2.2.2                                          |
| 11    | **Nu aan de beurt — de deploy is er.** Kopniveau per widget op **h3** zetten. De titelfix is live, dus widgettitels staan nu op `h2`: precies hetzelfde niveau als de "Voorbeeld"-kop erboven, waardoor ze ernaast lijken te staan in plaats van eronder | `/interactieve-afbeelding`, `/inzending-detailpagina`, `/inzendingen-overzicht` (daar 16 titels op `h2`), `/begrootmodule`, `/stemmodule`, `/interactieve-kaart`, `/keuzewijzer` — admin, select "Kopniveau van de titel" | 1.3.1                                          |

Al gedaan door de redacteur: de `<strong>`-kop is een echte `H3`, de paginatitels zijn
beschrijvend, de tijdlijn op /contentwidgets heeft sinds 14-08 `aria-current="step"` op de
tweede fase, `/sitemap` staat live met alle 31 links, en de footerkolommen bevatten sinds
14-08 echte links ("Over OpenStad", "Meedoen", "Deze site") in plaats van de placeholders
"Link 1" en "Link 2".

Later op 14-08 daar nog bij gekomen, allebei geverifieerd in de DOM: de `h1` "Sitemap" boven de
lijst, en een opgeschoonde footer. Die stond nog vol met de standaardinhoud van het thema —
koppen "Kolom 1"/"Kolom 2" (echte `<h2>`'s, dus zichtbaar in de koppenlijst van een
schermlezer) en twee links "Link 1" en "Link 2" die allebei naar `/inzending-detailpagina`
wezen. Nu drie kolommen met inhoudelijke koppen — "Over OpenStad", "Meedoen", "Deze site" — en
zes links met een eigen bestemming die allemaal in de sitemap terugkomen.

## B. Kan de redacteur **niet** oplossen — vereist code

Alles hieronder is al opgelost op deze branch, maar wacht op een deploy.

| Bevinding                                  | Waarom geen content                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3× `h1` op vier pagina's                   | De widgets zetten hun titel hard op `h1`. Twee widget-instances op één pagina = altijd twee extra `h1`'s. De redacteur kan alleen de titel hélemaal uitzetten |
| Samenvatting opgemaakt als `h2`            | Zit in de widget-render, niet in het CMS                                                                                                                      |
| Overgeslagen niveaus h2→h4, h4→h6, h3→h5   | Vaste `Heading4`/`Heading5`/`Heading6` in de widgetcode                                                                                                       |
| Duim/wolkje/trofee lezen alleen het getal  | Ontbrekend `description` in de `Icon`-component                                                                                                               |
| Dubbele id's in de filters (12 stuks live) | Hardgecodeerde id's in gedeelde componenten                                                                                                                   |
| Focus-trap greep de verkeerde filter       | Selector pakte altijd de eerste instance                                                                                                                      |
| Vijf icon-sections met dezelfde kop-id's   | Index-gebaseerde id's per widget-instance                                                                                                                     |
| Account-e-mail onleesbaar bij 200%         | Was een `readOnly` input                                                                                                                                      |
| Alle vijf de kaart-punten uit Den Haag     | Skiplink, focusindicatoren — allemaal componentcode                                                                                                           |
| Uitklapmenu sluit niet met toetsenbord     | Ontbrekende focusout-/Escape-afhandeling                                                                                                                      |
| Tags zonder lijstsemantiek                 | Zit in de render van de kaartjes                                                                                                                              |
| Linktekst "Reageer op deze inzending"      | De klikbare afbeelding omsloot óók de statusbalk, dus de status werd de zichtbare linknaam. Die status is instelbaar, maar hernoemen maakt de status onzin    |

> ⚠️ **Let op — deze leken content, maar zijn het niet.** De "3× `h1`" en de 2× "nepkop Lorem
> ipsum" stonden aanvankelijk op de redacteurslijst. Ze komen allebei uit de widgets zelf: de
> `h1` is de titel van de inzending, de `h2` is de samenvatting die `document-map` als kop
> rendert. Op /interactieve-afbeelding staan twee document-map-widgets, vandaar twee van elk.
> Wie hiervoor in het CMS gaat zoeken vindt niets om aan te passen — er ís daar niets.
>
> Sinds 14-08 hoort de linktekst "Reageer op deze inzending" ook in dit rijtje thuis. Die tekst
> is geen widgetinstelling maar een **projectstatus** — de standaardstatus die
> `apps/api-server/src/models/Project.js:213` bij elk nieuw project aanmaakt en die dankzij
> `addToNewResources` op elke inzending staat. Hij is dus wél instelbaar, maar op de verkeerde
> plek: de status wordt ook op de kaartjes en in het overzicht getoond, dus hem "Bekijk
> afbeelding" noemen maakt de linknaam goed en de status onzin. Het echte probleem zat in
> `resource-detail.tsx`: de klikbare-afbeelding-link omsloot het hele `Image`-blok, inclusief de
> statusbalk in `imageFooter`.
>
> En andersom: de "lege `<h3>`" op /reacties en de ontbrekende `aria-current` op de tijdlijn
> zien er uit als codefouten, maar zijn een leeg configveld en een niet-aangevinkt vinkje.

## C. Ligt bij de gemeente

| Pagina | Nr    | Bevinding                                    | Type              |
| ------ | ----- | -------------------------------------------- | ----------------- |
| P      | 24939 | Statusbalk-contrast 2,5:1 (wit op `#F08600`) | Styling           |
| O      | 25100 | Alinea onterecht als kop gemarkeerd          | Projectinstelling |

---

## Hercontrole 14-08 — wat is er gemeten, en wat niet?

Nagelopen tegen de 74 losse bevindingen uit de Cardan-rapportage
(`auditor.cardan.com/report/01kss79vc5cnqv4b40h2z2np6y`), niet alleen tegen de 27 criteria. De
widgets bouwen zichzelf pas in de browser op, dus dit ging via de gerenderde DOM.

**Wel gemeten en bevestigd op de live site:** logo-alt, submenu als lijst, doelgrootte van de
chevron, koppenstructuur per pagina, lege koppen, paginering, zoekicoon, labels zonder doel,
lege tabelheader, `autocomplete`-waarden, dubbele `id`'s, tellers, `aria-current`,
carrousel-knopnamen, kaart-skiplink, live regions op de verdeelmodule en de kapotte
`aria-describedby`.

**Niet machinaal vast te stellen** — hiervoor is een visuele of schermlezercontrole nodig:

| Wat                                      | Bevindingen                       |
| ---------------------------------------- | --------------------------------- |
| Contrastwaarden                          | F16, F17, F18, F22, F56, F58, F61 |
| Zoom 200% en reflow op 320px             | F9–F15, F60, F66                  |
| Focusvolgorde en focus-in-beeld          | F20, F21, F25, F35, F63           |
| Informatie die alleen via kleur overkomt | F8, F54, F55                      |

`/agenda`, `/likes`, `/keuzewijzer`, `/stemmodule`, `/beeldkiezer`, `/emoji-slider`,
`/keuzeswipe` en `/projectenoverzicht` zijn in deze ronde niet apart nagelopen; die stonden
eerder op de dag wel groen.

---

# Deel A — audit.draad.dev (27 gefaalde criteria)

## 1.1.1 Niet-tekstuele content

**Pagina's:** /interactieve-kaart, /inzendingen-overzicht, /reacties, /projectenoverzicht, /contentwidgets + het logo op alle pagina's

| Bevinding                                              | Status | Toelichting                                                                                                                                                                    |
| ------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Duim-omhoog en tekstwolkje lezen alleen het getal voor | ✅     | Gedeployd en 14-08 live nagemeten op `/interactieve-kaart`: `"Stemmen voor 4"`, `"Aantal reacties 0"`. Ging om zes iconen in twee kaartvarianten plus de begroot-detaildialoog |
| Zoekicoon heet "Filters toepassen"                     | ✅     | Nu "Zoeken", op alle drie de pagina's                                                                                                                                          |
| Popup-afbeelding als link mist alt                     | ✅     | Gedeelde `Image` forceerde altijd `role="presentation"`; nu conditioneel                                                                                                       |
| Accordeon-chevron leest als "afbeelding"               | ✅     | `aria-hidden="true"` op de icon-wrapper                                                                                                                                        |
| Logo-alt bevat niet de zichtbare merknaam              | ✅     | Staat live op "OpenStad.org (logo)" — door de redacteur opgepakt                                                                                                               |

## 1.3.1 Info en relaties — grootste post

**Pagina's:** /aftelbalk, /interactieve-afbeelding, /inzending-detailpagina, /begrootmodule, /stemmodule, /enquete, /contentwidgets, /agenda, /teller, /reacties, /keuzewijzer

| Bevinding                                                                    | Status  | Toelichting                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3× `h1` op interactieve-afbeelding, inzending-detail, begroot- en stemmodule | ✅      | Bleek géén content: `document-map`, `resource-detail` en `stem-begroot` zetten de titel hard op `level={1}`. Nu instelbaar kopniveau, default h2. **14-08 live: nog één `h1` per pagina.** Zie wel actie 11 hieronder                                                                                                                                     |
| Samenvatting opgemaakt als `h2` ("dit is geen kop, maar grote tekst")        | ✅      | 5× in document-map, 1× in resource-detail; nu `<Paragraph>`. 14-08 live: de lange "Lorem ipsum…"-tekst is geen kop meer                                                                                                                                                                                                                                   |
| Overgeslagen niveaus h2→h4 en h4→h6 (likes), h3→h5 (begroot-zijbalk)         | ✅      | Subkoppen volgen nu het kopniveau van de widget                                                                                                                                                                                                                                                                                                           |
| `<strong>` als kop ("Jouw buurt, jouw toekomst")                             | ✅      | `InfoField` rendert een echte kop; live nu een `H3`                                                                                                                                                                                                                                                                                                       |
| Aftelbalk: "Voorbeeld 1" lijkt subkop van "Hoe maak je de widget op maat?"   | ✍️      | Zet de "Voorbeeld 1/2"-koppen op **h2**                                                                                                                                                                                                                                                                                                                   |
| Nepkoppen: 2× `h2` "Lorem ipsum…" op /interactieve-afbeelding                | 🔧      | Zelfde bevinding als de regel hierboven: het is de **samenvatting** die document-map als kop rendert, niet iets uit het CMS. Twee document-map-widgets op de pagina geven twee `h2`'s                                                                                                                                                                     |
| Lege kop op /reacties ("Voorbeeld 2" direct gevolgd door gelijk niveau)      | ✍️      | Zelfde fix als hierboven: "Voorbeeld" naar h2, dan nestelt de widget-h3 correct                                                                                                                                                                                                                                                                           |
| Lege `<h3>` uit de Reacties-widget                                           | ✍️      | Widgettitel is leeggelaten in de config; vul `[[nr]] reacties` in                                                                                                                                                                                                                                                                                         |
| ~~Tijdlijn mist `aria-current`~~ — opgelost 14-08                            | ✅      | Aangevinkt op het tweede item, live bevestigd. Template zet `aria-current="step"`; auditor stelde `"true"` voor — beide geldig                                                                                                                                                                                                                            |
| Share-links niet als lijst                                                   | ✅      | `ul`/`li`, 6 items                                                                                                                                                                                                                                                                                                                                        |
| Agenda: enkele link in een lijst                                             | ✅      | Pas een `<ul>` vanaf 2 items                                                                                                                                                                                                                                                                                                                              |
| Teller: "ideeën ingestuurd" wordt niet voorgelezen                           | ✅      | `aria-label="56 ideeën ingestuurd"` + `role="status"`                                                                                                                                                                                                                                                                                                     |
| Enquête: 3 `label for` zonder bijbehorende input                             | ✅      | 0 kapotte labels                                                                                                                                                                                                                                                                                                                                          |
| Matrix: lege eerste tabelheader                                              | ✅      | Hoekcel "Onderwerp" + `scope="col"`                                                                                                                                                                                                                                                                                                                       |
| Paginering niet als lijst, niet in een landmark                              | ✅ / ⚠️ | 14-08 live op `/reacties`: `ul` met 7 `li`, knoppen heten "Vorige pagina (Niet beschikbaar)" en "Pagina 1 (Huidige pagina)". Het geheel zit alleen nog in een `div`, niet in `nav[aria-label]`. De lijstsemantiek — de eigenlijke bevinding — is dus opgelost; het landmark was best practice                                                             |
| `aria-describedby` wijst naar een niet-bestaand id                           | 🔧      | **Nieuw, stond niet eerder in dit overzicht** (GTT-33.F48). Elk formulierveld verwees onvoorwaardelijk naar `…_error`, terwijl `form.tsx:437` die `<span>` pas rendert als er een fout ís. 14-08 live gemeten: `/verdeelmodule` 12 van 12 velden, `/enquete` 9. Elf form-elements gelijkgetrokken op de invaliditeitsvlag die er al naast stond, met test |
| Dubbel `id="search"`                                                         | ✅      | `useId()`                                                                                                                                                                                                                                                                                                                                                 |
| Keuzewijzer-score niet voorleesbaar                                          | ✅      | Percentage als tekst in `role="status"`                                                                                                                                                                                                                                                                                                                   |
| Stemmodule: huidige stap niet herkenbaar                                     | ✅      | `aria-current="step"`                                                                                                                                                                                                                                                                                                                                     |
| Submenu "Alle widgets" niet als lijst                                        | ✅      | `ul`/`li`                                                                                                                                                                                                                                                                                                                                                 |

## 1.3.2 Betekenisvolle volgorde

**Pagina's:** /teller

| Bevinding                                          | Status                              |
| -------------------------------------------------- | ----------------------------------- |
| Teller leest cijfers los voor, tekst `aria-hidden` | ✅ Samengevoegd in één `aria-label` |

## 1.3.5 Doel van de invoer

**Pagina's:** /accountgegevens, /inzendingen-overzicht, /inzending-formulier

| Bevinding                                                                                      | Status                                            |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `autocomplete` ontbreekt (naam, gebruikersnaam, postcode) en `tel` had ongeldige waarde `"on"` | ✅ Live: `name`, `username`, `postal-code`, `tel` |

## 1.4.1 Gebruik van kleur

**Pagina's:** /keuzewijzer, /stemmodule, /beeldkiezer

| Bevinding                                  | Status | Toelichting                                                              |
| ------------------------------------------ | ------ | ------------------------------------------------------------------------ |
| Keuzewijzer-scorebalk alleen kleur         | ✅     | Percentage als tekst                                                     |
| Stemmodule: actieve stap alleen kleur      | ✅     | Vinkje op afgeronde stap                                                 |
| Beeldkiezer: gekozen antwoord alleen kleur | ❓     | "✓ Gekozen"-badge zit in de code; verschijnt pas in de samenvattingsstap |

## 1.4.2 Audiobediening

**Pagina's:** /enquete

| Bevinding                   | Status  | Toelichting                                                                                                     |
| --------------------------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| Video speelt automatisch af | ✅ / ✍️ | Code start gepauzeerd, live geen `autoplay=1` in de iframe-src. Controleer dat de demo het niet alsnog forceert |

## 1.4.3 Contrast (minimum)

**Pagina's:** /enquete, /contentwidgets

| Bevinding                                       | Status  | Toelichting                                         |
| ----------------------------------------------- | ------- | --------------------------------------------------- |
| Witte tekst op FilePond-groen `#369763` = 3,6:1 | ✅ / ❓ | Groen → `#2b7d4f` (~5:1); kleurmeting nog handmatig |
| Tijdlijn-hyperlink op grijs = 4,1:1             | ✅ / ❓ | Linkkleur `#0b5394`                                 |

## 1.4.4 Herschalen van tekst (200%)

**Pagina's:** /teller, /reacties, /keuzewijzer, /accountgegevens

| Bevinding                                              | Status  | Toelichting                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Teller: tekst in de blauwe vlakken niet leesbaar       | ✅ / ❓ | `overflow` + relatieve padding                                                                                                                                                                                                                                                                |
| Reacties: paginering valt buiten beeld                 | ✅ / ❓ | `flex-wrap: wrap`                                                                                                                                                                                                                                                                             |
| Keuzewijzer: paneel bedekt het scherm, niet te sluiten | ✅ / ❓ | `max-height` + `overflow-y: auto`                                                                                                                                                                                                                                                             |
| Accountgegevens: e-mailadres niet volledig leesbaar    | ✅ / ❓ | Was een `readOnly` input; nu leestekst met `overflow-wrap: anywhere`. 14-08 live: het e-mailveld is geen input meer. **Let op:** naam, straat, huisnummer, postcode, woonplaats en gebruikersnaam zijn nog wél `readonly` inputs — dezelfde afkapping kan daar optreden, nog te meten op 200% |

## 1.4.10 Reflow (320px / 400%)

**Pagina's:** /enquete, /interactieve-kaart, /begrootmodule, /stemmodule, /keuzewijzer, /accountgegevens en de homepage /

| Bevinding                                                    | Status  | Toelichting                                               |
| ------------------------------------------------------------ | ------- | --------------------------------------------------------- |
| Enquête: vragen, inputs, checkboxen, sliders, kaart, uploads | ✅ / ❓ | Op 320px doorlopen in de dev-harness                      |
| Interactieve kaart                                           | ✅ / ❓ | Grid `min-width: 0`                                       |
| Begroot- en stemmodule: stappen-tijdlijn                     | ✅ / ❓ | Verticale stack onder 480px                               |
| Homepage 400%: sluitknop achter de status-banner             | ✅      | Stacking-context opgelost via `header:has(...)`           |
| Keuzewijzer en accountgegevens                               | 🔧 / ❓ | Volgen 1.4.4                                              |
| Matrix-tabel                                                 | ✅ / ❓ | Card-stack onder 480px; nog handmatig op 320px te checken |

## 1.4.11 Contrast van niet-tekstuele content

**Pagina's:** /enquete

| Bevinding                                                                             | Status                                        |
| ------------------------------------------------------------------------------------- | --------------------------------------------- |
| Uitzoom-icoon `#BBBBBB` = 1,8:1 · voortgangs-dots · scorebalk-track `#A9B2BA` = 2,2:1 | ✅ / ❓ Alle drie donkerder; meting handmatig |

## 1.4.12 Tekstafstand

**Pagina's:** /begrootmodule, /stemmodule

| Bevinding                         | Status                                                         |
| --------------------------------- | -------------------------------------------------------------- |
| Stapnummer valt buiten het rondje | ✅ / ❓ `min-width`/`aspect-ratio`; geverifieerd 28×28 → 30×30 |

## 1.4.13 Content bij hover of focus

**Pagina's:** alle pagina's (menu-item "Alle widgets")

| Bevinding                                                            | Status                                |
| -------------------------------------------------------------------- | ------------------------------------- |
| Submenu "Alle widgets" niet te sluiten zonder de muis te verplaatsen | ✅ Escape sluit en zet de focus terug |

## 2.1.1 Toetsenbord

**Pagina's:** /interactieve-afbeelding, /inzending-formulier, /enquete

| Bevinding                                                   | Status                                     |
| ----------------------------------------------------------- | ------------------------------------------ |
| Reactie plaatsen op kaart/afbeelding kan alleen met de muis | ✅ "Plaats op het midden"-knop met kruisje |

## 2.2.2 Pauzeren, stoppen, verbergen

**Pagina's:** /enquete

| Bevinding                    | Status  | Toelichting                                                                     |
| ---------------------------- | ------- | ------------------------------------------------------------------------------- |
| Automatisch bewegend pijltje | ✅ / ✍️ | Animatie niet meer `infinite` + `prefers-reduced-motion`; vervang de demo-asset |

## 2.4.2 Paginatitel

**Pagina's:** /inzending-detailpagina

| Bevinding                                                | Status | Toelichting                                                                                                                                                                                   |
| -------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inzending-detailpagina heet "Lorem ipsum dolor sit amet" | ✍️     | 14-08 nog steeds "Lorem ipsum dolor sit amet - Inzending detailpagina". De paginanaam erachter helpt, maar het begin — wat schermlezers en tabbladen als eerste tonen — is nog de placeholder |

## 2.4.3 Focusvolgorde

**Pagina's:** /enquete, /projectenoverzicht, /inzendingen-overzicht, /interactieve-afbeelding

| Bevinding                                                         | Status | Toelichting                  |
| ----------------------------------------------------------------- | ------ | ---------------------------- |
| Enquête: focus blijft op de volgende-knop bij paginawissel        | ✅     | Springt naar de eerste vraag |
| Filter-sidebar houdt de focus niet vast                           | ✅     | Focus-trap + Escape          |
| Interactieve afbeelding: focus gaat langs zoom/info vóór de popup | ✅     | Focus springt in de popup    |
| Video: pauzeknop pas bereikbaar via shift-tab                     | ❓     | Niet los geverifieerd        |

## 2.4.4 Linkdoel (in context)

**Pagina's:** alle pagina's (logo + "Alle widgets") en /interactieve-kaart

| Bevinding                                                            | Status | Toelichting                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo-link mist een naam                                              | ✅     | Opgelost 14-08. De auditor vroeg om een `title`; dat is niet nodig en het template biedt er ook geen veld voor. De naam van de link komt uit de `alt` van het logo erin, en die staat nu op "OpenStad.org, naar de homepage" — naam én doel in één. Het footerlogo is géén link en heeft daarom alleen "OpenStad.org" |
| Popup-afbeelding: linkdoel onduidelijk                               | ✅     | `aria-label="Lees verder over {titel}"`                                                                                                                                                                                                                                                                               |
| "Alle widgets" gaat naar dezelfde pagina; voeg link en chevron samen | ⚠️     | **Bewuste afwijking**: gesplitst gelaten. De link wijst nu naar een echte `/alle-widgets`-pagina en de chevron togglet met een naam, dus de kern is weg — maar de auditor kan hierop terugkomen                                                                                                                       |

## 2.4.5 Meerdere manieren

**Pagina's:** sitebreed

| Bevinding                                             | Status | Toelichting                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Links volgen is de enige manier om pagina's te vinden | ✅     | `/sitemap` staat sinds 14-08 live: `h1` "Sitemap", daaronder 31 links verdeeld over vier `h2`'s, subpagina's genest in `ul`/`li`. Geverifieerd tegen `sitemap.xml` — compleet, en de pagina bevat geen naamloze links. De footer wijst er op elke pagina naartoe in plaats van naar het XML-bestand. Navigatie + sitemap zijn samen de twee vereiste manieren |

## 2.4.6 Koppen en labels

**Pagina's:** /inzendingen-overzicht, /reacties, /projectenoverzicht + auth.audit.draad.dev/auth/url/login

| Bevinding                                               | Status                                                  |
| ------------------------------------------------------- | ------------------------------------------------------- |
| Zoekicoon heet "Filters toepassen"                      | ✅ Nu "Zoeken"                                          |
| Auth: "Neem contact met ons op" opent een mailprogramma | ✅ Live "stuur ons een e-mail", op alle vier de plekken |

## 2.4.11 Focus niet verborgen

**Pagina's:** /reacties, /inzendingen-overzicht, /keuzewijzer

| Bevinding                                              | Status                                    |
| ------------------------------------------------------ | ----------------------------------------- |
| Filter-popup: focus loopt door naar elementen erachter | ✅ / ❓ Focus-trap; nog te meten bij 200% |

## 2.5.3 Label in naam

**Pagina's:** auth.audit.draad.dev/auth/url/login, /enquete, /inzending-detailpagina, /inzendingen-overzicht

| Bevinding                                                                   | Status | Toelichting                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| --------------------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aria-label="close message"` op een Nederlandse pagina                      | ✅     | "sluit melding"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Engelse FilePond-knoppen (retry, abort)                                     | ✅     | Vertaald                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Linktekst "Reageer op deze inzending" vs. `aria-label` "Bekijk afbeelding…" | 🔧     | **Bleek géén content.** De zichtbare tekst is de projectstatus van de inzending; die stond binnen de link omdat die het hele `Image`-blok omsloot, statusbalk incl. De link omsluit nu alleen de `<img>` — `Image` kreeg daarvoor `href`/`linkLabel`, de statusbalk blijft als `figcaption` erbuiten. Daarmee is `aria-label` de enige naam en maakt het niet meer uit hoe de status heet. **14-08 live nagemeten: nog niet zichtbaar** — de statusbalk zit daar nog binnen de `<a>`. Commit `71465775a` valt buiten de huidige deploy |
| Zoekicoon "Filters toepassen" terwijl label en placeholder "Zoeken" zijn    | ✅     | Nu "Zoeken"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

## 2.5.7 Sleepbewegingen

**Pagina's:** /interactieve-kaart

| Bevinding                              | Status                                    |
| -------------------------------------- | ----------------------------------------- |
| Kaart alleen met slepen te verplaatsen | ✅ Kompas met pan-knoppen, live bevestigd |

## 2.5.8 Grootte van het doelgebied

**Pagina's:** alle pagina's (chevron naast "Alle widgets")

| Bevinding                                             | Status                 |
| ----------------------------------------------------- | ---------------------- |
| Chevron 20×20 met negatieve marge → 20px tussenruimte | ✅ Live 40×40, marge 0 |

## 3.3.1 Foutidentificatie

**Pagina's:** auth.audit.draad.dev/auth/url/login, /inzending-formulier

| Bevinding                                           | Status | Toelichting                                                                                                                                                                                                                                                                                                                |
| --------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth: e-mailfout is een instructie, geen ontkenning | ✅     | "Dit is geen geldig e-mailadres…"                                                                                                                                                                                                                                                                                          |
| Inzending-formulier: zelfde probleem                | 🔧     | Was géén admin-config: `requiredWarning`/`emailError` zijn nergens in de admin in te vullen, dus de fallback in `packages/form/src/utils/validation.tsx` is altijd wat je ziet. Die stond op "Vul een geldig e-mailadres in" en is nu gelijkgetrokken met de auth-server. Commit `ecf9f99f0` valt buiten de huidige deploy |

## 3.3.2 Labels of instructies

**Pagina's:** /enquete, /reacties

| Bevinding                                               | Status  | Toelichting                                                                                                 |
| ------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------- |
| Slider leest andere waarden voor dan de instructie zegt | ✅ / ✍️ | Sr-only schaal wordt uit de labels gegenereerd; de handmatig getypte omschrijving moet daarmee overeenkomen |
| Reacties: twee invoervelden zonder label                | ✅      | Zichtbaar label "Uw reactie"                                                                                |

## 4.1.2 Naam, rol, waarde

**Pagina's:** /interactieve-afbeelding, /contentwidgets

| Bevinding                                  | Status                                       |
| ------------------------------------------ | -------------------------------------------- |
| "Terug naar boven"-knop zonder naam        | ✅ `aria-label` + `aria-hidden` op het icoon |
| Carousel-knoppen zonder toegankelijke naam | ✅ Live "Vorige/Volgende afbeelding"         |

## 4.1.3 Statusberichten

**Pagina's:** /verdeelmodule, /emoji-slider

| Bevinding                                                   | Status                                                   |
| ----------------------------------------------------------- | -------------------------------------------------------- |
| Budget-overschrijding en "Punten verdelen" niet voorgelezen | ✅ `role="status"` / `aria-live`                         |
| Emoji-slider "Enquête ingediend"                            | ✅ / ❓ Live region aanwezig; melding vereist een submit |

---

# Deel B — Den Haag-inspectie (spreadsheet)

De bevindingen verwijzen naar drie pagina's op `www.denhaag.nl`. Ze worden hieronder afgekort:

| Ref   | Pagina                                                                                                                                                                           |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P** | [/nl/denk-mee/wijkbudget-bloemenbuurt/plannen/](https://www.denhaag.nl/nl/denk-mee/wijkbudget-bloemenbuurt/plannen/)                                                             |
| **O** | [/nl/denk-mee/oracs-laakkwartier-oost/denk-mee-over-oracs-laakkwartier-oost/](https://www.denhaag.nl/nl/denk-mee/oracs-laakkwartier-oost/denk-mee-over-oracs-laakkwartier-oost/) |
| **G** | [/nl/denk-mee/groenprojecten/](https://www.denhaag.nl/nl/denk-mee/groenprojecten/)                                                                                               |

## Nog open volgens de sheet — 9 van de 11 zijn gedekt

| Pagina | Nr    | Bevinding                                        | Status | Toelichting                                                                                                                                                                                                                                                               |
| ------ | ----- | ------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P      | 24915 | Interactieve kaart heeft geen toegankelijke naam | 🔧     | **Het ís een OpenStad-kaart** (de tab "Kaart" laadt `base-map` uit resource-overview). Opgelost: `role="application"` + `aria-label="Interactieve kaart"`. Let op: het `data-draad-aria-label` uit de bevinding staat live níet meer — de kaart heeft simpelweg géén naam |
| O      | 25130 | Kaart mist een skiplink                          | 🔧     | "Sla kaart over" zat alleen in `resource-overview-map`; nu in `BaseMap`, dus in alle vier de kaartvarianten                                                                                                                                                               |
| P      | 24984 | Skiplink krijgt focus maar is onzichtbaar        | 🔧     | Was permanent `clip`-verborgen, ook mét focus; nu zichtbaar bij focus met eigen focusrand                                                                                                                                                                                 |
| P + O  | 25010 | Geen focusindicator op de zoomknoppen            | 🔧     | 3px `#1471ef` (4,5:1 op wit) + `z-index` zodat de rand niet achter de buurknop wegvalt                                                                                                                                                                                    |
| O      | 25135 | Focusindicator op markers haalt 3:1 niet         | 🔧     | Donkere rand met witte halo, werkt op lichte én donkere kaartdelen                                                                                                                                                                                                        |
| P      | 25009 | Uitklapmenu sluit niet, overlapt bij 400%        | 🔧     | Sluit nu op focusverlies en met Escape, focus terug naar de knop                                                                                                                                                                                                          |
| P      | 25006 | Tags/categorieën alleen visueel herkenbaar       | 🔧     | `role="list"`/`listitem` op alle zes de tag-grids; de twee zonder kop erboven krijgen `aria-label="Categorieën"`                                                                                                                                                          |
| P      | 24994 | Checkbox-labels niet gekoppeld                   | ✅     | Was al goed: `htmlFor`/`id` in `multiselect-tag-filter`                                                                                                                                                                                                                   |
| G      | 25031 | Visuele koppen zijn `<strong>`                   | ✅     | Was al goed: `InfoField` rendert een echte kop met instelbaar niveau                                                                                                                                                                                                      |
| P      | 24939 | Statusbalk-contrast 2,5:1 (wit op `#F08600`)     | 🏛️     | Styling bij de gemeente                                                                                                                                                                                                                                                   |
| O      | 25100 | Alinea onterecht als kop gemarkeerd              | 🏛️     | Projectinstelling                                                                                                                                                                                                                                                         |

## Al afgehandeld volgens de sheet

| Pagina | Nr                            | Bevinding                                                      | Aantekening                                                                                                 |
| ------ | ----------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| P      | 25005                         | Linkdoel onduidelijk in context                                | Opgelost via een instelling                                                                                 |
| G      | 25011                         | Knop zonder naam (carousel)                                    | ⚠️ Den Haag meldt 12/13-08 dat de carousel weg is en dat een ándere carousel het probleem nog heeft         |
| O      | 25143                         | Knop zonder naam                                               | ⚠️ Den Haag meldt 13-08: "De knop heeft nog geen toegankelijke naam" — status en werkelijkheid lopen uiteen |
| G      | 25032                         | Visuele lijst niet als lijst gemarkeerd                        | Wordt niet opgelost: er is nu een RTE-functie voor, enquête staat offline                                   |
| O      | 25132 / 25133 / 25134 / 25139 | Tekstalternatief, programmatisch label, linkdoel, kleurgebruik | Wordt niet opgelost: afgerond project; voorstel is de methode voortaan anders in te richten                 |

> **Let op bij 25011 en 25143:** die staan op "Opgelost", maar Den Haag schrijft er op 12 en 13
> augustus bij dat de knop nog steeds geen naam heeft. De carousel-knopnamen ("Vorige/Volgende
> afbeelding") zijn wél live op audit.draad.dev, dus dit is waarschijnlijk hetzelfde
> deploy-verschil. Uitzoeken vóór de hertest.

---

# Deel C — buiten beide rapporten gevonden

| Bevinding                                   | Status  | Toelichting                                                                                                                                                                                                                                                                        |
| ------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dubbele id's bij twee filters op één pagina | 🔧      | `stem-begroot-filter`, `filters-container`, `filter-status`, `sortField`, `locationField`, `proximityField`, `suggestion-list`, `a-b-description` en de placeholder-slugs van de tag-filters. Live op `/inzendingen-overzicht` nog 12 stuks                                        |
| Focus-trap greep de verkéérde filter        | 🔧      | `document.querySelector('#stem-begroot-filter')` pakte altijd de eerste instance; nu via een eigen ref                                                                                                                                                                             |
| Vijf icon-sections met identieke kop-id's   | 🔧      | Op de homepage `icon-section-heading-0` ×5 enz.; `aria-labelledby` wees bij vier van de vijf naar de kop van de eerste sectie                                                                                                                                                      |
| Ontbrekende React-keys in de tag-maps       | 🔧      | Meegenomen bij de lijstsemantiek                                                                                                                                                                                                                                                   |
| Naamloze link om de gridder-afbeelding      | 🔧      | `gridder-resource-detail`: de klikbare afbeelding zat in een `<a>` zonder naam — de `<img>` erin heeft geen alt en dus `role="presentation"`. Zelfde constructie als de 2.5.3-bevinding, ander gebrek. Nu via `href`/`linkLabel` op `Image`                                        |
| Footer stond nog vol themavoorbeelden       | ✅      | Koppen "Kolom 1"/"Kolom 2" en twee links "Link 1"/"Link 2" naar dezelfde pagina. Op 14-08 vervangen door drie echte kolommen; raakt 2.4.4 en 2.4.6, stond in geen van beide rapporten                                                                                              |
| Skiplink mikt op een leeg `<a name="main">` | ⚠️ open | Werkt, maar `name` is verouderd en de focus landt vóór de landmark in plaats van erin. `id="main"` op het `<main>`-element zelf is de nette variant. Zit in het Apostrophe-template, niet in de widgets                                                                            |
| **`npm run build` typecheckt niets**        | ⚠️ open | De `include` in `packages/configs/tsconfig.json` is relatief en resolvet naar `packages/configs/`, dus `tsc` leest **nul bestanden** en geeft altijd exit 0. Aanzetten legt pre-existing fouten bloot in `leaflet-map/parse-location.ts`, `ui/carousel` en `ui/form-elements/text` |

---

# Wat er nu moet gebeuren

Deze twee sporen lopen onafhankelijk van elkaar — de redacteur hoeft niet op de deploy te wachten,
op punt 13 na.

**Spoor 1 — redacteur (nu al mogelijk)**
De 9 acties uit Deel 0A. Ze staan ook als afvinkbare lijst in
[`accessibility-status.md`](accessibility-status.md) § Redacteurs-checklist. Grootste post is de
koppenhiërarchie; actie 2 ("Voorbeeld 1/2" naar h2) lost er in één klap twee op.

**Spoor 2 — ontwikkeling**

1. **Deployen.** Alles met 🔧 is klaar maar staat nergens live. Zonder deploy is er niets te hertesten.
2. **Handmatig meten.** De ❓-punten: reflow op 320px en 400%, resize-text op 200%,
   contrastmetingen, tekstafstand, en de meldingen die pas na een submit verschijnen.
3. **Uitzoeken.** Waarom 25011 en 25143 op "Opgelost" staan terwijl Den Haag het tegendeel meldt.
4. **Overwegen.** Het tsconfig-gat, of "Alle widgets" alsnog één element moet worden (2.4.4), en
   het skiplink-anker naar `id="main"` op `<main>`.
5. **Ná de audit.** Er is nog geen toegankelijkheidsverklaring. Bewuste keuze: die vullen we pas
   in als de bevindingen binnen zijn, anders staat er een status in die we meteen weer moeten
   herzien. Voor een productie-OpenStad bij een gemeente is de verklaring verplicht
   (EU-richtlijn 2016/2102).
