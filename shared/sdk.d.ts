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

export interface ConfirmOptions {
  default?: boolean
}

export interface InputOptions {
  default?: string
  validate?: (value: string) => true | string
}

export interface SelectOption {
  label: string
  value?: string
}

export declare const prompt: {
  confirm: (message: string, options?: ConfirmOptions) => Promise<boolean>
  input: (message: string, options?: InputOptions) => Promise<string>
  select: (message: string, options: SelectOption[]) => Promise<string>
  multiselect: (message: string, options: SelectOption[]) => Promise<string[]>
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
