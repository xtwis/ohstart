import type { ArgvSchema } from "@shared/argv/schema"
import type { ScriptJson } from "@shared/types"
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { transform } from "esbuild"

export async function resolveArgvFile(scriptDir: string, script: ScriptJson): Promise<string> {
  const file = join(scriptDir, script.argv ?? "./argv.ts")
  try {
    await access(file)
  }
  catch {
    throw new Error(`script ${script.name} missing argv.ts`)
  }
  return file
}

function rewriteImportSpecifier(code: string, apiUrl: string): string {
  const pattern = /(["'])@xtwis\/ohstart-dev\1/g
  return code.replace(pattern, () => JSON.stringify(apiUrl))
}

function isArgvSchema(value: unknown): value is ArgvSchema {
  if (typeof value !== "object" || value === null)
    return false
  const schema = value as ArgvSchema
  const argsOk = schema.args === undefined || Array.isArray(schema.args)
  const flagsOk = schema.flags === undefined || (typeof schema.flags === "object" && schema.flags !== null)
  return argsOk && flagsOk
}

export async function loadArgvSchema(file: string, apiUrl: string): Promise<ArgvSchema> {
  const source = await readFile(file, "utf8")
  const { code } = await transform(source, { loader: "ts", format: "esm", target: "esnext" })
  const patched = rewriteImportSpecifier(code, apiUrl)

  const dir = await mkdtemp(join(tmpdir(), "ohstart-argv-"))
  const target = join(dir, "argv.mjs")
  try {
    await writeFile(target, patched, "utf8")
    const module = await import(`${pathToFileURL(target).href}?t=${Date.now()}`)
    const schema: unknown = module.default
    if (!isArgvSchema(schema))
      throw new Error(`${file} does not export an argv schema`)
    return schema
  }
  finally {
    await rm(dir, { recursive: true, force: true })
  }
}
