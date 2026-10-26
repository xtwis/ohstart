import type { AgentAction, AgentCommand, AgentName, AgentOptions } from "@shared/agent/types"

export function buildArgs(name: AgentName, action: AgentAction, options: AgentOptions = {}): AgentCommand {
  switch (action.type) {
    case "install":
      return { command: name, args: ["install", ...ignoreScripts(options)] }
    case "add":
      return { command: name, args: [addVerb(name), ...dev(options), ...ignoreScripts(options), ...action.names] }
    case "remove":
      return { command: name, args: [removeVerb(name), ...action.names] }
    case "run":
      return { command: name, args: runArgs(name, action) }
    case "execute":
      return { command: name, args: executeArgs(name, action) }
    case "dlx":
      return dlxCommand(name, action)
    case "resolve":
      return { command: name, args: action.args }
  }
}

function addVerb(name: AgentName): string {
  return name === "npm" ? "install" : "add"
}

function removeVerb(name: AgentName): string {
  return name === "npm" ? "uninstall" : "remove"
}

function dev(options: AgentOptions): string[] {
  return options.dev ? ["-D"] : []
}

function ignoreScripts(options: AgentOptions): string[] {
  return options.ignoreScripts ? ["--ignore-scripts"] : []
}

function runArgs(name: AgentName, action: { script: string, args?: string[] }): string[] {
  const args = action.args ?? []
  if (name === "yarn")
    return ["run", action.script, ...args]
  return ["run", action.script, "--", ...args]
}

function executeArgs(name: AgentName, action: { cmd: string, args?: string[] }): string[] {
  const args = action.args ?? []
  if (name === "npm")
    return ["exec", "--", action.cmd, ...args]
  if (name === "pnpm")
    return ["exec", action.cmd, ...args]
  return [action.cmd, ...args]
}

function dlxCommand(name: AgentName, action: { name: string, args?: string[] }): AgentCommand {
  const args = action.args ?? []
  if (name === "npm")
    return { command: "npx", args: [action.name, ...args] }
  return { command: name, args: ["dlx", action.name, ...args] }
}
