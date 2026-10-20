import type { ScriptJson } from "@shared/types"
import { access, mkdir, readdir, rm, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { ARGV_TS, INDEX_TS, SAYHI_ARGV_TS, SAYHI_INDEX_TS, scriptJson } from "@/scaffold/templates"

export const SAMPLE_NAME = "sayhi"

export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  }
  catch {
    return false
  }
}

export async function isEmptyDirOrGit(dir: string): Promise<boolean> {
  try {
    const entries = await readdir(dir)
    return entries.every(entry => entry === ".git")
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      return true
    throw new Error(`${dir} is not a directory`)
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

export async function writeSampleScript(dir: string): Promise<void> {
  await writeExclusive(join(dir, SAMPLE_NAME, "script.json"), scriptJson({
    name: SAMPLE_NAME,
    type: "add",
    description: "Sample add script: write hello.md at the git root",
  }))
  await writeExclusive(join(dir, SAMPLE_NAME, "argv.ts"), SAYHI_ARGV_TS)
  await writeExclusive(join(dir, SAMPLE_NAME, "index.ts"), SAYHI_INDEX_TS)
}

export async function removeDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true })
}
