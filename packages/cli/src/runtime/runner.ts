import type { OhstartConfig, ScriptType, SourceConfig } from "@shared/types"
import process from "node:process"
import { fillRequiredArgs, parseScriptArgv } from "@shared/argv/parse"
import { prompt } from "@shared/prompts"
import { bundleScript } from "@shared/runtime/bundle"
import { prepareScript } from "@shared/runtime/prepare"
import { spawnScript } from "@shared/runtime/spawn"
import { loadConfig, saveConfig } from "@/config"
import { cloneSource, parseScriptAddress } from "@/remote"
import { SDK_URL } from "@/runtime/sdk"

export interface RunScriptOptions {
  type: ScriptType
  address: string
  tokens: string[]
  trust: boolean
}

export async function runScript({ type, address, tokens, trust }: RunScriptOptions): Promise<void> {
  const config = await loadConfig()
  const target = parseScriptAddress(config, address)
  await ensureTrusted(config, target.key, target.source, trust)

  const workspace = await cloneSource(target.source.url)
  try {
    const { scriptDir, script, schema } = await prepareScript({
      root: workspace.dir,
      name: target.name,
      type,
      sdkUrl: SDK_URL,
      sourceLabel: target.key,
    })

    const argv = parseScriptArgv(tokens, schema)
    await fillRequiredArgs(schema, argv)

    const bundle = await bundleScript({ scriptDir, entry: script.entry ?? "index.ts", sdkUrl: SDK_URL })
    try {
      const code = await spawnScript(bundle.file, argv, { cwd: process.cwd() })
      if (code !== 0)
        process.exitCode = code ?? 1
    }
    finally {
      await bundle.dispose()
    }
  }
  finally {
    await workspace.dispose()
  }
}

async function ensureTrusted(
  config: OhstartConfig,
  key: string,
  source: SourceConfig,
  temporaryTrust: boolean,
): Promise<void> {
  if (source.trust === true || temporaryTrust)
    return

  if (!process.stdin.isTTY) {
    throw new Error(`source ${key} is not trusted, pass --trust to allow this run`)
  }

  const accepted = await prompt.confirm(
    `source ${key} (${source.name}) is not trusted: ${source.url}\nsources from this source run arbitrary code, continue?`,
    { default: false },
  )
  if (!accepted)
    throw new Error(`aborted: source ${key} is not trusted`)

  config.source[key] = { ...source, trust: true }
  await saveConfig(config)
}
