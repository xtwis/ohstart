import { fileURLToPath } from "node:url"
import { defineConfig } from "tsdown"
import config from "../../tsdown.base.mts"

export default defineConfig({
  ...config,
  alias: {
    "@": fileURLToPath(new URL("src", import.meta.url)),
  },
  entry: {
    index: "src/index.ts",
    sdk: "src/sdk/index.ts",
  },
})
