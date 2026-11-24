import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';

process.env.NODE_CONFIG_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../config'
);
process.env.SUPPRESS_NO_CONFIG_WARNING = '1';

const require = createRequire(import.meta.url);
const db = require('../db');
const { createMailStyling } = require('./mail-styling');

const BRAND_LOGO = 'https://example.com/brand.png';
const LOGIN_LOGO = 'https://example.com/login.png';
const PROJECT_LOGO = 'https://example.com/project.png';

function project({ brandLogo = '', projectLogo, accentColor } = {}) {
  const styling = { logo: brandLogo };
  if (accentColor) styling.accentColor = accentColor;
  const config = projectLogo ? { styling: { logo: projectLogo } } : {};
  return db.Project.build({ id: 1, config, emailConfig: { styling } });
}

function stylingWithLoginLogo(loginLogo) {
  const authClientSettingsFor = vi
    .fn()
    .mockResolvedValue(loginLogo ? { logo: loginLogo } : null);
  return {
    authClientSettingsFor,
    mailStylingFor: createMailStyling({ authClientSettingsFor }),
  };
}

describe('mailStylingFor', () => {
  it('uses the brand logo first, without asking the login settings', async () => {
    const { mailStylingFor, authClientSettingsFor } =
      stylingWithLoginLogo(LOGIN_LOGO);

    const styling = await mailStylingFor(
      project({ brandLogo: BRAND_LOGO, projectLogo: PROJECT_LOGO })
    );

    expect(styling.logo).toBe(BRAND_LOGO);
    expect(authClientSettingsFor).not.toHaveBeenCalled();
  });

  it('falls back to the login page logo', async () => {
    const { mailStylingFor } = stylingWithLoginLogo(LOGIN_LOGO);

    const styling = await mailStylingFor(
      project({ projectLogo: PROJECT_LOGO })
    );

    expect(styling.logo).toBe(LOGIN_LOGO);
  });

  it('then falls back to the project logo', async () => {
    const { mailStylingFor } = stylingWithLoginLogo(null);

    const styling = await mailStylingFor(
      project({ projectLogo: PROJECT_LOGO })
    );

    expect(styling.logo).toBe(PROJECT_LOGO);
  });

  it('gives no logo when none is set anywhere', async () => {
    const { mailStylingFor } = stylingWithLoginLogo(null);

    const styling = await mailStylingFor(project());

    expect(styling.logo).toBe('');
  });

  it('uses the chosen accent color, and the default when none is chosen', async () => {
    const { mailStylingFor } = stylingWithLoginLogo(null);

    expect(
      (await mailStylingFor(project({ accentColor: '#d32f2f' }))).accentColor
    ).toBe('#d32f2f');
    expect((await mailStylingFor(project())).accentColor).toBe('#00325F');
  });
});

describe('emailConfig accent color validation', () => {
  const { accentColorIsHexColor } =
    db.Project.rawAttributes.emailConfig.validate;

  it.each(['#12ab34', '#00325F'])('accepts %s', (accentColor) => {
    expect(() =>
      accentColorIsHexColor({ styling: { accentColor } })
    ).not.toThrow();
  });

  it('accepts an emailConfig without an accent color', () => {
    expect(() => accentColorIsHexColor({})).not.toThrow();
  });

  it.each(['red', '"><script>alert(1)</script>', '#12ab3', ''])(
    'rejects %j',
    (accentColor) => {
      expect(() => accentColorIsHexColor({ styling: { accentColor } })).toThrow(
        'De accentkleur moet een kleurcode zijn'
      );
    }
  );
});
