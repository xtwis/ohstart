import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"
import config from "../../vitest.base.ts"

const { name, version } = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8")) as { name: string, version: string }

export default defineConfig({
  ...config,
  define: {
    __PACKAGE_NAME__: JSON.stringify(name),
    __VERSION__: JSON.stringify(version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
  },
  resolve: {
    alias: [
      { find: "@shared", replacement: fileURLToPath(new URL("../../shared", import.meta.url)) },
      { find: "@", replacement: fileURLToPath(new URL("src", import.meta.url)) },
    ],
  },
})
