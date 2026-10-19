export interface ArgvSchema {
  args?: Array<{ name: string, required?: boolean, description: string }>
  flags?: Record<string, { type: "boolean" | "string", description: string }>
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

export declare function defineArgv<S extends ArgvSchema>(schema: S): DefineArgvResult<S>

export declare const prompt: {
  confirm: (message: string, opts?: { default?: boolean }) => Promise<boolean>
  input: (message: string, opts?: { default?: string, validate?: (value: string) => true | string }) => Promise<string>
  password: (message: string, validate?: (value: string) => true | string) => Promise<string>
  select: (message: string, opts: Array<{ label: string, value?: string }>) => Promise<string>
  multiselect: (message: string, opts: Array<{ label: string, value?: string }>) => Promise<string[]>
}

export declare const log: {
  info: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  debug: (...args: unknown[]) => void
}

export interface OhstartJson {
  name: string
  author: string
  description: string
  scripts: Record<string, string>
}

export type ScriptType = "init" | "add"

export interface ScriptJson {
  name: string
  type: ScriptType
  description: string
  entry?: string
  argv?: string
}

export interface SourceConfig {
  name: string
  url: string
  trust?: boolean
  note?: string
}

export interface OhstartConfig {
  source: Record<string, SourceConfig>
  default?: string
}
