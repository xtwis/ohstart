import type { Plugin } from "esbuild"
import { rm } from "node:fs/promises"
import { join } from "node:path"
import { SDK_SPECIFIER } from "@shared/runtime/sdk"
import { build } from "esbuild"

const BUNDLE_FILE = ".ohstart-run.mjs"

export interface BundleScriptOptions {
  scriptDir: string
  entry: string
  sdkUrl: string
  outFile?: string
}

export interface ScriptBundle {
  file: string
  dispose: () => Promise<void>
}

export async function bundleScript({ scriptDir, entry, sdkUrl, outFile }: BundleScriptOptions): Promise<ScriptBundle> {
  const file = outFile ?? join(scriptDir, BUNDLE_FILE)
  const specifier = `./${entry.replace(/\\/g, "/")}`
  const contents = [
    `import main from ${JSON.stringify(specifier)}`,
    `if (typeof main !== "function")`,
    `  throw new Error("script entry must default-export a function")`,
    `await main()`,
    "",
  ].join("\n")

  const sdkPlugin: Plugin = {
    name: "ohstart-sdk",
    setup(build) {
      build.onResolve({ filter: new RegExp(`^${SDK_SPECIFIER}$`) }, () => ({ path: sdkUrl, external: true }))
    },
  }

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
