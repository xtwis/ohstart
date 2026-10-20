import type { RawScriptArgv } from "@shared/argv/schema"
import type { OhstartConfig, ScriptType, SourceConfig } from "@shared/types"
import { spawn } from "node:child_process"
import { join } from "node:path"
import process from "node:process"
import { loadArgvSchema, resolveArgvFile } from "@shared/argv/load"
import { fillRequiredArgs, parseScriptArgv } from "@shared/argv/parse"
import { prompt } from "@shared/prompts"
import { readOhstartJson, readScriptJson } from "@shared/read"
import { loadConfig, saveConfig } from "@/config"
import { cloneSource, parseScriptAddress } from "@/remote"
import { bundleScript } from "@/runtime/bundle"
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
    const meta = await readOhstartJson(workspace.dir)
    const path = meta.scripts[target.name]
    if (!path)
      throw new Error(`unknown script ${target.name} in source ${target.key}`)

    const script = await readScriptJson(workspace.dir, path)
    if (script.name !== target.name)
      throw new Error(`script.json name ${script.name} does not match ${target.name}`)
    if (script.type !== type)
      throw new Error(`script ${target.name} is a ${script.type} script, use \`ohstart ${script.type}\``)

    const scriptDir = join(workspace.dir, path)
    const schema = await loadArgvSchema(await resolveArgvFile(scriptDir, script), SDK_URL)
    const argv = parseScriptArgv(tokens, schema)
    await fillRequiredArgs(schema, argv)

    const bundle = await bundleScript(scriptDir, script.entry ?? "index.ts")
    try {
      const code = await spawnScript(bundle.file, argv)
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

function spawnScript(file: string, argv: RawScriptArgv): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file], {
      cwd: process.cwd(),
      stdio: "inherit",
      env: { ...process.env, OHSTART_ARGV: JSON.stringify(argv) },
    })
    child.once("error", reject)
    child.once("close", code => resolve(code))
  })
}
