import type { ArgvSchema, DefineArgvResult } from "@shared/argv/schema"
import type { ScriptJson } from "@shared/types"
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { rewriteImportSpecifier } from "@shared/runtime/sdk"
import { text } from "@shared/text"
import { transform } from "esbuild"

export async function resolveArgvFile(scriptDir: string, script: ScriptJson): Promise<string> {
  const file = join(scriptDir, script.argv ?? text.terms.argvFile)
  try {
    await access(file)
  }
  catch {
    throw new Error(text.error.script.missingArgvFile(script.name))
  }
  return file
}

function isArgvSchema(value: unknown): value is ArgvSchema {
  if (typeof value !== "object" || value === null)
    return false
  const schema = value as ArgvSchema
  const argsOk = schema.args === undefined || Array.isArray(schema.args)
  const flagsOk = schema.flags === undefined || (typeof schema.flags === "object" && schema.flags !== null)
  return argsOk && flagsOk
}

function isDefineArgvResult(value: unknown): value is DefineArgvResult<ArgvSchema> {
  return typeof value === "object" && value !== null && "schema" in value
}

export async function loadArgvSchema(file: string, sdkUrl: string): Promise<ArgvSchema> {
  const source = await readFile(file, "utf8")
  const { code } = await transform(source, { loader: "ts", format: "esm", target: "esnext" })
  const patched = rewriteImportSpecifier(code, sdkUrl)

  const dir = await mkdtemp(join(tmpdir(), "ohstart-argv-"))
  const target = join(dir, "argv.mjs")
  try {
    await writeFile(target, patched, "utf8")
    const module = await import(`${pathToFileURL(target).href}?t=${Date.now()}`)
    const exported: unknown = module.default
    if (!isDefineArgvResult(exported))
      throw new Error(text.error.script.argvNotDefineArgv(file, describe(exported)))
    if (!isArgvSchema(exported.schema))
      throw new Error(text.error.script.argvNoSchema(file))
    return exported.schema
  }
  finally {
    await rm(dir, { recursive: true, force: true })
  }
}

function describe(value: unknown): string {
  if (value === null)
    return "null"
  if (Array.isArray(value))
    return "an array"
  if (typeof value === "object" && !("schema" in value) && isArgvSchema(value))
    return "a bare schema, which is not supported"
  if (typeof value === "object")
    return "an object without schema"
  return `a ${typeof value}`
}
