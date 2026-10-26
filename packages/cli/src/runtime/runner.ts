import type { OhstartConfig, ScriptType, SourceConfig } from "@shared/types"
import type { AgentSelection } from "@/runtime/agent"
import process from "node:process"
import { fillRequiredArgs, parseScriptArgv } from "@shared/argv/parse"
import { prompt } from "@shared/prompts"
import { bundleScript } from "@shared/runtime/bundle"
import { prepareScript } from "@shared/runtime/prepare"
import { spawnScript } from "@shared/runtime/spawn"
import { text } from "@shared/text"
import { loadConfig, saveConfig } from "@/config"
import { cloneSource, parseScriptAddress } from "@/remote"
import { resolveAgent } from "@/runtime/agent"
import { SDK_URL } from "@/runtime/sdk"

export interface RunScriptOptions {
  type: ScriptType
  address: string
  tokens: string[]
  trust: boolean
  selection: AgentSelection
}

export async function runScript({ type, address, tokens, trust, selection }: RunScriptOptions): Promise<void> {
  const config = await loadConfig()
  const target = parseScriptAddress(config, address)
  await ensureTrusted(config, target.key, target.source, trust)

  const agent = await resolveAgent(selection, process.cwd())

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

    const bundle = await bundleScript({ scriptDir, entry: script.entry ?? text.terms.entryFile, sdkUrl: SDK_URL })
    try {
      const code = await spawnScript(bundle.file, argv, { cwd: process.cwd(), agent })
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
    throw new Error(text.error.source.notTrusted(key))
  }

  const accepted = await prompt.confirm(
    text.question.confirmTrust(key, source.name, source.url),
    { default: false },
  )
  if (!accepted)
    throw new Error(text.error.source.trustAborted(key))

  config.source[key] = { ...source, trust: true }
  await saveConfig(config)
}
