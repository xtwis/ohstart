import type { SelectOption } from "@/prompts/types.js"
import { pick } from "@/prompts/pick.js"

export async function select(message: string, options: SelectOption[]): Promise<string> {
  const [index] = await pick(message, options, false)
  const option = options[index]
  return option.value ?? option.label
}
