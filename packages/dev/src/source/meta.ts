import type { OhstartJson } from "@shared/types"
import { writeFile } from "node:fs/promises"
import { join } from "node:path"
import { ohstartJson } from "@/scaffold/templates"

export async function writeSourceJson(root: string, meta: OhstartJson): Promise<void> {
  await writeFile(join(root, "ohstart.json"), ohstartJson(meta), "utf8")
}
