import { close } from "@shared/ui/style"

export interface TableColumn<T> {
  label?: string
  render: (data: T) => string
  align?: "left" | "right"
}

export interface TableOptions {
  gap?: number
}

const DEFAULT_GAP = 4

function pad(text: string, width: number, align?: "left" | "right"): string {
  const space = " ".repeat(Math.max(0, width - text.length))
  return align === "right" ? space + text : text + space
}

export function table<T>(rows: T[], columns: TableColumn<T>[], options?: TableOptions): string {
  if (rows.length === 0)
    return ""

  const gap = options?.gap ?? DEFAULT_GAP
  const cells = rows.map(row => columns.map(column => column.render(row)))
  const hasHeader = columns.every(column => column.label !== undefined)
  const header = columns.map(column => column.label ?? "")
  const widths = columns.map((column, index) => {
    const candidates = hasHeader ? [header[index], ...cells.map(row => row[index])] : cells.map(row => row[index])
    return candidates.reduce((max, cell) => Math.max(max, cell.length), 0)
  })

  const line = (row: string[]): string => row
    .map((cell, index) => pad(cell, widths[index], columns[index].align))
    .join(" ".repeat(gap))

  const lines = hasHeader ? [line(header), ...cells.map(row => line(row))] : cells.map(row => line(row))
  return close(lines.join("\n"))
}
