import type { OhstartJson, ScriptJson } from "@ohstart/sdk"

export const ARGV_TS = `import { defineArgv } from "@xtwis/ohstart-dev"

const result = defineArgv({})

export default result.schema
export const { getArgv } = result
`

export const INDEX_TS = `import { log } from "@xtwis/ohstart-dev"

export default async function main() {
  log.info("hello from ohstart script")
}
`

export function scriptJson(script: ScriptJson): string {
  const body = { name: script.name, type: script.type, description: script.description }
  return `${JSON.stringify(body, null, 2)}\n`
}

export function ohstartJson(meta: OhstartJson): string {
  const body = { name: meta.name, author: meta.author, description: meta.description, scripts: meta.scripts }
  return `${JSON.stringify(body, null, 2)}\n`
}
