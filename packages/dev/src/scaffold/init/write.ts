import { readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"
import { SAMPLE_NAME, writeSampleScript } from "@/scaffold/add"
import { pathExists, writeExclusive } from "@/scaffold/fs"
import { sourcePackageJson, sourceTsconfigJson } from "@/scaffold/init/templates"
import { writeSourceJson } from "@/source"

export const GITIGNORE_HEADER = "# ohstart"

export const GITIGNORE_ENTRIES = [".ohstart", "node_modules/"]

const GITIGNORE_FILE = ".gitignore"

export interface SourceProjectOptions {
  root: string
  name: string
  author: string
  description: string
  sample: boolean
}

export interface SourceProjectResult {
  ignored: string[]
  sampleName: string
}

export async function ensureGitignore(dir: string, header: string, entries: string[]): Promise<string[]> {
  const file = join(dir, GITIGNORE_FILE)
  const exists = await pathExists(file)
  const current = exists ? await readFile(file, "utf8") : ""

  const lines = current.split("\n").map(line => line.trim())
  const present = new Set(
    lines
      .filter(line => line !== "" && !line.startsWith("#"))
      .map(line => normalizeEntry(line)),
  )

  const missing = entries.filter(entry => !present.has(normalizeEntry(entry)))
  if (missing.length === 0)
    return []

  const block = lines.includes(header) ? missing : [header, ...missing]
  const separator = current !== "" && !current.endsWith("\n") ? "\n" : ""
  await writeFile(file, `${current}${separator}${block.join("\n")}\n`, "utf8")
  return missing
}

function normalizeEntry(line: string): string {
  return line.endsWith("/") ? line.slice(0, -1) : line
}

export async function writeSourceProject({ root, name, author, description, sample }: SourceProjectOptions): Promise<SourceProjectResult> {
  const ignored = await ensureGitignore(root, GITIGNORE_HEADER, GITIGNORE_ENTRIES)

  if (sample)
    await writeSampleScript(root)

  await writeSourceJson(root, {
    name,
    author,
    description,
    scripts: sample ? { [SAMPLE_NAME]: SAMPLE_NAME } : {},
  })

  await writeExclusive(join(root, "package.json"), sourcePackageJson())
  await writeExclusive(join(root, "tsconfig.json"), sourceTsconfigJson())

  return { ignored, sampleName: SAMPLE_NAME }
}
