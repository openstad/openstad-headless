## Testing

### Unit tests (Vitest)

Unit tests are written using Vitest. To run the unit tests, use the following command from the root of the project:

```bash
npm run test:unit
```

Unit tests can also be run in watch mode:

```bash
npm run test:unit:watch
```

When you want to run a test for a specific package, you can use one of the following commands:

```bash
test:unit:admin
test:unit:api
test:unit:auth
test:unit:cms
test:unit:image
```

### Component Tests (Cypress)

Component tests are written using Cypress. To run the component tests, use the following command from the root of the project:

```bash
npm run test:component
```

Because Openstad is a monorepo, running the component tests will run all component tests in all packages. If you want to run the component tests for a specific package, you must go to the specific package directory yourself, and run `npm run test:component` command, e.g.:

```bash
cd packages/ui
npm run test:component
```

### E2E Tests (Cypress)

E2E tests are written using Cypress, and require some setup, as the tests will need to run against a running instance of OpenStad. You can use the `docker-compose.yml` file in the root of the project to start a local instance of OpenStad, in conjunction with the `.testing.env` file.

You can start the local instance of OpenStad with the following command:

```bash
docker-compose --env-file .testing.env up -d -p openstad-e2e
```

**The `-p openstad-e2e` flag will ensure that Docker starts the services under a new project name, which allows us to retain any data we already have for our normal docker-compose project.**

Then you will need to run the init-database and migration commands to fill the database with initial data:

```bash
docker-compose --env-file .testing.env exec openstad-auth-server npm run init-database
docker-compose --env-file .testing.env exec openstad-auth-server npm run migrate-database
docker-compose --env-file .testing.env exec openstad-api-server npm run init-database
docker-compose --env-file .testing.env exec openstad-api-server npm run migrate-database
```

#### Running the end-to-end tests

To run the E2E tests, use the following command from the root of the project:

```bash
npm run test:e2e
```
