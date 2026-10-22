import type { OhstartJson } from "@shared/types"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"

export function ohstartJson(meta: OhstartJson): string {
  const body = { name: meta.name, author: meta.author, description: meta.description, scripts: meta.scripts }
  return `${JSON.stringify(body, null, 2)}\n`
}

export async function writeSourceJson(root: string, meta: OhstartJson): Promise<void> {
  await writeFile(join(root, "ohstart.json"), ohstartJson(meta), "utf8")
}
