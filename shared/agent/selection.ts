import type { AgentName } from "@shared/agent/types"
import { isAgentName } from "@shared/agent/identity"
import { text } from "@shared/text"

const AGENT_FLAG = "--agent"
const NO_DETECT_FLAG = "--no-detect"

const AGENT_FLAGS = {
  "--npm": "npm",
  "--pnpm": "pnpm",
  "--yarn": "yarn",
} as const

export interface AgentSelection {
  name?: AgentName
  noDetect: boolean
}

export function parseAgentSelection(tokens: string[], address: string): AgentSelection {
  const index = tokens.indexOf(address)
  const head = index === -1 ? tokens.length : index
  const selection: AgentSelection = { name: undefined, noDetect: false }
  const sources: string[] = []

  for (const [position, token] of tokens.entries()) {
    if (position >= head)
      continue
    pickAgentFlag(token, selection, sources)
  }

  if (sources.length > 1)
    throw new Error(text.error.agent.multipleSpecified(sources.join(", ")))

  return selection
}

function pickAgentFlag(token: string, selection: AgentSelection, sources: string[]): void {
  if (token === NO_DETECT_FLAG) {
    selection.noDetect = true
    return
  }
  if (token === AGENT_FLAG)
    throw new Error(text.error.agent.missingAgentValue)
  if (token.startsWith(`${AGENT_FLAG}=`)) {
    const value = token.slice(AGENT_FLAG.length + 1)
    if (!value)
      throw new Error(text.error.agent.missingAgentValue)
    if (!isAgentName(value))
      throw new Error(text.error.agent.invalidAgent(value))
    sources.push(token)
    selection.name = value
    return
  }
  const name = AGENT_FLAGS[token as keyof typeof AGENT_FLAGS]
  if (name) {
    sources.push(token)
    selection.name = name
  }
}
