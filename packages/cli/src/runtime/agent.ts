import type { AgentIdentity, AgentName } from "@shared/agent/types"
import process from "node:process"
import { log } from "@shared/logger"
import { prompt } from "@shared/prompts"
import { text } from "@shared/text"
import { detectAgent } from "@/runtime/detect"

export interface AgentSelection {
  name?: AgentName
  noDetect: boolean
}

export async function resolveAgent(selection: AgentSelection, cwd: string): Promise<AgentIdentity | undefined> {
  if (selection.noDetect)
    return selection.name ? { name: selection.name } : undefined

  const detected = detectAgent(cwd)

  if (detected.type === "none") {
    if (selection.name)
      return { name: selection.name }
    throw new Error(text.error.agent.notDetected(cwd))
  }

  if (detected.type === "unsupported") {
    if (selection.name) {
      log.warn(text.warning.agent.unsupportedDetected(detected.name, selection.name))
      return { name: selection.name }
    }
    throw new Error(text.error.agent.unsupportedDetected(detected.name))
  }

  if (detected.type === "conflict") {
    if (selection.name) {
      log.warn(text.warning.agent.multipleLockFiles(detected.files.join(", "), selection.name))
      return { name: selection.name }
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
