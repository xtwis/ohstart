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
  const at = source.indexOf("@")
  const name = at === -1 ? source : source.slice(0, at)
  if (!isAgentName(name))
    return undefined
  if (at === -1)
    return { name }
  const version = source.slice(at + 1).split("+")[0]
  return { name, version: version || undefined }
}

export function formatIdentity(identity: AgentIdentity): string {
  return identity.version ? `${identity.name}@${identity.version}` : identity.name
}

export function assertAgent(name: string): AgentName {
  if (isAgentName(name))
    return name
  throw new AgentError(text.error.agent.invalidAgent(name), { exitCode: -1, stdout: "", stderr: "", command: [] })
}
