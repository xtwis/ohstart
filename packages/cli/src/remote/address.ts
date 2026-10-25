import type { OhstartConfig, SourceConfig } from "@shared/types"
import { text } from "@shared/text"

export interface ScriptTarget {
  key: string
  source: SourceConfig
  name: string
}

export function resolveDefaultKey(config: OhstartConfig): string {
  const key = config.default
  if (!key)
    throw new Error(text.error.source.noDefault)
  if (!config.source[key])
    throw new Error(text.error.source.defaultMissing(key))
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
    throw new Error(text.error.source.invalidAddress(address))

  const key = body.slice(0, index)
  const source = config.source[key]
  if (!source)
    throw new Error(text.error.source.unknown(key))
  return { key, source, name: body.slice(index + 1) }
}
