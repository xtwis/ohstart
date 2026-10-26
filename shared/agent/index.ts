import type { Agent, AgentAction, AgentIdentity, AgentOptions, AgentResult } from "@shared/agent/types"
import { buildArgs } from "@shared/agent/command"
import { AgentNotSpecifiedError } from "@shared/agent/error"
import { run } from "@shared/agent/exec"
import { assertAgent } from "@shared/agent/identity"

export { AgentError, AgentNotSpecifiedError } from "@shared/agent/error"
export { parseAgent } from "@shared/agent/identity"
export type { Agent, AgentAction, AgentCommand, AgentIdentity, AgentName, AgentOptions, AgentResult } from "@shared/agent/types"

export function createAgent(identity: AgentIdentity | undefined): Agent {
  const current = (): AgentIdentity => {
    if (!identity)
      throw new AgentNotSpecifiedError()
    return identity
  }
  const exec = async (action: AgentAction, options?: AgentOptions): Promise<AgentResult> => {
    const target = current()
    return run(buildArgs(target.name, action, options), options)
  }
  return {
    name: identity?.name,
    version: identity?.version,
    install: options => exec({ type: "install" }, options),
    add: (names, options) => exec({ type: "add", names: toNames(names) }, options),
    remove: names => exec({ type: "remove", names: toNames(names) }),
    run: (script, args) => exec({ type: "run", script, args }),
    execute: (cmd, args) => exec({ type: "execute", cmd, args }),
    dlx: (name, args) => exec({ type: "dlx", name, args }),
    resolve: (name, ...args) => run(buildArgs(assertAgent(name), { type: "resolve", args })),
  }
}

function toNames(names: string | string[]): string[] {
  return Array.isArray(names) ? names : [names]
}
