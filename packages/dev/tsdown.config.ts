import { defineConfig } from "tsdown"
import config from "../../tsdown.base.mts"

export default defineConfig({
  ...config,
  entry: ["src/cli.ts"],
})
