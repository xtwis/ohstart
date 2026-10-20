import type { ArgvSchema, ScriptJson } from "@ohstart/sdk"
import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"
import { parseArgs } from "node:util"
import { transform } from "esbuild"
import { prompt } from "@/prompts"
import { rewriteSdkSpecifier } from "@/runtime/sdk"

export interface ScriptArgv {
  args: string[]
  flags: Record<string, string | boolean>
}

function isArgvSchema(value: unknown): value is ArgvSchema {
  if (typeof value !== "object" || value === null)
    return false
  const schema = value as ArgvSchema
  const argsOk = schema.args === undefined || Array.isArray(schema.args)
  const flagsOk = schema.flags === undefined || (typeof schema.flags === "object" && schema.flags !== null)
  return argsOk && flagsOk
}

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

export async function loadArgvSchema(file: string): Promise<ArgvSchema> {
  const source = await readFile(file, "utf8")
  const { code } = await transform(source, { loader: "ts", format: "esm", target: "esnext" })
  const patched = rewriteSdkSpecifier(code)

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

const NEGATIVE_SUPPORTED = ((): boolean => {
  try {
    parseArgs({ args: [], options: {}, strict: false, allowNegative: true })
    return true
  }
  catch {
    return false
  }
})()

export function parseScriptArgv(tokens: string[], schema: ArgvSchema): ScriptArgv {
  const options: Record<string, { type: "boolean" | "string" }> = {}
  for (const [name, flag] of Object.entries(schema.flags ?? {}))
    options[name] = { type: flag.type }

  const parsed = parseArgs({
    args: tokens,
    options,
    strict: false,
    allowPositionals: true,
    ...(NEGATIVE_SUPPORTED ? { allowNegative: true } : {}),
  })

  return {
    args: [...parsed.positionals],
    flags: { ...parsed.values } as Record<string, string | boolean>,
  }
}

export async function fillRequiredArgs(schema: ArgvSchema, argv: ScriptArgv): Promise<void> {
  for (const [index, arg] of (schema.args ?? []).entries()) {
    if (!arg.required || argv.args[index] !== undefined)
      continue
    if (!process.stdin.isTTY)
      throw new Error(`missing required arg <${arg.name}>`)
    argv.args[index] = await prompt.input(arg.description || arg.name, {
      validate: value => value.length > 0 || `${arg.name} is required`,
    })
  }
}
