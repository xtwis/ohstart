import { defineConfig } from "tsdown"
import config from "../../tsdown.base.ts"

export default defineConfig({
  ...config,
  tsconfig: "tsconfig.build.json",
  entry: ["src/cli.ts"],
})
