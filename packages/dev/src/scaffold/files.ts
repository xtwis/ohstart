import type { ScriptJson } from "@ohstart/sdk"
import { access, mkdir, readdir, rm, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { ARGV_TS, INDEX_TS, scriptJson } from "@/scaffold/templates"

export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

export async function isVacantDir(dir: string): Promise<boolean> {
  try {
    const entries = await readdir(dir)
    return entries.length === 0
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return true
    throw new Error(`${dir} exists and is not a directory`)
  }
}

export async function writeExclusive(file: string, content: string): Promise<void> {
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, content, { encoding: "utf8", flag: "wx" })
}

export async function writeScriptSkeleton(dir: string, script: ScriptJson): Promise<void> {
  await writeExclusive(join(dir, "script.json"), scriptJson(script))
  await writeExclusive(join(dir, "argv.ts"), ARGV_TS)
  await writeExclusive(join(dir, "index.ts"), INDEX_TS)
}

export async function removeDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true })
}
