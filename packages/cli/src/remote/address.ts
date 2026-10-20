import type { OhstartConfig, SourceConfig } from "@ohstart/sdk"

export interface ScriptTarget {
  key: string
  source: SourceConfig
  name: string
}

export function resolveDefaultKey(config: OhstartConfig): string {
  const key = config.default
  if (!key)
    throw new Error("no default source, run `ohstart source default <key>` first")
  if (!config.source[key])
    throw new Error(`default source ${key} is not configured`)
  return key
}

export function resolveDefaultSource(config: OhstartConfig): SourceConfig {
  return config.source[resolveDefaultKey(config)]
}

export function parseScriptAddress(config: OhstartConfig, address: string): ScriptTarget {
  if (!address.startsWith("@")) {
    const key = resolveDefaultKey(config)
    return { key, source: config.source[key], name: address }
  }

  const body = address.slice(1)
  const index = body.indexOf("/")
  if (index <= 0 || index === body.length - 1)
    throw new Error(`invalid address ${address}, expected @<key>/<script>`)

  const key = body.slice(0, index)
  const source = config.source[key]
  if (!source)
    throw new Error(`unknown source ${key}`)
  return { key, source, name: body.slice(index + 1) }
}
