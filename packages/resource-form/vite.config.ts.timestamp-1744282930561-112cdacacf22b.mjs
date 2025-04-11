// vite.config.ts
import { defineConfig } from "file:///opt/openstad-headless/packages/resource-form/node_modules/vite/dist/node/index.js";
import react from "file:///opt/openstad-headless/packages/resource-form/node_modules/@vitejs/plugin-react/dist/index.mjs";

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
          entry: "src/resource-form.tsx",
          name: "OpenstadHeadlessResourceForm"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAiLi4vbGliL3ByZWZpeC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9vcHQvb3BlbnN0YWQtaGVhZGxlc3MvcGFja2FnZXMvcmVzb3VyY2UtZm9ybVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL29wdC9vcGVuc3RhZC1oZWFkbGVzcy9wYWNrYWdlcy9yZXNvdXJjZS1mb3JtL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9vcHQvb3BlbnN0YWQtaGVhZGxlc3MvcGFja2FnZXMvcmVzb3VyY2UtZm9ybS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7ZGVmaW5lQ29uZmlnfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHtwcmVmaXh9IGZyb20gJy4uL2xpYi9wcmVmaXgnXG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHtjb21tYW5kfSkgPT4ge1xuICAvLyBXaGVuIHJ1bm5pbmcgaW4gZGV2IG1vZGUsIHVzZSB0aGUgUmVhY3QgcGx1Z2luXG4gIGlmIChjb21tYW5kID09PSAnc2VydmUnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgICAgIGNzczogcHJlZml4KClcbiAgICB9XG4gICAgLy8gRHVyaW5nIGJ1aWxkLCB1c2UgdGhlIGNsYXNzaWMgcnVudGltZSBhbmQgYnVpbGQgYXMgYW4gSUlGRSBzbyB3ZSBjYW4gZGVsaXZlciBpdCB0byB0aGUgYnJvd3NlclxuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBwbHVnaW5zOiBbcmVhY3Qoe2pzeFJ1bnRpbWU6ICdjbGFzc2ljJ30pXSxcbiAgICAgIGNzczogcHJlZml4KCksXG4gICAgICBidWlsZDoge1xuICAgICAgICBsaWI6IHtcbiAgICAgICAgICBmb3JtYXRzOiBbJ2lpZmUnXSxcbiAgICAgICAgICBlbnRyeTogJ3NyYy9yZXNvdXJjZS1mb3JtLnRzeCcsXG4gICAgICAgICAgbmFtZTogJ09wZW5zdGFkSGVhZGxlc3NSZXNvdXJjZUZvcm0nLFxuICAgICAgICB9LFxuICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlbWl4aWNvbi9mb250cy9yZW1peGljb24uY3NzJ10sXG4gICAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgICAgICdyZWFjdCc6ICdSZWFjdCcsXG4gICAgICAgICAgICAgICdyZWFjdC1kb20nOiAnUmVhY3RET00nXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LFxuICAgIH1cbiAgfVxuXG59KVxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvb3B0L29wZW5zdGFkLWhlYWRsZXNzL3BhY2thZ2VzL2xpYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL29wdC9vcGVuc3RhZC1oZWFkbGVzcy9wYWNrYWdlcy9saWIvcHJlZml4LmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9vcHQvb3BlbnN0YWQtaGVhZGxlc3MvcGFja2FnZXMvbGliL3ByZWZpeC5qc1wiO2ltcG9ydCBwcmVmaXhlciBmcm9tICdwb3N0Y3NzLXByZWZpeC1zZWxlY3Rvcic7XG5pbXBvcnQgYXV0b3ByZWZpeGVyIGZyb20gJ2F1dG9wcmVmaXhlcic7XG5cbmV4cG9ydCBjb25zdCBwcmVmaXggPSAoKSA9PiAoe1xuICBwb3N0Y3NzOiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgcHJlZml4ZXIoe1xuICAgICAgICBwcmVmaXg6ICcub3BlbnN0YWQnLFxuICAgICAgICB0cmFuc2Zvcm0ocHJlZml4LCBzZWxlY3RvciwgcHJlZml4ZWRTZWxlY3RvciwgZmlsZVBhdGgsIHJ1bGUpIHtcbiAgICAgICAgICBpZiAoc2VsZWN0b3IubWF0Y2goL14oaHRtbHxib2R5KS8pKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IucmVwbGFjZSgvXihbXlxcc10qKS8sIGAkMSAke3ByZWZpeH1gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VsZWN0b3IubWF0Y2goL14oOnJvb3QpLykpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxlY3Rvci5yZXBsYWNlKC9eKFteXFxzXSopLywgYCR7cHJlZml4fWApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGlmIChmaWxlUGF0aC5tYXRjaCgvbm9kZV9tb2R1bGVzLykpIHtcbiAgICAgICAgICAvLyAgIHJldHVybiBzZWxlY3RvcjtcbiAgICAgICAgICAvLyB9XG5cbiAgICAgICAgICBjb25zdCBhbm5vdGF0aW9uID0gcnVsZS5wcmV2KCk7XG4gICAgICAgICAgaWYgKGFubm90YXRpb24/LnR5cGUgPT09ICdjb21tZW50JyAmJiBhbm5vdGF0aW9uLnRleHQudHJpbSgpID09PSAnbm8tcHJlZml4Jykge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBwcmVmaXhlZFNlbGVjdG9yO1xuICAgICAgICB9LFxuICAgICAgfSksXG4gICAgICBhdXRvcHJlZml4ZXIoe30pXG4gICAgXSxcbiAgfVxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlULFNBQVEsb0JBQW1CO0FBQ3BWLE9BQU8sV0FBVzs7O0FDRCtQLE9BQU8sY0FBYztBQUN0UyxPQUFPLGtCQUFrQjtBQUVsQixJQUFNLFNBQVMsT0FBTztBQUFBLEVBQzNCLFNBQVM7QUFBQSxJQUNQLFNBQVM7QUFBQSxNQUNQLFNBQVM7QUFBQSxRQUNQLFFBQVE7QUFBQSxRQUNSLFVBQVVBLFNBQVEsVUFBVSxrQkFBa0IsVUFBVSxNQUFNO0FBQzVELGNBQUksU0FBUyxNQUFNLGNBQWMsR0FBRztBQUNsQyxtQkFBTyxTQUFTLFFBQVEsYUFBYSxNQUFNQSxPQUFNLEVBQUU7QUFBQSxVQUNyRDtBQUVBLGNBQUksU0FBUyxNQUFNLFVBQVUsR0FBRztBQUM5QixtQkFBTyxTQUFTLFFBQVEsYUFBYSxHQUFHQSxPQUFNLEVBQUU7QUFBQSxVQUNsRDtBQU1BLGdCQUFNLGFBQWEsS0FBSyxLQUFLO0FBQzdCLGVBQUkseUNBQVksVUFBUyxhQUFhLFdBQVcsS0FBSyxLQUFLLE1BQU0sYUFBYTtBQUM1RSxtQkFBTztBQUFBLFVBQ1Q7QUFFQSxpQkFBTztBQUFBLFFBQ1Q7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNELGFBQWEsQ0FBQyxDQUFDO0FBQUEsSUFDakI7QUFBQSxFQUNGO0FBQ0Y7OztBRDNCQSxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFDLFFBQU8sTUFBTTtBQUV6QyxNQUFJLFlBQVksU0FBUztBQUN2QixXQUFPO0FBQUEsTUFDTCxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsTUFDakIsS0FBSyxPQUFPO0FBQUEsSUFDZDtBQUFBLEVBRUYsT0FBTztBQUNMLFdBQU87QUFBQSxNQUNMLFNBQVMsQ0FBQyxNQUFNLEVBQUMsWUFBWSxVQUFTLENBQUMsQ0FBQztBQUFBLE1BQ3hDLEtBQUssT0FBTztBQUFBLE1BQ1osT0FBTztBQUFBLFFBQ0wsS0FBSztBQUFBLFVBQ0gsU0FBUyxDQUFDLE1BQU07QUFBQSxVQUNoQixPQUFPO0FBQUEsVUFDUCxNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0EsZUFBZTtBQUFBLFVBQ2IsVUFBVSxDQUFDLFNBQVMsYUFBYSwrQkFBK0I7QUFBQSxVQUNoRSxRQUFRO0FBQUEsWUFDTixTQUFTO0FBQUEsY0FDUCxTQUFTO0FBQUEsY0FDVCxhQUFhO0FBQUEsWUFDZjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBRUYsQ0FBQzsiLAogICJuYW1lcyI6IFsicHJlZml4Il0KfQo=
