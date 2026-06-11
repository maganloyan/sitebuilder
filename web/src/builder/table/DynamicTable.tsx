import { useEffect, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { useFrappeGetDocList, useFrappeGetDocCount, useFrappeDeleteDoc } from "frappe-react-sdk"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableSkeleton } from "@/components/kit/feedback/view-skeletons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import toast from "@/lib/portal-toast"
import { PortalEmptyState, PortalErrorState } from "@/components/kit/feedback/portal-state"
import ListActions from "@/builder/views/ListActions"
import { DataTableColumnHeader } from "./DataTableColumnHeader"
import { DataTableToolbar } from "./DataTableToolbar"
import { DataTablePagination } from "./DataTablePagination"
import { DataTableBulkBar } from "./DataTableBulkBar"
import { formatListCellValue } from "@/lib/format-list-cell"
import { staggerContainerVariants, staggerItemVariants } from "@/lib/motion-variants"

// ── Types ────────────────────────────────────────────────────────────────────

export interface DynamicColumnDef {
  header: string
  accessorKey: string
  fieldtype?: string
  cell?: (value: unknown) => React.ReactNode
  className?: string
  enableSorting?: boolean
  enableHiding?: boolean
}

interface FilterDef {
  field: string
  placeholder: string
}

interface DynamicTableProps {
  doctype: string
  columns: DynamicColumnDef[]
  filters?: FilterDef[]
  itemsPerPage?: number
  addNewPath?: string
  viewPath?: string
  fields?: string[]
  /** When true, omits outer padding (parent provides layout shell). */
  embedded?: boolean
  /** Extra dropdown items rendered per row — receives the doc name. */
  rowMenuItems?: (name: string) => React.ReactNode
}

