import { createWidgetConfig } from '../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'OpenstadHeadlessVideoSlider',
  entry: 'src/videoSlider.tsx',
  defineNodeEnv: false,
});
