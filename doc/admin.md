# Admin and superusers

De admin server bied mogelijkhedenaan gerechtigde gebruikers om projecten te beheren.

Teneinde dat te laten werken voor gebruikers die alleen rechten hebben op specifieke projecten is dat als volgt opgezet:

- iedereen met minstens member rechten op de admin server kan daar inloggen. Je ziet dan een lijst avn de projecten waar je admin rechten hebt
- ga je naar één van die projecten dan log je opnieuw in, nu op dat specifieke project. Omdat de outh server single signon is merk je daar normaliter niets van. Het kan natuurlijk wel dat een login op een project specifieke eisaen stelt (sfa, extra velden) waar dan alsnog aan moet worden voldaan.
- heb je admin rechten op project 1 (het 'Admin project') dan ben je 'superuser'. Je mag dan alles op alle projecten, inclusief projecten aanmaken en users bewerken.

Alle settings lopen via de API; direct beheer op de auth server is niet wenselijk.

De API herkent users die admin zijn op het 'Admin project' (configureerbaar) als superusers.

Deze opzet heeft als bijkomend voordeel dat je, als ingelogde gebruiker op een project, zowel op cms als op admin ingelogd kunt zijn.

## TODO:

- signout geeft een error, ik denk omdat hij in dev twee jkeer de pagina opvraagt. Het werkt wel gewoon, maar is slordig.
- unique codes moet via de api gaan lopen
- het hoofdmenu moet nog context gevoelig worden
- het zou duidelijker moeten zijn op de auth server waar je inlogt

