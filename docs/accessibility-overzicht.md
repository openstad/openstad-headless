# Toegankelijkheid — alle bevindingen uit beide onderzoeken

Eén gecombineerde lijst van **audit.draad.dev** (WCAG-EM rapport 16-07-2026, 27 gefaalde
criteria) en de **Den Haag-inspectie** (spreadsheet, 19 rijen). Peildatum: **14-08-2026**.

> **Belangrijk kader:** de code-fixes op branch `fix/accessibility-3-3` staan **nergens live**.
> Op audit.draad.dev draaien nog de widget-bundles van vóór 10-08; denhaag.nl draait een oudere
> versie. Alles met status 🔧 is dus wel opgelost, maar nog niet te hertesten.

## Waar staat wat?

Alle paden in **Deel A** zijn relatief aan `https://audit.draad.dev` (login-pagina's aan
`https://auth.audit.draad.dev`). **Deel B** verwijst naar drie pagina's op `www.denhaag.nl`; die
staan met een eigen legenda bovenaan dat deel.

## Legenda — wie lost het op?

|     | Wie           | Betekenis                                                                     |
| --- | ------------- | ----------------------------------------------------------------------------- |
| ✅  | ontwikkelaar  | Code, live werkend en geverifieerd in de DOM op audit.draad.dev               |
| 🔧  | ontwikkelaar  | Code, opgelost op deze branch maar nog niet gedeployd                         |
| ✍️  | **redacteur** | **Content of configuratie in het CMS/de admin — code kan dit niet afdwingen** |
| 🏛️  | gemeente      | Buiten OpenStad: styling of projectinstelling                                 |
| ❓  | tester        | Vereist handmatige meting of interactie, niet automatisch te controleren      |

Sommige regels hebben twee markeringen (bv. ✅ / ✍️). Dan is de code klaar, maar moet de
redacteur nog iets zetten voordat het effect heeft. Dat staat er dan expliciet bij.

---

# Deel 0 — de scheidslijn: content of code?

## A. Kan de redacteur zelf oplossen — 11 acties

Geen enkele hiervan vraagt een release. Alles kan vandaag in het CMS of de admin.

