import type { SelectOption } from "@/prompts/types"
import { pick } from "@/prompts/pick"

export async function multiselect(message: string, options: SelectOption[]): Promise<string[]> {
  const indexes = await pick(message, options, true)
  return indexes.map(index => options[index].value ?? options[index].label)
}
