import type { RawScriptArgv } from "@shared/argv/schema"
import { spawn } from "node:child_process"
import process from "node:process"

export interface SpawnScriptOptions {
  cwd: string
}

export function spawnScript(file: string, argv: RawScriptArgv, { cwd }: SpawnScriptOptions): Promise<number | null> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file], {
      cwd,
      stdio: "inherit",
      env: { ...process.env, OHSTART_ARGV: JSON.stringify(argv) },
    })
    child.once("error", reject)
    child.once("close", code => resolve(code))
  })
}
