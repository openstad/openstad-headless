#!/bin/bash
# Run Cypress component tests for a single package.
# Called from a package directory via: npm run test:component
# Resolves the repo root and runs Cypress with the correct spec pattern.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Determine the package path relative to the repo root
PACKAGE_DIR="$(pwd)"
REL_PATH="${PACKAGE_DIR#"$ROOT_DIR/"}"

cd "$ROOT_DIR" && npx cypress run --component --spec "$REL_PATH/cypress/component/**/*.cy.{js,jsx,ts,tsx}" "$@"
