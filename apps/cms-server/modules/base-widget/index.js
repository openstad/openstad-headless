/**
 * A widget for display a title with static content
 */
const previewEnabled = process.env?.DISABLE_WIDGET_PREVIEW !== 'true';

module.exports = {
  extend: '@apostrophecms/widget-type',
  options: {
    preview: previewEnabled,
  }
};
