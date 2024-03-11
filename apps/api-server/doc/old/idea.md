# Idea

## Inhoud
[Endpoints](#endpoints)
[ExtraData](#extradata)
[ToDo](#todo)

## Endpoints

`GET /api/site/:SITE_ID/idea/`
list all ideas

`POST /api/site/:SITE_ID/idea/`
create an idea

`GET /api/site/:SITE_ID/idea/:IDEA_ID`
view one idea

`PUT /api/site/:SITE_ID/idea/:IDEA_ID`
update one idea

`DELETE /api/site/:SITE_ID/idea/:IDEA_ID`
delete one idea

GET request zijn public, POST is alleen toegankelijk voor admin, de anderen alleen voor admin en de eigenaar

Je kunt aan de GETs query parameters meegeven. Die werken als scopes voor Sequelize; dat komt uit de bestaande app. Bestaande scopes zijn:

`selectRunning`
`includeArguments`
`includeUser`
`includeVoteCount`
`includeUserVote`

## extraData
ideas hebben een extraData veld dat een JSON object bevat. De toegestane waarden daarin worden gedefinieerd in de config van de API van de site.

Ondersteunde veldtypen:
`boolean`
`int`
`string`
`arrayOfStrings`
`enum`
`object`

Object is een special geval; dat verondersteld een subset van definities (zie voorbeeld). Die worden dan recursief gechecked.

Het verwijderen van velden doe je door ze mee te sturen met de waarde `null`.

#### Voorbeelden

Voorbeeld definitie:
```
  "config": {
    "ideas": {
      "extraData": {
        "zomaar": {
          "type": "object",
          "subset": {
            "zomaar sub1": {
              "type": "string",
              "allowNull": true
            },
            "zomaar sub2": {
              "type": "boolean",
              "allowNull": true
            }
          },
          "allowNull": false
        },
        "images": {
          "type": "arrayOfStrings",
          "allowNull": true
        },
        "gebied": {
          "type": "enum",
          "values": [
            "Oud-West",
            "Bos en Lommer",
            "De Baarsjes",
            "Westerpark",
            "West Algemeen"
          ],
          "allowNull": false,
        }
      }
    }
  }
```

Dat zou dan deze voorbeeld data ondersteunen:
```
  "extraData": {
    "zomaar": {
      "zomaar sub1": "Boe",
      "zomaar sub2": true
    },
    "gebied": "De Baarsjes",
    "images": [
      "https://image-server.staging.openstadsdeel.nl/image/kleine-wereld-6428.jpg"
    ]
  }
```


## TODO
- Ik denk dat er een overkoepelend idea zou moeten zijn, maar even overleggen
