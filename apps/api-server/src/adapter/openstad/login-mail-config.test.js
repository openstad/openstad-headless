import { describe, expect, it } from 'vitest';

import {
  hasLoginValue,
  readLoadedLoginSection,
  toClientConfig,
} from './login-mail-config.js';

// Stands in for a Sequelize project instance: reading emailConfig runs a getter that parses
// the raw column value, so on a project loaded with a scope that leaves the attribute out
// the getter throws instead of returning undefined.
function projectWithoutEmailConfigLoaded() {
  return {
    id: 2,
    dataValues: { id: 2 },
    get emailConfig() {
      throw new TypeError(
        "Cannot read properties of undefined (reading 'anonymize')"
      );
    },
  };
}

function projectWithEmailConfigLoaded(emailConfig) {
  return { id: 2, dataValues: { id: 2, emailConfig }, emailConfig };
}

describe('readLoadedLoginSection', () => {
  it('returns undefined when the project was loaded without emailConfig', () => {
    expect(readLoadedLoginSection(projectWithoutEmailConfigLoaded())).toBe(
      undefined
    );
  });

  it('returns the login section when emailConfig was loaded', () => {
    const login = { fromAddress: 'login@test.nl', fromName: 'Login' };
    expect(
      readLoadedLoginSection(projectWithEmailConfigLoaded({ login }))
    ).toEqual(login);
  });

  it('returns undefined for a loaded emailConfig without a login section', () => {
    expect(readLoadedLoginSection(projectWithEmailConfigLoaded({}))).toBe(
      undefined
    );
  });

  it('returns undefined when there is no project', () => {
    expect(readLoadedLoginSection(undefined)).toBe(undefined);
  });

  it('reads a plain object that is not a model instance', () => {
    const login = { helpAddress: 'help@test.nl' };
    expect(readLoadedLoginSection({ id: 2, emailConfig: { login } })).toEqual(
      login
    );
  });
});

describe('hasLoginValue', () => {
  it('is false for an empty or absent section', () => {
    expect(hasLoginValue(undefined)).toBe(false);
    expect(hasLoginValue({})).toBe(false);
    expect(
      hasLoginValue({ fromAddress: '', fromName: '', helpAddress: '' })
    ).toBe(false);
  });

  it('is true as soon as one field is filled in', () => {
    expect(hasLoginValue({ fromName: 'Login' })).toBe(true);
  });
});

describe('toClientConfig', () => {
  it('maps the filled in fields to the auth client names', () => {
    expect(
      toClientConfig({
        fromAddress: 'login@test.nl',
        fromName: 'Login',
        helpAddress: 'help@test.nl',
      })
    ).toEqual({
      fromEmail: 'login@test.nl',
      fromName: 'Login',
      contactEmail: 'help@test.nl',
    });
  });

  it('leaves out empty fields so the auth client keeps its current value', () => {
    expect(
      toClientConfig({ fromAddress: 'login@test.nl', fromName: '' })
    ).toEqual({ fromEmail: 'login@test.nl' });
  });

  it('returns an empty object without a login section', () => {
    expect(toClientConfig(undefined)).toEqual({});
  });
});
