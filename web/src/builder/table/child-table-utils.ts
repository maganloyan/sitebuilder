import type { CellOpts, CellSelectOption } from "@/types/data-grid"

export const LAYOUT_FIELD_TYPES = ["Section Break", "Column Break", "Tab Break"] as const

export interface ChildTableField {
  fieldname: string
  label: string
  type: string
  options?: string
  mandatory?: boolean
  readOnly?: boolean
  display_field?: string
  in_list_view?: boolean
  hidden?: boolean
}

export function isLayoutField(type: string): boolean {
  return (LAYOUT_FIELD_TYPES as readonly string[]).includes(type)
}

export function isEditableChildField(field: ChildTableField): boolean {
  return !field.hidden && !isLayoutField(field.type)
}

export function fieldToCellOpts(field: ChildTableField): CellOpts {
  switch (field.type) {
    case "Long Text":
    case "Text Editor":
    case "Code":
    case "HTML Editor":
    case "Markdown Editor":
      return { variant: "long-text" }

    case "Check":
      return { variant: "checkbox" }

    case "Int":
      return { variant: "number", step: 1 }

    case "Float":
    case "Currency":
      return { variant: "number", step: 0.01 }

    case "Select": {
      const options: CellSelectOption[] = (field.options ?? "")
        .split("\n")
        .filter(Boolean)
        .map(opt => ({ label: opt, value: opt }))
      return { variant: "select", options }
    }

    case "Date":
      return { variant: "date" }

    case "Link":
      return { variant: "short-text" }

    default:
      return { variant: "short-text" }
  }
}

function isCheckField(field: ChildTableField): boolean {
  return field.type === "Check"
}

function isNumberField(field: ChildTableField): boolean {
  return field.type === "Int" || field.type === "Float" || field.type === "Currency"
}

export function normalizeValueForGrid(
  value: unknown,
  field: ChildTableField,
): unknown {
  if (isCheckField(field)) {
    return value === 1 || value === true || value === "1" || value === "true"
  }
  if (isNumberField(field)) {
    if (value === "" || value === null || value === undefined) return null
    const num = typeof value === "number" ? value : Number.parseFloat(String(value))
    return Number.isNaN(num) ? null : num
  }
  if (value === null || value === undefined) return ""
  return value
}

export function denormalizeValueFromGrid(
  value: unknown,
  field: ChildTableField,
): unknown {
  if (isCheckField(field)) {
    return value === true || value === 1 || value === "1" || value === "true" ? "1" : "0"
  }
  if (isNumberField(field)) {
    if (value === null || value === undefined || value === "") return ""
    return String(value)
  }
  if (value === null || value === undefined) return ""
  return value
}

export function normalizeRowForGrid(
  row: Record<string, unknown>,
  fields: ChildTableField[],
): Record<string, unknown> {
  const next = { ...row }
  for (const field of fields) {
    if (!(field.fieldname in next)) continue
    next[field.fieldname] = normalizeValueForGrid(next[field.fieldname], field)
  }
  return next
}

export function denormalizeRowFromGrid(
  row: Record<string, unknown>,
  fields: ChildTableField[],
): Record<string, unknown> {
  const next = { ...row }
  for (const field of fields) {
    if (!(field.fieldname in next)) continue
    next[field.fieldname] = denormalizeValueFromGrid(next[field.fieldname], field)
  }
  return next
}

export function normalizeRowsForGrid(
  rows: Record<string, unknown>[],
  fields: ChildTableField[],
): Record<string, unknown>[] {
  return rows.map(row => normalizeRowForGrid(row, fields))
}

export function denormalizeRowsFromGrid(
  rows: Record<string, unknown>[],
  fields: ChildTableField[],
): Record<string, unknown>[] {
  return rows.map(row => denormalizeRowFromGrid(row, fields))
}

export function createEmptyChildRow(
  fieldname: string,
  fields: ChildTableField[],
): Record<string, unknown> {
  const row: Record<string, unknown> = { doctype: fieldname }
  for (const field of fields) {
    row[field.fieldname] = field.type === "Check" ? "0" : ""
  }
  return row
}
