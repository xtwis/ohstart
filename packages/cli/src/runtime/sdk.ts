export const SDK_URL = new URL("./sdk.mjs", import.meta.url).href

export const SDK_SPECIFIER = "@xtwis/ohstart-dev"

export function rewriteSdkSpecifier(code: string): string {
  const pattern = new RegExp(`(["'])${SDK_SPECIFIER}\\1`, "g")
  return code.replace(pattern, () => JSON.stringify(SDK_URL))
}
