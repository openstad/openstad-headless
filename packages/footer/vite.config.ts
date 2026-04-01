import { createWidgetConfig } from '../lib/vite.config.factory';

export default createWidgetConfig({
  name: 'Footer',
  entry: 'src/footer.tsx',
  usePrefix: false,
  outputOverrides: {
    assetFileNames: (assetInfo: { name?: string }) => {
      if (assetInfo.name === 'style.css') return 'footer.css';
      return assetInfo.name ?? 'asset';
    },
  },
});
