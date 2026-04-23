import { createWidgetConfig } from '../../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'ApostropheWidgetsButton',
  entry: 'src/button.tsx',
  usePrefix: false,
});
