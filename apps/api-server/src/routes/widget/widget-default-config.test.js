import { beforeEach, describe, expect, it } from 'vitest';

import getDefaultConfig from './widget-default-config.js';

const apiConfig = { url: 'https://api.example.com' };

describe('getDefaultConfig login urls', () => {
  beforeEach(() => {
    process.env.IMAGE_APP_URL = 'https://images.example.com';
  });

  it('omits forceNewLogin without the project config flag', () => {
    const result = getDefaultConfig({ id: 2, config: {} }, 'likes', apiConfig);

    expect(result.login.url).toBe(
      'https://api.example.com/auth/project/2/login?useAuth=default&redirectUri=[[REDIRECT_URI]]'
    );
    expect(result.login.anonymous.url).toBe(
      'https://api.example.com/auth/project/2/login?useAuth=anonymous&redirectUri=[[REDIRECT_URI]]'
    );
  });

  it('adds forceNewLogin=1 when forceNewLoginOnWidgets is set', () => {
    const project = {
      id: 2,
      config: { auth: { forceNewLoginOnWidgets: true } },
    };
    const result = getDefaultConfig(project, 'likes', apiConfig);

    expect(result.login.url).toBe(
      'https://api.example.com/auth/project/2/login?useAuth=default&forceNewLogin=1&redirectUri=[[REDIRECT_URI]]'
    );
    expect(result.login.anonymous.url).toBe(
      'https://api.example.com/auth/project/2/login?useAuth=anonymous&forceNewLogin=1&redirectUri=[[REDIRECT_URI]]'
    );
  });

  it('keeps the gtm environment in the output', () => {
    process.env.GTM_ENVIRONMENT = 'acc';
    const result = getDefaultConfig({ id: 2, config: {} }, 'likes', apiConfig);

    expect(result.gtmEnvironment).toBe('acc');
  });

  it('falls back to the prod gtm environment', () => {
    delete process.env.GTM_ENVIRONMENT;
    const result = getDefaultConfig({ id: 2, config: {} }, 'likes', apiConfig);

    expect(result.gtmEnvironment).toBe('prod');
  });

  it('keeps the logout url unchanged', () => {
    const result = getDefaultConfig({ id: 2, config: {} }, 'likes', apiConfig);

    expect(result.logout.url).toBe(
      'https://api.example.com/auth/project/2/logout?useAuth=default&redirectUri=[[REDIRECT_URI]]'
    );
  });
});
