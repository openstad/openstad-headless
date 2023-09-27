## Getting started

Zet de hele zaak op met Docker.

### 1. Checkout openstad-app git repo

Clone the repo:
```
git clone https://github.com/openstad/openstad-headless
```

And go to that directory and initialize:
```
cd openstad-headless
npm i
```

### 2.

```
npm run create-docker-config
```

### 3.

```
docker-compose -f docker-compose.development.yml --env-file .env.docker up --build
```

### 4,

Je hebt nu drie servers die draaien op localhost:31410, 31430 en 31450. Deze urls zouden allemaal wat moeten doen:

[http://localhost:31410/api/project/1/idea](http://localhost:31410/api/project/1/idea)  
[http://localhost:31430/auth/code/login?clientId=uniquecode](http://localhost:31430/auth/code/login?clientId=uniquecode)  
[http://localhost:31450/image/forum.romanum.06.webp](http://localhost:31450/image/forum.romanum.06.webp)  

### ToDo's

- De servers kunnen nog niet naar elkaar verwijzen. Een login link naar de api wordt nog niet goed omgezet naar een auth url.
- Mailen doet ie nog helemaal niet. Er is wel een mailhog server, dus dat is vermeodelijk vrij simpel
- Configuratie opties zijn nu nog beperkt (gerelateerd: API config/local.js moet er uit)
- De admin sever in apps/web moet nog toegevoegd
- Ik wil er eigenlijk nog een nginx server voor zetten
- De db's zijn nu een kopie van docker-compose.deps-only.yml; die zou je willen hergebruiken ipv kopieren
- Ik heb de Dockerfiles in de apps wat opgeschoond, maar er moet natuurlijk gechecked of die nou nog goed werken



