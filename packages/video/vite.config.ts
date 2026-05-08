import { createWidgetConfig } from '../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'OpenstadHeadlessVideo',
  entry: 'src/video.tsx',
  defineNodeEnv: false,
});
