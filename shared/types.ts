export type ScriptType = "init" | "add"

export interface OhstartJson {
  name: string
  author: string
  description: string
  scripts: Record<string, string>
}

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
