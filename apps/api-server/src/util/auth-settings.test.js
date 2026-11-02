import { createRequire } from 'module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const authSettings = require('./auth-settings');

const projectWithStoredClientConfig = {
  config: {
    auth: {
      default: 'openstad',
      provider: {
        openstad: {
          clientId: 'project-client',
          clientSecret: 'project-secret',
          config: {
            requiredFields: { requiredUserFieldsLabels: { name: '' } },
          },
        },
      },
    },
  },
};

describe('configForClientUpdate', () => {
  it('leaves out the client config stored on the project', async () => {
    const authConfig = await authSettings.configForClientUpdate({
      project: projectWithStoredClientConfig,
      useAuth: 'openstad',
    });

    expect(authConfig.config).toBeUndefined();
    expect(authConfig.clientId).toBe('project-client');
    expect(authConfig.provider).toBe('openstad');
  });

  it('matches the regular config apart from the client config', async () => {
    const regular = await authSettings.config({
      project: projectWithStoredClientConfig,
      useAuth: 'openstad',
    });
    const forUpdate = await authSettings.configForClientUpdate({
      project: projectWithStoredClientConfig,
      useAuth: 'openstad',
    });
    const { config: _storedClientConfig, ...rest } = regular;

    expect(forUpdate).toEqual(rest);
  });
});
