// ─── Field Types ────────────────────────────────────────────────────────────

export type FieldType =
  | "Data"
  | "Text"
  | "Small Text"
  | "Long Text"
  | "Code"
  | "HTML"
  | "Markdown Editor"
  | "Int"
  | "Float"
  | "Currency"
  | "Percent"
  | "Check"
  | "Date"
  | "Datetime"
  | "Time"
  | "Duration"
  | "Select"
  | "Link"
  | "Dynamic Link"
  | "Table"
  | "Table MultiSelect"
  | "Attach"
  | "Attach Image"
  | "Signature"
  | "Geolocation"
  | "Color"
  | "Rating"
  | "Barcode"
  | "Button"
  | "HTML Editor"
  | "Image"
  | "Password"
  | "Read Only"
  | "Section Break"
  | "Column Break"
  | "Tab Break"
  | "Fold"
  | "Heading"

// ─── Field Meta ─────────────────────────────────────────────────────────────

export interface DocField {
  fieldname: string
  label: string
  fieldtype: FieldType
  options?: string
  default?: string
  reqd?: 0 | 1
  hidden?: 0 | 1
  read_only?: 0 | 1
  in_list_view?: 0 | 1
  in_standard_filter?: 0 | 1
  in_global_search?: 0 | 1
  depends_on?: string
  bold?: 0 | 1
  no_copy?: 0 | 1
  allow_bulk_edit?: 0 | 1
  search_index?: 0 | 1
  unique?: 0 | 1
  precision?: string
  description?: string
}

// ─── Permission ──────────────────────────────────────────────────────────────

export interface DocPerm {
  role: string
  read?: 0 | 1
  write?: 0 | 1
  create?: 0 | 1
  delete?: 0 | 1
  submit?: 0 | 1
  cancel?: 0 | 1
  amend?: 0 | 1
  print?: 0 | 1
  email?: 0 | 1
  report?: 0 | 1
  export?: 0 | 1
  import?: 0 | 1
  share?: 0 | 1
  set_user_permissions?: 0 | 1
}

// ─── DocType Meta ────────────────────────────────────────────────────────────

export interface DocTypeMeta {
  name: string
  module: string
  is_submittable?: 0 | 1
  is_single?: 0 | 1
  is_tree?: 0 | 1
  is_virtual?: 0 | 1
  title_field?: string
  search_fields?: string
  track_changes?: 0 | 1
  fields: DocField[]
  permissions: DocPerm[]
}

// ─── List / Table ────────────────────────────────────────────────────────────

export interface ColumnDef {
  header: string
  accessorKey: string
  className?: string
  cell?: (value: unknown) => React.ReactNode
}

export interface FilterDef {
  field: string
  placeholder: string
  fieldtype?: FieldType
}

// ─── List Actions ────────────────────────────────────────────────────────────

export type ListActionType =
  | "edit"
  | "view"
  | "delete"
  | "print"
  | "export"
  | "assign"
  | "clear_assignment"
  | "apply_assignment_rule"
  | "add_tags"

export interface ListAction {
  type: ListActionType
  label: string
  variant?: "default" | "destructive"
  disabled?: boolean
}

export const DEFAULT_LIST_ACTIONS: ListAction[] = [
  { type: "edit", label: "Edit" },
  { type: "view", label: "View" },
  { type: "print", label: "Print" },
  { type: "export", label: "Export" },
  { type: "assign", label: "Assign" },
  { type: "clear_assignment", label: "Clear Assignment" },
  { type: "apply_assignment_rule", label: "Apply Assignment Rule" },
  { type: "add_tags", label: "Add Tags" },
  { type: "delete", label: "Delete", variant: "destructive" },
]

// ─── API Response Wrappers ───────────────────────────────────────────────────

export interface FrappeListResponse<T> {
  message: T[]
}

export interface FrappeDocResponse<T> {
  message: T
}

export interface FrappeFieldsResponse {
  message: { fields: DocField[] }
}