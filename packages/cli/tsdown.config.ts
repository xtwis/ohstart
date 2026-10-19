import { defineConfig } from "tsdown"
import config from "../../tsdown.base.mts"

export default defineConfig({
  ...config,
  entry: {
    index: "src/index.ts",
    sdk: "src/sdk/index.ts",
  },
})
