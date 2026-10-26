import { text } from "@shared/text"

export interface AgentErrorDetails {
  exitCode: number
  stdout: string
  stderr: string
  command: string[]
}

export class AgentError extends Error {
  readonly exitCode: number
  readonly stdout: string
  readonly stderr: string
  readonly command: string[]

  constructor(message: string, details: AgentErrorDetails) {
    super(message)
    this.name = "AgentError"
    this.exitCode = details.exitCode
    this.stdout = details.stdout
    this.stderr = details.stderr
    this.command = details.command
  }
}

export class AgentNotSpecifiedError extends AgentError {
  constructor() {
    super(text.error.agent.notSpecified, { exitCode: -1, stdout: "", stderr: "", command: [] })
    this.name = "AgentNotSpecifiedError"
  }
}
