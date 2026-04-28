import { createWidgetConfig } from '../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'NavBar',
  entry: 'src/navBar.tsx',
  usePrefix: false,
});
