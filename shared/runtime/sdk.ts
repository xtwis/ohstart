export const SDK_SPECIFIER = "@xtwis/ohstart-dev"

const REGEX_META = /[.*+?^${}()|[\]\\]/g

export function rewriteImportSpecifier(code: string, sdkUrl: string): string {
  const pattern = new RegExp(`(["'])${SDK_SPECIFIER.replace(REGEX_META, "\\$&")}\\1`, "g")
  return code.replace(pattern, () => JSON.stringify(sdkUrl))
}
