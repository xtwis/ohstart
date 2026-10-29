import type { ArgvSchema, RawScriptArgv } from "@shared/argv/schema"
import process from "node:process"
import { parseArgs } from "node:util"
import { prompt } from "@shared/prompts"
import { text } from "@shared/text"

const NEGATIVE_SUPPORTED = ((): boolean => {
  try {
    parseArgs({ args: [], options: {}, strict: false, allowNegative: true })
    return true
  }
  catch {
    return false
  }
})()

export function parseScriptArgv(tokens: string[], schema: ArgvSchema): RawScriptArgv {
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

export function validateScriptArgv(schema: ArgvSchema, argv: RawScriptArgv): string[] {
  const errors: string[] = []

  for (const [index, arg] of (schema.args ?? []).entries()) {
    if (arg.required && argv.args[index] === undefined)
      errors.push(`missing required arg <${arg.name}>`)
  }

  for (const [name, flag] of Object.entries(schema.flags ?? {})) {
    const value = argv.flags[name]
    if (value === undefined)
      continue
    if (flag.type === "boolean" && typeof value !== "boolean")
      errors.push(`flag --${name} expects a boolean`)
    if (flag.type === "string" && typeof value !== "string")
      errors.push(`flag --${name} expects a string`)
  }

  return errors
}

export async function fillRequiredArgs(schema: ArgvSchema, argv: RawScriptArgv): Promise<void> {
  for (const [index, arg] of (schema.args ?? []).entries()) {
    if (!arg.required || argv.args[index] !== undefined)
      continue
    if (!process.stdin.isTTY)
      throw new Error(text.error.script.missingRequiredArg(arg.name))
    argv.args[index] = await prompt.text({
      message: arg.description || arg.name,
      validate: value => (value?.length ?? 0) > 0 ? undefined : text.question.argRequired(arg.name),
    })
  }
}
