import type { OhstartJson } from "@ohstart/sdk"
import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { ohstartJson } from "@/scaffold/templates"

export async function readSourceJson(root: string): Promise<OhstartJson> {
  let raw: string
  try {
    raw = await readFile(join(root, "ohstart.json"), "utf8")
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      throw new Error("not a source here, run `ohsd init` first")
    throw error
  }

  let meta: OhstartJson
  try {
    meta = JSON.parse(raw) as OhstartJson
  }
  catch {
    throw new Error("ohstart.json is not valid JSON")
  }
  if (!meta.name)
    throw new Error("ohstart.json has no name")

  meta.scripts = meta.scripts ?? {}
  return meta
}

export async function writeSourceJson(root: string, meta: OhstartJson): Promise<void> {
  await writeFile(join(root, "ohstart.json"), ohstartJson(meta), "utf8")
}
