import type { Plugin } from "esbuild"
import { rm } from "node:fs/promises"
import { join } from "node:path"
import { build } from "esbuild"
import { SDK_SPECIFIER, SDK_URL } from "@/runtime/sdk"

const BUNDLE_FILE = ".ohstart-run.mjs"

const sdkPlugin: Plugin = {
  name: "ohstart-sdk",
  setup(build) {
    build.onResolve({ filter: new RegExp(`^${SDK_SPECIFIER}$`) }, () => ({ path: SDK_URL, external: true }))
  },
}

export interface ScriptBundle {
  file: string
  dispose: () => Promise<void>
}

export async function bundleScript(scriptDir: string, entry: string): Promise<ScriptBundle> {
  const file = join(scriptDir, BUNDLE_FILE)
  const specifier = `./${entry.replace(/\\/g, "/")}`
  const contents = [
    `import main from ${JSON.stringify(specifier)}`,
    `if (typeof main !== "function")`,
    `  throw new Error("script entry must default-export a function")`,
    `await main()`,
    "",
  ].join("\n")

  try {
    await build({
      stdin: { contents, resolveDir: scriptDir, sourcefile: "ohstart-entry.js", loader: "js" },
      outfile: file,
      bundle: true,
      format: "esm",
      platform: "node",
      target: "node22",
      logLevel: "silent",
      plugins: [sdkPlugin],
    })
  }
  catch (error) {
    throw new Error(`failed to bundle ${entry}: ${error instanceof Error ? error.message : String(error)}`)
  }
  return { file, dispose: () => rm(file, { force: true }) }
}