// ── Debounce ─────────────────────────────────────────────────────────────────

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DynamicTable({
  doctype,
  columns: columnDefs,
  filters = [],
  itemsPerPage: defaultPageSize = 20,
  addNewPath,
  viewPath = "view",
  fields = ["name"],
  embedded = false,
  rowMenuItems,
}: DynamicTableProps) {
  const navigate = useNavigate()

  // ── State ──
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [filterValues, setFilterValues] = useState<Record<string, string>>(
    Object.fromEntries(filters.map(f => [f.field, ""]))
  )
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const debouncedFilters = useDebounced(filterValues)
  const { deleteDoc } = useFrappeDeleteDoc()

  // Reset page when filters change
  useEffect(() => { setPage(1) }, [debouncedFilters])

  // ── Data fetching ──
  const orderBy = sorting[0]
    ? { field: sorting[0].id, order: sorting[0].desc ? ("desc" as const) : ("asc" as const) }
    : { field: "modified", order: "desc" as const }

  const { data: rows = [], isLoading, error, mutate: refresh } = useFrappeGetDocList(doctype, {
    fields,
    filters: Object.entries(debouncedFilters)
      .filter(([, v]) => v)
      .map(([field, value]) => [field, "like", `%${value}%`]),
    orderBy,
    limit: pageSize,
    limit_start: (page - 1) * pageSize,
  })

  const { data: totalCount = 0 } = useFrappeGetDocCount(doctype)
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // ── Column definitions for TanStack Table ──
  const tableColumns: ColumnDef<Record<string, unknown>>[] = [
    // Select column
    {
      id: "select",
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={v => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={v => row.toggleSelected(!!v)}
          onClick={e => e.stopPropagation()}
          aria-label="Select row"
        />
      ),
    },
    // Data columns
    ...columnDefs.map((col, i) => ({
      id: col.accessorKey,
      accessorKey: col.accessorKey,
      enableSorting: col.enableSorting ?? true,
      enableHiding: col.enableHiding ?? i > 0,
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title={col.header} className={col.className} />
      ),
      cell: ({ getValue }: any) => {
        const value = getValue()
        if (col.cell) return col.cell(value)
        if (col.fieldtype) {
          return formatListCellValue(value, col.fieldtype, col.accessorKey)
        }
        return (
          <span className={cn(i === 0 && "font-medium")}>{String(value ?? "")}</span>
        )
      },
    })),
    // Actions column
    {
      id: "actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <ListActions
          doctype={doctype}
          docname={(row.original as any).name}
          onDelete={() => { refresh(); setRowSelection({}) }}
          extraMenuItems={rowMenuItems?.((row.original as any).name)}
        />
      ),
    },
  ]

  const table = useReactTable({
    data: rows as Record<string, unknown>[],
    columns: tableColumns,
    state: { sorting, rowSelection, columnVisibility },
    onSortingChange: (updater) => {
      setSorting(updater)
      setPage(1)
    },
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    getRowId: (row) => (row as any).name,
  })

  const selectedNames = Object.keys(rowSelection)

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedNames.length} records?`)) return
    setIsBulkDeleting(true)
    try {
      await Promise.all(selectedNames.map(name => deleteDoc(doctype, name)))
      toast.success(`Deleted ${selectedNames.length} record${selectedNames.length > 1 ? "s" : ""}`)
      setRowSelection({})
      refresh()
    } catch {
      toast.error("Some deletions failed")
    } finally {
      setIsBulkDeleting(false)
    }
  }

  // ── Loading state ──
  const wrapperClass = embedded ? "space-y-3" : "space-y-3 p-4 sm:p-6"

  if (isLoading) {
    return <DataTableSkeleton embedded={embedded} filterCount={Math.max(filters.length, 1)} />
  }

  if (error) {
    return (
      <PortalErrorState
        className={embedded ? undefined : "mx-4 sm:mx-6"}
        title={`Couldn't load ${doctype}`}
        description={error.message}
        onRetry={() => refresh()}
      />
    )
  }

  return (
    <div className={wrapperClass}>

      <DataTableToolbar
        table={table}
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(field, value) =>
          setFilterValues(prev => ({ ...prev, [field]: value }))
        }
        onRefresh={() => refresh()}
        addNewPath={addNewPath}
        doctype={doctype}
      />

      <DataTableBulkBar
        selectedCount={selectedNames.length}
        isDeleting={isBulkDeleting}
        onDelete={handleBulkDelete}
        onClear={() => setRowSelection({})}
      />

      {/* ── Table ── */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="bg-muted/50 hover:bg-muted/50">
                {hg.headers.map((header, i) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-9 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                      header.id === "select" && "w-10 sticky left-0 bg-muted/50",
                      header.id === "actions" && "w-10 sticky right-0 bg-muted/50",
                      i === 1 && "sticky left-10 bg-muted/50"
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {table.getRowModel().rows.length === 0 ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="p-0">
                  <PortalEmptyState
                    title={`No ${doctype} yet`}
                    description="Create your first record to get started."
                    className="border-0 rounded-none"
                    action={
                      addNewPath ? (
                        <Button size="sm" onClick={() => navigate(addNewPath)}>
                          New {doctype}
                        </Button>
                      ) : undefined
                    }
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <motion.tbody
              className="[&_tr:last-child]:border-0"
              variants={staggerContainerVariants}
              initial="hidden"
              animate="show"
            >
              {table.getRowModel().rows.map(row => (
                <motion.tr
                  key={row.id}
                  variants={staggerItemVariants}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    "border-b transition-colors hover:bg-muted/50 cursor-pointer",
                    row.getIsSelected() && "bg-primary/5 hover:bg-primary/8"
                  )}
                  onClick={() => navigate(`${viewPath}/${row.id}`)}
                >
                  {row.getVisibleCells().map((cell, i) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "py-2.5",
                        cell.column.id === "select" && "w-10 sticky left-0 bg-background",
                        cell.column.id === "actions" && "w-10 sticky right-0 bg-background",
                        i === 1 && "sticky left-10 bg-background"
                      )}
                      onClick={
                        cell.column.id === "select" || cell.column.id === "actions"
                          ? e => e.stopPropagation()
                          : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </motion.tr>
              ))}
            </motion.tbody>
          )}
        </Table>
      </div>

      <DataTablePagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        itemsPerPage={pageSize}
        selectedCount={selectedNames.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
      />

    </div>
  )
}
