import prefixer from 'postcss-prefix-selector';
import autoprefixer from 'autoprefixer';

export const prefix = () => ({
  postcss: {
    plugins: [
      prefixer({
        prefix: '.openstad',
        transform(prefix, selector, prefixedSelector, filePath, rule) {
          if (selector.match(/^(html|body)/)) {
            return selector.replace(/^([^\s]*)/, `$1 ${prefix}`);
          }

          if (selector.match(/^(:root)/)) {
            return selector.replace(/^([^\s]*)/, `${prefix}`);
          }

          // if (filePath.match(/node_modules/)) {
          //   return selector;
          // }

          const annotation = rule.prev();
          if (annotation?.type === 'comment' && annotation.text.trim() === 'no-prefix') {
            return selector;
          }

          return prefixedSelector;
        },
      }),
      autoprefixer({})
    ],
  }
});
