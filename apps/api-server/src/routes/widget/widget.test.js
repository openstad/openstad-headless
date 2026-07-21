import { describe, expect, it } from 'vitest';

import { getWidgetJavascriptOutput } from './widget-output.js';

// A minimal widget definition with no js/css files so the bundler does not
// touch the filesystem or resolve real packages.
const widgetSettings = {
  componentName: 'PlainWidget',
  functionName: 'OpenStad',
  packageName: 'plain-widget',
  js: [],
  css: [],
};

describe('getWidgetJavascriptOutput report-load', () => {
  it('omits the report-load call in preview mode', () => {
    const output = getWidgetJavascriptOutput(
      widgetSettings,
      'plainwidget',
      'osc-component-1-2',
      '{}',
      null,
      true // isPreview
    );

    expect(output).not.toContain('/report-load');
  });

  it('includes the report-load call for a regular widget', () => {
    const output = getWidgetJavascriptOutput(
      widgetSettings,
      'plainwidget',
      'osc-component-1-2',
      '{}',
      null,
      false // isPreview
    );

    expect(output).toContain('/report-load');
  });
});
