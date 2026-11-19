import { describe, expect, it } from 'vitest';

import getWidgetSettings from './widget-settings.js';

describe('begrootmodule default config', () => {
  it('describes step 3 without a separate page, so it fits the redirect, popup and dialog login', () => {
    const { step3 } = getWidgetSettings().begrootmodule.defaultConfig;

    expect(step3).toContain('stemcode');
    expect(step3).not.toMatch(/aparte pagina/i);
    expect(step3).not.toMatch(/kom je terug op deze pagina/i);
  });
});
