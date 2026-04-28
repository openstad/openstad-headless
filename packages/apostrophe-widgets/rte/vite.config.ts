import { createWidgetConfig } from '../../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'ApostropheWidgetsRTE',
  entry: 'src/rte.tsx',
  usePrefix: false,
});
