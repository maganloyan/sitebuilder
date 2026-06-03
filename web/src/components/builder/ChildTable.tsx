import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetFooter,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ArrowUp, ArrowDown, ChevronDown, ChevronRight,
  Expand, Plus, Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import FieldRenderer from "./FieldRenderer"

// ── Types ────────────────────────────────────────────────────────────────────

interface Field {
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

interface ChildTableProps {
  label: string
  fieldname: string
  fields: Field[]
  value: Record<string, unknown>[]
  onChange: (value: Record<string, unknown>[]) => void
}

const LAYOUT_TYPES = ["Section Break", "Column Break", "Tab Break"]

// ── Row Expand Sheet ─────────────────────────────────────────────────────────

function RowSheet({
  open, onClose, rowIndex, row, fields, onSave, tableLabel,
}: {
  open: boolean
  onClose: () => void
  rowIndex: number
  row: Record<string, unknown>
  fields: Field[]
  onSave: (updated: Record<string, unknown>) => void
  tableLabel: string
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>({ ...row })
  const editableFields = fields.filter(f => !f.hidden && !LAYOUT_TYPES.includes(f.type))

  const apply = () => { onSave(draft); onClose() }
  const discard = () => { setDraft({ ...row }); onClose() }

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) apply() }}>
      <SheetContent side="right" className="w-full sm:w-[480px] sm:max-w-[480px] p-0 flex flex-col gap-0 h-full overflow-hidden">

        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center h-7 w-7 rounded-md bg-primary/10 text-primary text-xs font-semibold shrink-0">
              {rowIndex + 1}
            </div>
            <SheetTitle className="text-base font-semibold leading-tight">
              {tableLabel}
              <span className="text-muted-foreground font-normal ml-1.5 text-sm">
                — Row {rowIndex + 1}
              </span>
            </SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-5">
            {editableFields.map(field => (
              <FieldRenderer
                key={field.fieldname}
                field={field}
                value={(draft[field.fieldname] as string) ?? ""}
                onChange={v => setDraft(prev => ({ ...prev, [field.fieldname]: v }))}
              />
            ))}
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t gap-2 flex-row">
          <Button className="flex-1" onClick={apply}>Apply changes</Button>
          <Button variant="outline" onClick={discard}>Discard</Button>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ChildTable({ label, fieldname, fields, value = [], onChange }: ChildTableProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const tableFields = fields.filter(
    f => f.in_list_view && !f.hidden && !LAYOUT_TYPES.includes(f.type)
  )

  const addRow = () => {
    const newRow: Record<string, unknown> = { doctype: fieldname }
    fields.forEach(f => { newRow[f.fieldname] = f.type === "Check" ? "0" : "" })
    onChange([...value, newRow])
  }

  const removeRow = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i))
    setConfirmDelete(null)
  }

  const updateRow = (i: number, updated: Record<string, unknown>) => {
    onChange(value.map((row, idx) => idx === i ? { ...row, ...updated } : row))
  }

  const moveRow = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return
    const next = [...value];
    [next[from], next[to]] = [next[to], next[from]]
    onChange(next)
  }

  return (
    <div className="rounded-lg border overflow-hidden">

      {/* ── Header ── */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className={cn(
          "w-full flex items-center gap-2.5 px-4 py-3 text-left",
          "bg-muted/40 hover:bg-muted/60 transition-colors",
          !collapsed && "border-b"
        )}
      >
        {collapsed
          ? <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        }
        <span className="text-sm font-medium">{label}</span>
        <Badge
          variant="secondary"
          className={cn(
            "h-5 px-1.5 text-[11px] tabular-nums ml-0.5 border-0",
            value.length > 0 && "bg-primary/12 text-primary"
          )}
        >
          {value.length}
        </Badge>
      </button>

      {!collapsed && (
        <>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30 border-b">
                <TableHead className="w-10 text-center text-[11px] font-medium text-muted-foreground/60 pl-4">#</TableHead>
                {tableFields.map(f => (
                  <TableHead key={f.fieldname} className="text-xs font-medium py-2.5">
                    {f.label}
                    {f.mandatory && <span className="ml-0.5 text-destructive">*</span>}
                  </TableHead>
                ))}
                <TableHead className="w-28 pr-3 text-right text-[11px] text-muted-foreground/60">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {value.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={tableFields.length + 2} className="py-10">
                    <button
                      type="button"
                      onClick={addRow}
                      className="flex flex-col items-center gap-2.5 w-full group text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div className="flex items-center justify-center h-9 w-9 rounded-lg border-2 border-dashed border-muted-foreground/25 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
                        <Plus className="h-4 w-4" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">No {label.toLowerCase()} yet</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">Click to add the first row</p>
                      </div>
                    </button>
                  </TableCell>
                </TableRow>
              ) : (
                value.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={cn(
                      "group align-middle transition-colors",
                      confirmDelete === rowIndex && "bg-destructive/[0.04]",
                      expandedRow === rowIndex && "bg-primary/[0.03]"
                    )}
                  >
                    {/* # */}
                    <TableCell className="text-center pl-4 w-10">
                      <span className="text-xs tabular-nums text-muted-foreground/50 font-medium">{rowIndex + 1}</span>
                    </TableCell>

                    {/* Inline fields */}
                    {tableFields.map(field => (
                      <TableCell key={field.fieldname} className="py-1.5 pr-2 min-w-[100px]">
                        <FieldRenderer
                          field={{ ...field, label: "" }}
                          value={(row[field.fieldname] as string) || ""}
                          onChange={v => updateRow(rowIndex, { [field.fieldname]: v })}
                        />
                      </TableCell>
                    ))}

                    {/* Actions */}
                    <TableCell className="pr-3 py-1.5">
                      <div className="flex items-center justify-end gap-0.5">
                        {confirmDelete === rowIndex ? (
                          <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-destructive/8 border border-destructive/15 animate-in fade-in slide-in-from-right-1 duration-150">
                            <span className="text-[11px] text-muted-foreground whitespace-nowrap">Delete?</span>
                            <button type="button" onClick={() => removeRow(rowIndex)} className="text-[11px] font-semibold text-destructive hover:underline">Yes</button>
                            <span className="text-muted-foreground/40 text-[11px]">/</span>
                            <button type="button" onClick={() => setConfirmDelete(null)} className="text-[11px] text-muted-foreground hover:underline">No</button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={rowIndex === 0} onClick={() => moveRow(rowIndex, rowIndex - 1)}>
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs py-1">Move up</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" disabled={rowIndex === value.length - 1} onClick={() => moveRow(rowIndex, rowIndex + 1)}>
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs py-1">Move down</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className={cn("h-7 w-7 text-muted-foreground hover:text-primary", expandedRow === rowIndex && "text-primary bg-primary/8")} onClick={() => setExpandedRow(rowIndex)}>
                                  <Expand className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs py-1">Expand all fields</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => setConfirmDelete(rowIndex)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs py-1">Delete row</TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* ── Footer ── */}
          {value.length > 0 && (
            <div className="border-t bg-muted/20 px-4 py-2 flex items-center justify-between">
              <Button type="button" variant="ghost" size="sm" onClick={addRow} className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2">
                <Plus className="h-3.5 w-3.5" />
                Add row
              </Button>
              <span className="text-[11px] text-muted-foreground/50 tabular-nums">
                {value.length} {value.length === 1 ? "row" : "rows"}
              </span>
            </div>
          )}
        </>
      )}

      {/* ── Row Sheet ── */}
      {expandedRow !== null && (
        <RowSheet
          open
          onClose={() => setExpandedRow(null)}
          rowIndex={expandedRow}
          row={value[expandedRow] ?? {}}
          fields={fields}
          tableLabel={label}
          onSave={updated => updateRow(expandedRow, updated)}
        />
      )}
    </div>
  )
}
