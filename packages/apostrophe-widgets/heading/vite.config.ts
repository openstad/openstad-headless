import { createWidgetConfig } from '../../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'ApostropheWidgetsHeading',
  entry: 'src/heading.tsx',
  usePrefix: false,
});
