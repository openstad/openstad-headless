# Meerdere projecten, één login — uitleg voor het kernteam

> Niet-technische samenvatting van `plans/multi-project-login.md`

## Waar gaat dit over?

Gemeenten zetten steeds vaker widgets van **verschillende OpenStad-projecten op één website**. Bijvoorbeeld: een pagina met een likes-widget van "Herinrichting Centrum" naast een stemwidget van "Begroting Noord". Op dit moment werkt dat niet goed: wie inlogt bij het ene project, wordt uitgelogd bij het andere. Elke login begint bovendien met een verplichte omleiding naar een aparte inlogpagina, waarbij de bezoeker de pagina (en bijvoorbeeld een half ingevulde stem) kwijtraakt.

## Wat willen we bereiken?

**Een bezoeker kan tegelijk ingelogd zijn in meerdere projecten, en inloggen gebeurt op het moment dat het nodig is — in een popup binnen de widget, zonder dat de pagina opnieuw laadt.**

Drie concrete situaties die dit oplost:

1. **Stemcode op het juiste moment.** Iemand is al ingelogd bij project A en klikt op "stem" in een widget van project B, waar een stemcode verplicht is. In plaats van een omleiding naar een andere pagina verschijnt er een klein venster in de widget zelf: "Vul je stemcode in". Na invullen is de stem direct geregistreerd — de pagina blijft gewoon staan.

2. **Alleen vragen wat nog ontbreekt.** Vereist project B extra gegevens (bijvoorbeeld een adres, waar project A alleen een postcode vroeg), dan vraagt datzelfde venster alléén die ontbrekende gegevens. De bezoeker hoeft niet opnieuw het hele inlogproces te doorlopen.

3. **Beheerders hoeven maar één keer in te loggen.** Een beheerder die is ingelogd in het beheer, is daarmee ook ingelogd op alle projecten en hun widgets — één klik maximaal, geen apart inloggen per project.

Daarnaast wordt **uitloggen per project**: wie uitlogt bij project A, blijft ingelogd bij project B. Nu logt uitloggen je overal tegelijk uit.

## Wat verandert er niet?

- **Bestaande sites blijven exact werken zoals nu.** De vertrouwde inlogpagina blijft bestaan als vangnet — bijvoorbeeld als iemand voor het eerst inlogt of als de browser popups blokkeert.
- **Alle veiligheidscontroles blijven van kracht.** Tweestapsverificatie (2FA) en sms-bevestiging kunnen nooit worden omzeild: in die gevallen wordt altijd de volledige, beveiligde inlogflow doorlopen. Er komen extra beveiligingen bij tegen het raden van stemcodes (een limiet op het aantal pogingen).
- **Koppelingen met externe inlogsystemen (SSO/DigiD) vallen buiten dit project.**

## Opt-in: standaard uit

De uitbreiding staat **standaard uit** en wordt per installatie bewust aangezet met een instelling op de server (een zogeheten *environment-flag*, `MULTI_PROJECT_LOGIN`). Zolang die instelling uit staat, gedraagt OpenStad zich precies zoals vandaag. Beheerders van bestaande installaties merken dus niets totdat zij er zelf voor kiezen. Ook terugdraaien is simpel: de instelling weer uitzetten.

## Samengevat

| Nu | Straks (met de flag aan) |
| --- | --- |
| Inloggen bij project B logt je uit bij project A | Tegelijk ingelogd in meerdere projecten |
| Inloggen = omleiding naar aparte pagina, pagina-inhoud kwijt | Popup in de widget, pagina blijft staan |
| Extra gegevens invullen = volledig formulier op een andere pagina | Alleen de ontbrekende gegevens, in hetzelfde venster |
| Uitloggen logt je overal uit | Uitloggen per project |
| Beheerder logt per project opnieuw in | Beheerder is overal ingelogd na één login |
