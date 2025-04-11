// vite.config.ts
import { defineConfig } from "file:///opt/openstad-headless/packages/counter/node_modules/vite/dist/node/index.js";
import react from "file:///opt/openstad-headless/packages/counter/node_modules/@vitejs/plugin-react/dist/index.mjs";

// ../lib/prefix.js
import prefixer from "file:///opt/openstad-headless/node_modules/postcss-prefix-selector/index.js";
import autoprefixer from "file:///opt/openstad-headless/packages/lib/node_modules/autoprefixer/lib/autoprefixer.js";
var prefix = () => ({
  postcss: {
    plugins: [
      prefixer({
        prefix: ".openstad",
        transform(prefix2, selector, prefixedSelector, filePath, rule) {
          if (selector.match(/^(html|body)/)) {
            return selector.replace(/^([^\s]*)/, `$1 ${prefix2}`);
          }
          if (selector.match(/^(:root)/)) {
            return selector.replace(/^([^\s]*)/, `${prefix2}`);
          }
          const annotation = rule.prev();
          if ((annotation == null ? void 0 : annotation.type) === "comment" && annotation.text.trim() === "no-prefix") {
            return selector;
          }
          return prefixedSelector;
        }
      }),
      autoprefixer({})
    ]
  }
});

// vite.config.ts
var vite_config_default = defineConfig(({ command }) => {
  if (command === "serve") {
    return {
      plugins: [react()],
      css: prefix()
    };
  } else {
    return {
      plugins: [react({ jsxRuntime: "classic" })],
      css: prefix(),
      build: {
        lib: {
          formats: ["iife"],
          entry: "src/counter.tsx",
          name: "OpenstadHeadlessCounter"
        },
        rollupOptions: {
          external: ["react", "react-dom", "remixicon/fonts/remixicon.css"],
          output: {
            globals: {
              "react": "React",
              "react-dom": "ReactDOM"
            }
          }
        }
      }
    };
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vbGliL3ByZWZpeC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9vcHQvb3BlbnN0YWQtaGVhZGxlc3MvcGFja2FnZXMvY291bnRlclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL29wdC9vcGVuc3RhZC1oZWFkbGVzcy9wYWNrYWdlcy9jb3VudGVyL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9vcHQvb3BlbnN0YWQtaGVhZGxlc3MvcGFja2FnZXMvY291bnRlci92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7ZGVmaW5lQ29uZmlnfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHtwcmVmaXh9IGZyb20gJy4uL2xpYi9wcmVmaXgnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHtjb21tYW5kfSkgPT4ge1xuICAgIC8vIFdoZW4gcnVubmluZyBpbiBkZXYgbW9kZSwgdXNlIHRoZSBSZWFjdCBwbHVnaW5cbiAgICBpZiAoY29tbWFuZCA9PT0gJ3NlcnZlJykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcGx1Z2luczogW3JlYWN0KCldLFxuICAgICAgICAgICAgY3NzOiBwcmVmaXgoKVxuICAgICAgICB9XG4gICAgLy8gRHVyaW5nIGJ1aWxkLCB1c2UgdGhlIGNsYXNzaWMgcnVudGltZSBhbmQgYnVpbGQgYXMgYW4gSUlGRSBzbyB3ZSBjYW4gZGVsaXZlciBpdCB0byB0aGUgYnJvd3NlclxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwbHVnaW5zOiBbcmVhY3Qoe2pzeFJ1bnRpbWU6ICdjbGFzc2ljJ30pXSxcbiAgICAgICAgICAgIGNzczogcHJlZml4KCksXG4gICAgICAgICAgICBidWlsZDoge1xuICAgICAgICAgICAgICAgIGxpYjoge1xuICAgICAgICAgICAgICAgICAgICBmb3JtYXRzOiBbJ2lpZmUnXSxcbiAgICAgICAgICAgICAgICAgICAgZW50cnk6ICdzcmMvY291bnRlci50c3gnLFxuICAgICAgICAgICAgICAgICAgICBuYW1lOiAnT3BlbnN0YWRIZWFkbGVzc0NvdW50ZXInLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgICAgICAgICBleHRlcm5hbDogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVtaXhpY29uL2ZvbnRzL3JlbWl4aWNvbi5jc3MnXSxcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3JlYWN0JzogJ1JlYWN0JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVhY3QtZG9tJzogJ1JlYWN0RE9NJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH1cbn0pXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9vcHQvb3BlbnN0YWQtaGVhZGxlc3MvcGFja2FnZXMvbGliXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvb3B0L29wZW5zdGFkLWhlYWRsZXNzL3BhY2thZ2VzL2xpYi9wcmVmaXguanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL29wdC9vcGVuc3RhZC1oZWFkbGVzcy9wYWNrYWdlcy9saWIvcHJlZml4LmpzXCI7aW1wb3J0IHByZWZpeGVyIGZyb20gJ3Bvc3Rjc3MtcHJlZml4LXNlbGVjdG9yJztcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJztcblxuZXhwb3J0IGNvbnN0IHByZWZpeCA9ICgpID0+ICh7XG4gIHBvc3Rjc3M6IHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICBwcmVmaXhlcih7XG4gICAgICAgIHByZWZpeDogJy5vcGVuc3RhZCcsXG4gICAgICAgIHRyYW5zZm9ybShwcmVmaXgsIHNlbGVjdG9yLCBwcmVmaXhlZFNlbGVjdG9yLCBmaWxlUGF0aCwgcnVsZSkge1xuICAgICAgICAgIGlmIChzZWxlY3Rvci5tYXRjaCgvXihodG1sfGJvZHkpLykpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZXBsYWNlKC9eKFteXFxzXSopLywgYCQxICR7cHJlZml4fWApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZWxlY3Rvci5tYXRjaCgvXig6cm9vdCkvKSkge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnJlcGxhY2UoL14oW15cXHNdKikvLCBgJHtwcmVmaXh9YCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gaWYgKGZpbGVQYXRoLm1hdGNoKC9ub2RlX21vZHVsZXMvKSkge1xuICAgICAgICAgIC8vICAgcmV0dXJuIHNlbGVjdG9yO1xuICAgICAgICAgIC8vIH1cblxuICAgICAgICAgIGNvbnN0IGFubm90YXRpb24gPSBydWxlLnByZXYoKTtcbiAgICAgICAgICBpZiAoYW5ub3RhdGlvbj8udHlwZSA9PT0gJ2NvbW1lbnQnICYmIGFubm90YXRpb24udGV4dC50cmltKCkgPT09ICduby1wcmVmaXgnKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3I7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcmV0dXJuIHByZWZpeGVkU2VsZWN0b3I7XG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIGF1dG9wcmVmaXhlcih7fSlcbiAgICBdLFxuICB9XG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVMsU0FBUSxvQkFBbUI7QUFDbFUsT0FBTyxXQUFXOzs7QUNEK1AsT0FBTyxjQUFjO0FBQ3RTLE9BQU8sa0JBQWtCO0FBRWxCLElBQU0sU0FBUyxPQUFPO0FBQUEsRUFDM0IsU0FBUztBQUFBLElBQ1AsU0FBUztBQUFBLE1BQ1AsU0FBUztBQUFBLFFBQ1AsUUFBUTtBQUFBLFFBQ1IsVUFBVUEsU0FBUSxVQUFVLGtCQUFrQixVQUFVLE1BQU07QUFDNUQsY0FBSSxTQUFTLE1BQU0sY0FBYyxHQUFHO0FBQ2xDLG1CQUFPLFNBQVMsUUFBUSxhQUFhLE1BQU1BLE9BQU0sRUFBRTtBQUFBLFVBQ3JEO0FBRUEsY0FBSSxTQUFTLE1BQU0sVUFBVSxHQUFHO0FBQzlCLG1CQUFPLFNBQVMsUUFBUSxhQUFhLEdBQUdBLE9BQU0sRUFBRTtBQUFBLFVBQ2xEO0FBTUEsZ0JBQU0sYUFBYSxLQUFLLEtBQUs7QUFDN0IsZUFBSSx5Q0FBWSxVQUFTLGFBQWEsV0FBVyxLQUFLLEtBQUssTUFBTSxhQUFhO0FBQzVFLG1CQUFPO0FBQUEsVUFDVDtBQUVBLGlCQUFPO0FBQUEsUUFDVDtBQUFBLE1BQ0YsQ0FBQztBQUFBLE1BQ0QsYUFBYSxDQUFDLENBQUM7QUFBQSxJQUNqQjtBQUFBLEVBQ0Y7QUFDRjs7O0FEM0JBLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUMsUUFBTyxNQUFNO0FBRXZDLE1BQUksWUFBWSxTQUFTO0FBQ3JCLFdBQU87QUFBQSxNQUNILFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxNQUNqQixLQUFLLE9BQU87QUFBQSxJQUNoQjtBQUFBLEVBRUosT0FBTztBQUNILFdBQU87QUFBQSxNQUNILFNBQVMsQ0FBQyxNQUFNLEVBQUMsWUFBWSxVQUFTLENBQUMsQ0FBQztBQUFBLE1BQ3hDLEtBQUssT0FBTztBQUFBLE1BQ1osT0FBTztBQUFBLFFBQ0gsS0FBSztBQUFBLFVBQ0QsU0FBUyxDQUFDLE1BQU07QUFBQSxVQUNoQixPQUFPO0FBQUEsVUFDUCxNQUFNO0FBQUEsUUFDVjtBQUFBLFFBQ0EsZUFBZTtBQUFBLFVBQ1gsVUFBVSxDQUFDLFNBQVMsYUFBYSwrQkFBK0I7QUFBQSxVQUNoRSxRQUFRO0FBQUEsWUFDSixTQUFTO0FBQUEsY0FDTCxTQUFTO0FBQUEsY0FDVCxhQUFhO0FBQUEsWUFDakI7QUFBQSxVQUNKO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbInByZWZpeCJdCn0K
