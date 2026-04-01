import { createWidgetConfig } from '../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'OpenstadHeadlessDistributionModule',
  entry: 'src/distribution-module.tsx',
});
