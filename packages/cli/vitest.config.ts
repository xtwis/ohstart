import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"
import config from "../../vitest.base.mjs"

export default defineConfig({
  ...config,
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
})
