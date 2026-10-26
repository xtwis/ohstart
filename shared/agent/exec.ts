import type { AgentCommand, AgentOptions, AgentResult } from "@shared/agent/types"
import process from "node:process"
import { AgentError } from "@shared/agent/error"
import { text } from "@shared/text"
import { x } from "tinyexec"

export async function run(command: AgentCommand, options: AgentOptions = {}): Promise<AgentResult> {
  const argv = [command.command, ...command.args]
  try {
    const result = await x(command.command, command.args, {
      nodePath: true,
      throwOnError: false,
      nodeOptions: { cwd: process.cwd(), stdio: "inherit" },
    })
    const exitCode = result.exitCode ?? 0
    if (exitCode !== 0 && options.throwOnError !== false) {
      throw new AgentError(text.error.agent.commandFailed(argv.join(" "), exitCode), {
        exitCode,
        stdout: result.stdout,
        stderr: result.stderr,
        command: argv,
      })
    }
    return { exitCode, stdout: result.stdout, stderr: result.stderr }
  }
  catch (error) {
    if (error instanceof AgentError)
      throw error
    const reason = error instanceof Error ? error.message : String(error)
    throw new AgentError(text.error.agent.spawnFailed(argv.join(" "), reason), {
      exitCode: -1,
      stdout: "",
      stderr: "",
      command: argv,
    })
  }
}
