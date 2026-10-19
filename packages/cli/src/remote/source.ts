import type { OhstartJson } from "@ohstart/sdk"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export async function readSourceMeta(dir: string): Promise<OhstartJson> {
  const raw = await readFile(join(dir, "ohstart.json"), "utf8")
  const meta = JSON.parse(raw) as OhstartJson
  if (!meta.name)
    throw new Error("ohstart.json has no name")
  return meta
}
