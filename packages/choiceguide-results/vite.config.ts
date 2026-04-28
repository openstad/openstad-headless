import { createWidgetConfig } from '../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'OpenstadHeadlessChoiceGuideResults',
  entry: 'src/choiceguide-results.tsx',
  externalRemixicon: false,
  libOverrides: { fileName: 'choiceguide-results' },
  buildOverrides: { outDir: 'dist' },
});
