import type { AgentIdentity } from "@shared/agent/types"
import type { RawScriptArgv } from "@shared/argv/schema"
import { spawn } from "node:child_process"
import process from "node:process"
import { formatIdentity } from "@shared/agent/identity"

export interface SpawnScriptOptions {
  cwd: string
  agent?: AgentIdentity
}

export function spawnScript(file: string, argv: RawScriptArgv, { cwd, agent }: SpawnScriptOptions): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file], {
      cwd,
      stdio: "inherit",
      env: {
        ...process.env,
        OHSTART_ARGV: JSON.stringify(argv),
        ...(agent ? { OHSTART_AGENT: formatIdentity(agent) } : {}),
      },
    })
    child.once("error", reject)
    child.once("close", code => resolve(code))
  })
}
