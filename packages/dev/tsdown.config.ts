import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { defineConfig } from "tsdown"
import config from "../../tsdown.base.ts"

const { version } = JSON.parse(readFileSync(new URL("package.json", import.meta.url), "utf8")) as { version: string }

export default defineConfig({
  ...config,
  alias: {
    "@": fileURLToPath(new URL("src", import.meta.url)),
    "@shared": fileURLToPath(new URL("../../shared", import.meta.url)),
  },
  define: {
    __VERSION__: JSON.stringify(version),
  },
  tsconfig: "tsconfig.build.json",
  entry: {
    index: "src/index.ts",
    api: "src/api.ts",
  },
})
