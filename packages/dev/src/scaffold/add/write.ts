import type { ScriptJson } from "@shared/types"
import { join } from "node:path"
import { text } from "@shared/text"
import { ARGV_TS, INDEX_TS, SAMPLE_NAME, sampleScript, SAYHI_ARGV_TS, SAYHI_INDEX_TS, scriptJson } from "@/scaffold/add/templates"
import { writeExclusive } from "@/scaffold/fs"

async function writeScript(dir: string, script: ScriptJson, argvTs: string, indexTs: string): Promise<void> {
  await writeExclusive(join(dir, "script.json"), scriptJson(script))
  await writeExclusive(join(dir, text.terms.argvFile), argvTs)
  await writeExclusive(join(dir, text.terms.entryFile), indexTs)
}

export async function writeScriptSkeleton(dir: string, script: ScriptJson): Promise<void> {
  await writeScript(dir, script, ARGV_TS, INDEX_TS)
}

export async function writeSampleScript(dir: string): Promise<void> {
  await writeScript(join(dir, SAMPLE_NAME), sampleScript(), SAYHI_ARGV_TS, SAYHI_INDEX_TS)
}
