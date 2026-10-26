import type { AgentIdentity, AgentName } from "@shared/agent/types"
import { AgentError } from "@shared/agent/error"
import { text } from "@shared/text"

const AGENT_NAMES: readonly string[] = ["npm", "pnpm", "yarn"]

export function isAgentName(value: unknown): value is AgentName {
  return typeof value === "string" && AGENT_NAMES.includes(value)
}

export function parseAgent(source: string | undefined): AgentIdentity | undefined {
  if (!source)
    return undefined
  try {
    const parsed = JSON.parse(source) as { name?: unknown, version?: unknown }
    if (!isAgentName(parsed.name))
      return undefined
    const version = typeof parsed.version === "string" ? parsed.version : undefined
    return { name: parsed.name, version }
  }
  catch {
    return undefined
  }
}

export function assertAgent(name: string): AgentName {
  if (isAgentName(name))
    return name
  throw new AgentError(text.error.agent.invalidAgent(name), { exitCode: -1, stdout: "", stderr: "", command: [] })
}
