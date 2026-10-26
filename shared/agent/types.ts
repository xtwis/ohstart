export type AgentName = "npm" | "pnpm" | "yarn"

export interface AgentIdentity {
  name: AgentName
  version?: string
}

export interface AgentOptions {
  dev?: boolean
  ignoreScripts?: boolean
  throwOnError?: boolean
}

export interface AgentResult {
  exitCode: number
  stdout: string
  stderr: string
}

export type AgentAction
  = | { type: "install" }
    | { type: "add", names: string[] }
    | { type: "remove", names: string[] }
    | { type: "run", script: string, args?: string[] }
    | { type: "execute", cmd: string, args?: string[] }
    | { type: "dlx", name: string, args?: string[] }
    | { type: "resolve", args: string[] }

export interface AgentCommand {
  command: string
  args: string[]
}

export interface Agent {
  readonly name: AgentName | undefined
  readonly version: string | undefined
  install: (options?: AgentOptions) => Promise<AgentResult>
  add: (names: string | string[], options?: AgentOptions) => Promise<AgentResult>
  remove: (names: string | string[]) => Promise<AgentResult>
  run: (script: string, args?: string[]) => Promise<AgentResult>
  execute: (cmd: string, args?: string[]) => Promise<AgentResult>
  dlx: (name: string, args?: string[]) => Promise<AgentResult>
  resolve: (name: AgentName, ...args: string[]) => Promise<AgentResult>
}
