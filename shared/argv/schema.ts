import process from "node:process"

export interface ArgvArg {
  name: string
  required?: boolean
  description: string
}

export interface ArgvFlag {
  type: "boolean" | "string"
  description: string
}

export interface ArgvSchema {
  args?: ArgvArg[]
  flags?: Record<string, ArgvFlag>
}

export interface RawScriptArgv {
  args: string[]
  flags: Record<string, string | boolean>
}

export interface NarrowedArgv<S extends ArgvSchema> {
  args: string[]
  flags: {
    [K in keyof S["flags"]]: S["flags"][K] extends { type: "boolean" } ? boolean
      : S["flags"][K] extends { type: "string" } ? string
        : never
  }
}

export interface DefineArgvResult<S extends ArgvSchema> {
  schema: S
  getArgv: () => NarrowedArgv<S>
}

const EMPTY_ARGV: RawScriptArgv = { args: [], flags: {} }

function readRawArgv(): RawScriptArgv {
  const raw = process.env.OHSTART_ARGV
  if (!raw)
    return EMPTY_ARGV
  try {
    const parsed = JSON.parse(raw) as Partial<RawScriptArgv>
    return { args: parsed.args ?? [], flags: parsed.flags ?? {} }
  }
  catch {
    return EMPTY_ARGV
  }
}

const rawArgv = readRawArgv()

export function defineArgv<S extends ArgvSchema>(schema: S): DefineArgvResult<S> {
  return {
    schema,
    getArgv: () => rawArgv as unknown as NarrowedArgv<S>,
  }
}
