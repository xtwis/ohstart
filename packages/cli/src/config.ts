import type { OhstartConfig } from "@shared/types"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import { dirname, join } from "node:path"
import process from "node:process"

export function resolveConfigPath(
  env: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
): string {
  if (env.XDG_CONFIG_HOME)
    return join(env.XDG_CONFIG_HOME, "ohstart", "config.json")
  if (platform === "win32") {
    return join(env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "ohstart", "config.json")
  }
  return join(homedir(), ".config", "ohstart", "config.json")
}

export async function loadConfig(path: string = resolveConfigPath()): Promise<OhstartConfig> {
  let raw: string
  try {
    raw = await readFile(path, "utf8")
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return { source: {} }
    throw error
  }
  const parsed = JSON.parse(raw) as Partial<OhstartConfig>
  return { source: parsed.source ?? {}, default: parsed.default }
}

export async function saveConfig(config: OhstartConfig, path: string = resolveConfigPath()): Promise<void> {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, "utf8")
}
