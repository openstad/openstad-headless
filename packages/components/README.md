# Componenten

Hier is nog niets gedocumenteerd

## Dev: live reload componenten

Dit is nog zeer initieel; onderstaande uitleg is voor Lorenzo op basis van een overlegje dat wij hadden.

Omdat het maar de vraag is of we dit gaan gebruiken stop ik er verder geen tijd in, en moet je nu twee dingen opstarten. In de `headless/packages/components` directory strat je
```
npm run wtach
```
om het compilen van componenten te starten; die doet dat opnieuw bij elke wijziging die je saved.

En daarnaast start je de live reload server met
```
node app.js
```
Die start een webserver op [http://localhost:3333](http://localhost:3333) waar je dan je componenten kunt bekijken.

De configuratie staat voor nu hardcoded in de html files; als we verder gaan dan maka ik dat wat slimmer. Hij verwijst nu, ook hardcoded, naar de default api op http://localhost:31410

Dat werkt allemaal, denk ik.

Dan zou je ook nog echt willen kunnen stemmen of comments toevoegen. Daarvoor heb je twee wijzingingen nodig:
- inloggen zal nu mis gaan omdat hij stokt op 'redirect not allowed'. Je moet `localhost:3333` toevoegen aan de allowedDomains in de projectConfig
- stemmen staat dicht in de default project config, en zul je open moeten zetten. In pltte http:
```
PUT :HOSTNAME/api/project/2
Content-type: application/json
Authorization: JWT

{
  "config": {
    "votes": {
      "isActive": true,
      "requiredUserRole": "anonymous",
      "isViewable": true,
      "voteValues": [
        {
          "label": "I like",
          "value": "yes"
        },
        {
          "label": "Don't know",
          "value": "mayby"
        },
        {
          "label": "I do not like",
          "value": "no"
        }
      ]
    }
  }
}
```

