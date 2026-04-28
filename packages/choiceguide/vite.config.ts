import { createWidgetConfig } from '../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'OpenstadHeadlessChoiceGuide',
  entry: 'src/choiceguide.tsx',
  externalRemixicon: false,
  libOverrides: { fileName: 'choiceguide' },
  buildOverrides: { outDir: 'dist' },
});
