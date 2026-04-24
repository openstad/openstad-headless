import { createWidgetConfig } from '../../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'ApostropheWidgetsShareLinks',
  entry: 'src/share-links.tsx',
  usePrefix: false,
  bundleReact: true,
});
