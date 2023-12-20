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

### 2. Create configuration

```
npm run create-docker-config
```

You may want to note the login code that is shown for later use.

You can re-run this command, but you may want to read the [notes](#Notes) first.

### 3. Docker compose

```
docker-compose up --build
```

### 4. What to expect

You now have four servers, running on localhost:31410, 31430, 31450 and 31470. These urls should work:

[http://localhost:31410/api/project/1/resource](http://localhost:31410/api/project/1/resource)  
[http://localhost:31430/auth/code/login?clientId=uniquecode](http://localhost:31430/auth/code/login?clientId=uniquecode)  
[http://localhost:31450/image/forum.romanum.06.webp](http://localhost:31450/image/forum.romanum.06.webp)  
[http://localhost:31470](http://localhost:31470)

You are now done. Everything below this line is extra information for the incurably curious.

### important notes for the admin server > widget management pages
Each widget management page shows a preview of how the widget will look given a set of configurations.
To make this work however, one must first use the command "npm run build" in the specific widget (in the packages > [widget] folder). This is only neccesary in development. In production these widgets are already prebuild.

### Code

The code is mounted from the `/apps` dirs in the repo, and run using `nodemon`. That means that changes in the code will immediately be available.

### Docker containers

Six docker containers have been created:

- openstad-mysql
- openstad-mailhog
- openstad-api-server
- openstad-auth-server
- openstad-image-serve
- openstad-admin-serve

### Initial data

During setup the databases are filled with some initial data, as described in the [databases](./databases.md) documentation.

To rerun the database initialisation, e.g. for the api, run

```
docker exec openstad-api-server bash -c "npm run init-database"
```

To connect directly to the database use

```
mysql -h 127.0.0.1 -u root -p
```

You can find the password in the `.env` file

### More configuration options

The `npm run create-docker-config` command above uses the `.env` file to overwrite default settings.

You can use this to create a simpler initial login code:

```
AUTH_FIRST_LOGIN_CODE=123
```

or mysql password:

```
DB_PASSWORD=123
```

or use an existing database server:

```
DB_HOST=
DB_USERNAME=
DB_PASSWORD=
API_DB_NAME=
AUTH_DB_NAME=
```

### If everything else fails

Try deleting your existing containers and volumes:

```
docker-compose down -v
```

### ToDo's

- Verzin een oplossing voor het issue onder notes
- Mailen doet ie nog helemaal niet. Er is wel een mailhog server, dus dat is vermoedelijk vrij simpel
- Configuratie opties zijn nu nog beperkt (gerelateerd: API config/local.js moet er uit)
- Ik wil er eigenlijk nog een nginx server voor zetten
- De db's zijn nu een kopie van docker-compose.deps-only.yml; die zou je willen hergebruiken ipv kopieren
- Ik heb de Dockerfiles in de apps wat opgeschoond, maar er moet natuurlijk gechecked of die nou nog goed werken
