import { createWidgetConfig } from '../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'OpenstadHeadlessSwipe',
  entry: 'src/swipe.tsx',
  defineNodeEnv: false,
});
