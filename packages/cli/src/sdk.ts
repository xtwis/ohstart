import process from "node:process"
import { createAgent, parseAgent } from "@shared/agent"

export type { Agent, AgentIdentity, AgentName, AgentOptions, AgentResult } from "@shared/agent"
export { defineArgv } from "@shared/argv/schema"
export { log } from "@shared/logger"
export { prompt } from "@shared/prompts"

export const agent = createAgent(parseAgent(process.env.OHSTART_AGENT))
