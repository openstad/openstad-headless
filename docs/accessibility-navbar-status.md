# Toegankelijkheid (WCAG 2.2) — status navBar

Bron: audit `audit.draad.dev` (16-07-2026). Deze batch behandelt de **navBar**-widget
(het 'Alle widgets'-menu met subpagina's). Branch `fix/accessibility-3-3`.

## ✅ Opgelost en gebuild

| WCAG   | Punt                                                 | Oplossing                                                                                                         | Bestand(en)                  |
| ------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| 1.3.1  | Submenu-links waren geen lijst                       | `.submenu` links in `<ul class="submenu-list"><li>`; lijst-CSS + scheidingslijn op `li + li`                      | `menuItem.tsx`, `navBar.css` |
| 1.4.13 | Hover-menu niet te sluiten zonder muis               | Escape sluit het submenu en zet focus terug op de chevron-knop (`onKeyDown` op de item-container)                 | `menuItem.tsx`               |
| 2.4.4  | Chevron opende alleen (nooit sluiten); niet klikbaar | Knop togglet nu open/dicht; `pointer-events: none` verwijderd zodat muis/touch de knop kunnen bedienen            | `menuItem.tsx`, `navBar.css` |
| 2.5.8  | Chevron-knop te dicht op de link (marge -20px)       | `margin-left: -20px` → `0` (geen overlap) + `min-width/height: 24px`                                              | `navBar.css`                 |
| —      | sr-only knop-tekst was zichtbaar                     | Eigen `#navbar .sr-only` toegevoegd (globale `.osc .sr-only` matchte niet omdat de navBar niet onder `.osc` valt) | `navBar.css`                 |

**Keuze:** link + chevron blijven gesplitst (geaccepteerd 'split navigation'-patroon: link
navigeert naar de landingspagina, chevron opent subpagina's), maar nu volledig toetsenbord-,
muis- en touch-bedienbaar met Escape-sluiting.

**Geverifieerd (dev-harness):** submenu = `ul`/`li`; chevron-klik → `aria-expanded=true`;
Escape → `aria-expanded=false` + focus terug; knop 24×40px; sr-only verborgen.

## ✍️ Content-actie (redacteur — buiten de widget-code)

- **Footer-logo alt** (1.1.1): zet de `alt` via config op `"OpenStad.org (logo)"` (bevat de zichtbare tekst).
- **Header-logo link+title** (2.4.4): zit in de CMS/demo-header, niet in een widget — daar het `title`/`alt` aanvullen.