| #   | Actie                                                                                                                            | Pagina                                                                                                                          | Lost op                                                                                                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1   | Logo-**link** een naam geven ("Naar de homepage")                                                                                | Sitebreed — header- en footerconfig                                                                                             | 2.4.4                                                                                                         |
| 2   | "Voorbeeld 1/2: …"-koppen van h3 naar **h2**                                                                                     | `/aftelbalk` en `/reacties` (en dezelfde opzet op de andere widgetpagina's)                                                     | 1.3.1 — lost twee bevindingen tegelijk op: de scheve hiërarchie op /aftelbalk **én** de lege kop op /reacties |
| 3   | Widgettitel Reacties invullen (`[[nr]] reacties`)                                                                                | `/reacties` — widgetconfig                                                                                                      | 1.3.1 — nu een lege `<h3>`                                                                                    |
| 4   | Demo-inzending een echte titel geven                                                                                             | `/inzending-detailpagina` — de resource zelf                                                                                    | 2.4.2 — `<title>` begint nog met "Lorem ipsum"                                                                |
| 5   | Zoekfunctie en/of sitemap toevoegen                                                                                              | Sitebreed — navigatie                                                                                                           | 2.4.5                                                                                                         |
| 6   | Linktekst "Reageer op deze inzending" → "Bekijk afbeelding"                                                                      | `/inzending-detailpagina` — widgetconfig                                                                                        | 2.5.3                                                                                                         |
| 7   | Schaaltekst bij de slider gelijktrekken met de ingestelde labels                                                                 | `/enquete` — het sliderveld                                                                                                     | 3.3.2                                                                                                         |
| 8   | Foutmeldingen als ontkenning herschrijven, niet als instructie                                                                   | `/inzending-formulier` — `requiredWarning` per veld                                                                             | 3.3.1                                                                                                         |
| 9   | Autoplay uit                                                                                                                     | `/enquete` — de video                                                                                                           | 1.4.2                                                                                                         |
| 10  | Auto-animerende pijl vervangen door een statische                                                                                | `/enquete` — demo-asset                                                                                                         | 2.2.2                                                                                                         |
| 11  | **Ná de deploy:** kopniveau per widget zetten (op deze pagina's **h4**, want de widgets staan er onder een `h3` "Voorbeeld 1/2") | `/interactieve-afbeelding`, `/inzending-detailpagina`, `/begrootmodule`, `/stemmodule` — admin, select "Kopniveau van de titel" | 1.3.1                                                                                                         |

Al gedaan door de redacteur: logo-`alt` staat inmiddels op "OpenStad.org (logo)", de
`<strong>`-kop is een echte `H3`, de paginatitels zijn beschrijvend, en de tijdlijn op
/contentwidgets heeft sinds 14-08 `aria-current="step"` op de tweede fase.

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

> ⚠️ **Let op — deze leken content, maar zijn het niet.** De "3× `h1`" en de 2× "nepkop Lorem
> ipsum" stonden aanvankelijk op de redacteurslijst. Ze komen allebei uit de widgets zelf: de
> `h1` is de titel van de inzending, de `h2` is de samenvatting die `document-map` als kop
> rendert. Op /interactieve-afbeelding staan twee document-map-widgets, vandaar twee van elk.
> Wie hiervoor in het CMS gaat zoeken vindt niets om aan te passen — er ís daar niets.
>
> En andersom: de "lege `<h3>`" op /reacties en de ontbrekende `aria-current` op de tijdlijn
> zien er uit als codefouten, maar zijn een leeg configveld en een niet-aangevinkt vinkje.

## C. Ligt bij de gemeente

| Pagina | Nr    | Bevinding                                    | Type              |
| ------ | ----- | -------------------------------------------- | ----------------- |
| P      | 24939 | Statusbalk-contrast 2,5:1 (wit op `#F08600`) | Styling           |
| O      | 25100 | Alinea onterecht als kop gemarkeerd          | Projectinstelling |

---

# Deel A — audit.draad.dev (27 gefaalde criteria)

## 1.1.1 Niet-tekstuele content

**Pagina's:** /interactieve-kaart, /inzendingen-overzicht, /reacties, /projectenoverzicht, /contentwidgets + het logo op alle pagina's

| Bevinding                                              | Status | Toelichting                                                                                                                                                                                                                                                     |
| ------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Duim-omhoog en tekstwolkje lezen alleen het getal voor | 🔧     | `resource-overview` heeft twee kaartvarianten; alleen de klikbare had een `description`. De read-only variant — die op `/interactieve-kaart` staat — niet. Ook gevonden in de begroot-resourcelijst en -detaildialoog, incl. trofee-teller. Zes stuks aangevuld |
| Zoekicoon heet "Filters toepassen"                     | ✅     | Nu "Zoeken", op alle drie de pagina's                                                                                                                                                                                                                           |
| Popup-afbeelding als link mist alt                     | ✅     | Gedeelde `Image` forceerde altijd `role="presentation"`; nu conditioneel                                                                                                                                                                                        |
| Accordeon-chevron leest als "afbeelding"               | ✅     | `aria-hidden="true"` op de icon-wrapper                                                                                                                                                                                                                         |
| Logo-alt bevat niet de zichtbare merknaam              | ✅     | Staat live op "OpenStad.org (logo)" — door de redacteur opgepakt                                                                                                                                                                                                |

## 1.3.1 Info en relaties — grootste post

**Pagina's:** /aftelbalk, /interactieve-afbeelding, /inzending-detailpagina, /begrootmodule, /stemmodule, /enquete, /contentwidgets, /agenda, /teller, /reacties, /keuzewijzer

| Bevinding                                                                    | Status | Toelichting                                                                                                                                                                           |
| ---------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3× `h1` op interactieve-afbeelding, inzending-detail, begroot- en stemmodule | 🔧     | Bleek géén content: `document-map`, `resource-detail` en `stem-begroot` zetten de titel hard op `level={1}`. Nu instelbaar kopniveau, default h2                                      |
| Samenvatting opgemaakt als `h2` ("dit is geen kop, maar grote tekst")        | 🔧     | 5× in document-map, 1× in resource-detail; nu `<Paragraph>` met dezelfde styling                                                                                                      |
| Overgeslagen niveaus h2→h4 en h4→h6 (likes), h3→h5 (begroot-zijbalk)         | 🔧     | Subkoppen volgen nu het kopniveau van de widget                                                                                                                                       |
| `<strong>` als kop ("Jouw buurt, jouw toekomst")                             | ✅     | `InfoField` rendert een echte kop; live nu een `H3`                                                                                                                                   |
| Aftelbalk: "Voorbeeld 1" lijkt subkop van "Hoe maak je de widget op maat?"   | ✍️     | Zet de "Voorbeeld 1/2"-koppen op **h2**                                                                                                                                               |
| Nepkoppen: 2× `h2` "Lorem ipsum…" op /interactieve-afbeelding                | 🔧     | Zelfde bevinding als de regel hierboven: het is de **samenvatting** die document-map als kop rendert, niet iets uit het CMS. Twee document-map-widgets op de pagina geven twee `h2`'s |
| Lege kop op /reacties ("Voorbeeld 2" direct gevolgd door gelijk niveau)      | ✍️     | Zelfde fix als hierboven: "Voorbeeld" naar h2, dan nestelt de widget-h3 correct                                                                                                       |
| Lege `<h3>` uit de Reacties-widget                                           | ✍️     | Widgettitel is leeggelaten in de config; vul `[[nr]] reacties` in                                                                                                                     |
| ~~Tijdlijn mist `aria-current`~~ — opgelost 14-08                            | ✅     | Aangevinkt op het tweede item, live bevestigd. Template zet `aria-current="step"`; auditor stelde `"true"` voor — beide geldig                                                        |
| Share-links niet als lijst                                                   | ✅     | `ul`/`li`, 6 items                                                                                                                                                                    |
| Agenda: enkele link in een lijst                                             | ✅     | Pas een `<ul>` vanaf 2 items                                                                                                                                                          |
| Teller: "ideeën ingestuurd" wordt niet voorgelezen                           | ✅     | `aria-label="56 ideeën ingestuurd"` + `role="status"`                                                                                                                                 |
| Enquête: 3 `label for` zonder bijbehorende input                             | ✅     | 0 kapotte labels                                                                                                                                                                      |
| Matrix: lege eerste tabelheader                                              | ✅     | Hoekcel "Onderwerp" + `scope="col"`                                                                                                                                                   |
| Paginering niet als lijst, niet in een landmark                              | ✅     | `nav[aria-label="Paginering"] > ul > li`                                                                                                                                              |
| Dubbel `id="search"`                                                         | ✅     | `useId()`                                                                                                                                                                             |
| Keuzewijzer-score niet voorleesbaar                                          | ✅     | Percentage als tekst in `role="status"`                                                                                                                                               |
| Stemmodule: huidige stap niet herkenbaar                                     | ✅     | `aria-current="step"`                                                                                                                                                                 |
| Submenu "Alle widgets" niet als lijst                                        | ✅     | `ul`/`li`                                                                                                                                                                             |

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

| Bevinding                                              | Status  | Toelichting                                                          |
| ------------------------------------------------------ | ------- | -------------------------------------------------------------------- |
| Teller: tekst in de blauwe vlakken niet leesbaar       | ✅ / ❓ | `overflow` + relatieve padding                                       |
| Reacties: paginering valt buiten beeld                 | ✅ / ❓ | `flex-wrap: wrap`                                                    |
| Keuzewijzer: paneel bedekt het scherm, niet te sluiten | ✅ / ❓ | `max-height` + `overflow-y: auto`                                    |
| Accountgegevens: e-mailadres niet volledig leesbaar    | 🔧      | Was een `readOnly` input; nu leestekst met `overflow-wrap: anywhere` |

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

| Bevinding                                                | Status | Toelichting                                                                                               |
| -------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| Inzending-detailpagina heet "Lorem ipsum dolor sit amet" | ✍️     | Titel is nu "Lorem ipsum dolor sit amet - Inzending detailpagina": beter, maar begint nog met Lorem ipsum |

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

| Bevinding                                                            | Status | Toelichting                                                                                                                                                                                     |
| -------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Logo-link mist een naam                                              | ✍️     | De `alt` is inmiddels goed, de **link** heeft nog geen `title`/naam                                                                                                                             |
| Popup-afbeelding: linkdoel onduidelijk                               | ✅     | `aria-label="Lees verder over {titel}"`                                                                                                                                                         |
| "Alle widgets" gaat naar dezelfde pagina; voeg link en chevron samen | ⚠️     | **Bewuste afwijking**: gesplitst gelaten. De link wijst nu naar een echte `/alle-widgets`-pagina en de chevron togglet met een naam, dus de kern is weg — maar de auditor kan hierop terugkomen |

## 2.4.5 Meerdere manieren

**Pagina's:** sitebreed

| Bevinding                                             | Status                                                        |
| ----------------------------------------------------- | ------------------------------------------------------------- |
| Links volgen is de enige manier om pagina's te vinden | ✍️ Live nog geen zoekveld en geen sitemap in header of footer |

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

| Bevinding                                                                   | Status | Toelichting                                                                     |
| --------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------- |
| `aria-label="close message"` op een Nederlandse pagina                      | ✅     | "sluit melding"                                                                 |
| Engelse FilePond-knoppen (retry, abort)                                     | ✅     | Vertaald                                                                        |
| Linktekst "Reageer op deze inzending" vs. `aria-label` "Bekijk afbeelding…" | ✍️     | Het `aria-label` is correct; de zichtbare tekst moet "Bekijk afbeelding" worden |
| Zoekicoon "Filters toepassen" terwijl label en placeholder "Zoeken" zijn    | ✅     | Nu "Zoeken"                                                                     |

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

| Bevinding                                           | Status | Toelichting                                                 |
| --------------------------------------------------- | ------ | ----------------------------------------------------------- |
| Auth: e-mailfout is een instructie, geen ontkenning | ✅     | "Dit is geen geldig e-mailadres…"                           |
| Inzending-formulier: zelfde probleem                | ✍️     | De veldteksten (`requiredWarning`) staan in de admin-config |

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
| **`npm run build` typecheckt niets**        | ⚠️ open | De `include` in `packages/configs/tsconfig.json` is relatief en resolvet naar `packages/configs/`, dus `tsc` leest **nul bestanden** en geeft altijd exit 0. Aanzetten legt pre-existing fouten bloot in `leaflet-map/parse-location.ts`, `ui/carousel` en `ui/form-elements/text` |

---

# Wat er nu moet gebeuren

Deze twee sporen lopen onafhankelijk van elkaar — de redacteur hoeft niet op de deploy te wachten,
op punt 13 na.

**Spoor 1 — redacteur (nu al mogelijk)**
De 11 acties uit Deel 0A. Ze staan ook als afvinkbare lijst in
[`accessibility-status.md`](accessibility-status.md) § Redacteurs-checklist. Grootste post is de
koppenhiërarchie; actie 2 ("Voorbeeld 1/2" naar h2) lost er in één klap twee op.

**Spoor 2 — ontwikkeling**

1. **Deployen.** Alles met 🔧 is klaar maar staat nergens live. Zonder deploy is er niets te hertesten.
2. **Handmatig meten.** De ❓-punten: reflow op 320px en 400%, resize-text op 200%,
   contrastmetingen, tekstafstand, en de meldingen die pas na een submit verschijnen.
3. **Uitzoeken.** Waarom 25011 en 25143 op "Opgelost" staan terwijl Den Haag het tegendeel meldt.
4. **Overwegen.** Het tsconfig-gat, en of "Alle widgets" alsnog één element moet worden (2.4.4).
