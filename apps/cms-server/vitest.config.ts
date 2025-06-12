import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
        "modules/openstad-assets/ui/src/vendor/bootstrap/js/tests/*",
    ]
  },
})
