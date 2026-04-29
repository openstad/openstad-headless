import { createWidgetConfig } from '../../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'ApostropheWidgetsAlertBox',
  entry: 'src/alert-box.tsx',
  usePrefix: false,
  bundleReact: true,
});
