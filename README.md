## OpenStad

This is the monorepo for the OpenStad headless project. To read more about OpenStad visit [the website](https://openstad.org/).

### Docs

Currently the following elements have been documented:

**All**

- [Getting started (dockerized)](doc/getting-started.md)
- [Setup](doc/setup.md)
- [About databases](doc/databases.md)
- [Deployment](doc/deployment.md)
- [Testing](doc/testing.md)

### Development

#### Code formatting

This project uses [Prettier](https://prettier.io/) for code formatting.
A pre-commit hook automatically formats staged files on commit.

**Setup after cloning:**

```
npm install
```

This sets up the Git hooks via Husky's `prepare` script.

**Manual formatting:**

```
npm run format          # format all files
npm run format:check    # check without modifying (used in CI)
```

**API**

- [API configuration](apps/api-server/doc/config.md)
- [Authentication and authorization](apps/api-server/doc/auth.md)
- [Tags: thema's, areas and more](apps/api-server/doc/tags.and.statuses.md)
- [Pagination and search](apps/api-server/doc/pagination-and-search.md)
