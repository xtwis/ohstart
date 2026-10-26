import type { AgentSelection } from "@shared/agent/selection"
import type { AgentIdentity, AgentName } from "@shared/agent/types"
import process from "node:process"
import { detectAgent } from "@shared/agent/detect"
import { log } from "@shared/logger"
import { prompt } from "@shared/prompts"
import { text } from "@shared/text"

export interface ResolveAgentOptions {
  selection: AgentSelection
  cwd: string
  fallback?: AgentName
}

export async function resolveAgent(options: ResolveAgentOptions & { fallback: AgentName }): Promise<AgentIdentity>
export async function resolveAgent(options: ResolveAgentOptions): Promise<AgentIdentity | undefined>
export async function resolveAgent({ selection, cwd, fallback }: ResolveAgentOptions): Promise<AgentIdentity | undefined> {
  if (selection.noDetect)
    return selection.name ? { name: selection.name } : (fallback ? { name: fallback } : undefined)

  const detected = detectAgent(cwd)

  if (detected.type === "none") {
    if (selection.name)
      return { name: selection.name }
    if (fallback)
      return { name: fallback }
    throw new Error(text.error.agent.notDetected(cwd))
  }

  if (detected.type === "unsupported") {
    if (selection.name) {
      log.warn(text.warning.agent.unsupportedDetected(detected.name, selection.name))
      return { name: selection.name }
    }
    if (fallback) {
      log.warn(text.warning.agent.unsupportedDetected(detected.name, fallback))
      return { name: fallback }
    }
    throw new Error(text.error.agent.unsupportedDetected(detected.name))
  }

  if (detected.type === "conflict") {
    if (selection.name) {
      log.warn(text.warning.agent.multipleLockFiles(detected.files.join(", "), selection.name))
      return { name: selection.name }
    }
    if (fallback) {
      log.warn(text.warning.agent.multipleLockFiles(detected.files.join(", "), fallback))
      return { name: fallback }
    }
    throw new Error(text.error.agent.multipleLockFiles(detected.files.join(", ")))
  }

  if (!selection.name)
    return { name: detected.agent.name, version: detected.agent.version }

  if (detected.agent.name === selection.name)
    return { name: detected.agent.name, version: detected.agent.version }

  if (!process.stdin.isTTY)
    throw new Error(text.error.agent.requiresTty)

  const confirmed = await prompt.confirm(
    text.question.confirmAgent(detected.agent.name, detected.agent.source, selection.name),
    { default: true },
  )
  if (!confirmed)
    throw new Error(text.error.agent.aborted)
  return { name: selection.name }
}
