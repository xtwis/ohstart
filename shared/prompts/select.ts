import type { SelectOption } from "@shared/prompts/types"
import { pick } from "@shared/prompts/pick"

export async function select(message: string, options: SelectOption[]): Promise<string> {
  const [index] = await pick(message, options, false)
  const option = options[index]
  return option.value ?? option.label
}
