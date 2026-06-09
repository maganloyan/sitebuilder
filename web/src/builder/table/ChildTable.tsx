"use client"

import { useCallback, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataGrid, getRowHeightValue } from "@/builder/table/data-grid/data-grid"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ArrowUp, ArrowDown, ChevronDown, ChevronRight,
  Expand, Plus, Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDataGrid } from "@/hooks/use-data-grid"
import ChildTableRowSheet from "./ChildTableRowSheet"
import type { ChildTableField } from "./child-table-utils"
import {
  createEmptyChildRow,
  denormalizeRowsFromGrid,
  fieldToCellOpts,
  isEditableChildField,
  normalizeRowsForGrid,
} from "./child-table-utils"

interface ChildTableProps {
  label: string
  fieldname: string
  fields: ChildTableField[]
  value: Record<string, unknown>[]
  onChange: (value: Record<string, unknown>[]) => void
}

const ROW_HEIGHT = "short" as const
const INDEX_COLUMN_ID = "_index"
const ACTIONS_COLUMN_ID = "_actions"

export default function ChildTable({ label, fieldname, fields, value = [], onChange }: ChildTableProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const tableFields = useMemo(
    () => fields.filter(f => f.in_list_view && isEditableChildField(f)),
    [fields],
  )

  const gridData = useMemo(
    () => normalizeRowsForGrid(value, fields),
    [value, fields],
  )

  const handleGridDataChange = useCallback((rows: Record<string, unknown>[]) => {
    onChange(denormalizeRowsFromGrid(rows, fields))
  }, [onChange, fields])

  const createEmptyRow = useCallback(
    () => createEmptyChildRow(fieldname, fields),
    [fieldname, fields],
  )

  const addRow = useCallback(() => {
    onChange([...value, createEmptyRow()])
  }, [value, onChange, createEmptyRow])

  const removeRow = useCallback((i: number) => {
    onChange(value.filter((_, idx) => idx !== i))
    setConfirmDelete(null)
    setExpandedRow(prev => (prev === i ? null : prev !== null && prev > i ? prev - 1 : prev))
  }, [value, onChange])

  const updateRow = useCallback((i: number, updated: Record<string, unknown>) => {
    onChange(value.map((row, idx) => idx === i ? { ...row, ...updated } : row))
  }, [value, onChange])

  const moveRow = useCallback((from: number, to: number) => {
    if (to < 0 || to >= value.length) return
    const next = [...value]
    ;[next[from], next[to]] = [next[to], next[from]]
    onChange(next)
    setExpandedRow(prev => {
      if (prev === null) return null
      if (prev === from) return to
      if (prev === to) return from
      return prev
    })
  }, [value, onChange])

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(() => [
    {
      id: INDEX_COLUMN_ID,
      size: 44,
      minSize: 44,
      maxSize: 44,
      enableSorting: false,
      enableResizing: false,
      enablePinning: true,
      header: () => (
        <span className="block w-full text-center text-[11px] font-medium text-muted-foreground/60">
          #
        </span>
      ),
      cell: ({ row }) => (
        <span className="flex size-full items-center justify-center text-xs tabular-nums text-muted-foreground/50 font-medium">
          {row.index + 1}
        </span>
      ),
    },
    ...tableFields.map(field => ({
      id: field.fieldname,
      accessorKey: field.fieldname,
      size: 160,
      minSize: 100,
      enableSorting: false,
      header: field.label,
      meta: {
        label: field.label,
        cell: fieldToCellOpts(field),
      },
    })),
    {
      id: ACTIONS_COLUMN_ID,
      size: 112,
      minSize: 112,
      maxSize: 112,
      enableSorting: false,
      enableResizing: false,
      enablePinning: true,
      header: () => (
        <span className="block w-full text-right text-[11px] text-muted-foreground/60 pr-1">
          Actions
        </span>
      ),
      cell: ({ row }) => {
        const rowIndex = row.index
        return (
          <div
            className="flex size-full items-center justify-end pr-1"
            onPointerDown={e => e.stopPropagation()}
            onMouseDown={e => e.stopPropagation()}
          >
            {confirmDelete === rowIndex ? (
              <div className="flex animate-in fade-in slide-in-from-right-1 items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/8 px-2.5 py-1 duration-150">
                <span className="whitespace-nowrap text-[11px] text-muted-foreground">Delete?</span>
                <button type="button" onClick={() => removeRow(rowIndex)} className="text-[11px] font-semibold text-destructive hover:underline">Yes</button>
                <span className="text-[11px] text-muted-foreground/40">/</span>
                <button type="button" onClick={() => setConfirmDelete(null)} className="text-[11px] text-muted-foreground hover:underline">No</button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/25 p-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="size-7 text-muted-foreground hover:bg-background hover:text-foreground" disabled={rowIndex === 0} onClick={() => moveRow(rowIndex, rowIndex - 1)}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="py-1 text-xs">Move up</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="size-7 text-muted-foreground hover:bg-background hover:text-foreground" disabled={rowIndex === value.length - 1} onClick={() => moveRow(rowIndex, rowIndex + 1)}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="py-1 text-xs">Move down</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "size-7 text-muted-foreground hover:bg-background hover:text-primary",
                        expandedRow === rowIndex && "bg-primary/10 text-primary"
                      )}
                      onClick={() => setExpandedRow(rowIndex)}
                    >
                      <Expand className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="py-1 text-xs">Expand all fields</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="size-7 text-muted-foreground hover:bg-background hover:text-destructive" onClick={() => setConfirmDelete(rowIndex)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="py-1 text-xs">Delete row</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        )
      },
    },
  ], [
    tableFields,
    confirmDelete,
    expandedRow,
    value.length,
    moveRow,
    removeRow,
  ])

  const gridHeight = useMemo(() => {
    const rowPx = getRowHeightValue(ROW_HEIGHT)
    const headerPx = 40
    const bodyPx = value.length * rowPx
    return Math.min(480, headerPx + bodyPx + 8)
  }, [value.length])

  const dataGrid = useDataGrid({
    data: gridData,
    columns,
    rowHeight: ROW_HEIGHT,
    onDataChange: handleGridDataChange,
    enableSearch: false,
    enablePaste: true,
    enableColumnSelection: false,
    initialState: {
      columnPinning: {
        left: [INDEX_COLUMN_ID],
        right: [ACTIONS_COLUMN_ID],
      },
    },
    onRowAdd: async () => {
      const nextIndex = value.length
      onChange([...value, createEmptyRow()])
      return { rowIndex: nextIndex, columnId: tableFields[0]?.fieldname }
    },
  })

  const { onRowAdd: _gridFooterAdd, ...dataGridProps } = dataGrid

  return (
    <div className="overflow-hidden rounded-lg border">

      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className={cn(
          "flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-muted/40",
          !collapsed && "border-b",
        )}
      >
        {collapsed ? (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{label}</span>
        <Badge variant="secondary" className="h-5 px-1.5 text-[11px] tabular-nums">
          {value.length}
        </Badge>
      </button>

      {!collapsed && (
        <>
          {value.length === 0 ? (
            <div className="py-10">
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
            </div>
          ) : (
            <DataGrid
              {...dataGridProps}
              onRowAdd={undefined}
              height={gridHeight}
              stretchColumns
              className="rounded-none border-0"
            />
          )}

          {value.length > 0 && (
            <div className="flex items-center justify-between border-t px-4 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addRow}
                className="h-7 gap-1.5 text-xs text-muted-foreground"
              >
                <Plus className="size-3.5" />
                Add row
              </Button>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {value.length} {value.length === 1 ? "row" : "rows"}
              </span>
            </div>
          )}
        </>
      )}

      {expandedRow !== null && value[expandedRow] !== undefined && (
        <ChildTableRowSheet
          open
          onClose={() => setExpandedRow(null)}
          rowIndex={expandedRow}
          row={value[expandedRow]}
          fields={fields}
          tableLabel={label}
          onSave={updated => updateRow(expandedRow, updated)}
        />
      )}
    </div>
  )
}
