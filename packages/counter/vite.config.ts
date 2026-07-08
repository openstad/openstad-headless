import { createWidgetConfig } from '../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'OpenstadHeadlessCounter',
  entry: 'src/counter.tsx',
});
