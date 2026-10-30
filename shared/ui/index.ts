import * as levels from "@shared/ui/levels"
import * as styles from "@shared/ui/style"
import { table } from "@shared/ui/table"

export type { TableColumn, TableOptions } from "@shared/ui/table"

export const ui = {
  ...levels,
  ...styles,
  table,
} as const
