import { Table } from "@tanstack/react-table"
import { X, Plus, RotateCw, SlidersHorizontal } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Filter {
  field: string
  placeholder: string
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  filters: Filter[]
  filterValues: Record<string, string>
  onFilterChange: (field: string, value: string) => void
  onRefresh: () => void
  addNewPath?: string
  doctype: string
}

export function DataTableToolbar<TData>({
  table,
  filters,
  filterValues,
  onFilterChange,
  onRefresh,
  addNewPath,
  doctype,
}: DataTableToolbarProps<TData>) {
  const navigate = useNavigate()
  const isFiltered = Object.values(filterValues).some(v => v !== "")

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: filters */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {filters.map(filter => (
          <div key={filter.field} className="relative">
            <Input
              value={filterValues[filter.field] ?? ""}
              onChange={e => onFilterChange(filter.field, e.target.value)}
              placeholder={filter.placeholder}
              className="h-8 w-full sm:w-48 text-sm"
            />
          </div>
        ))}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
            onClick={() => filters.forEach(f => onFilterChange(f.field, ""))}
          >
            Clear filters
            <X className="ml-1 h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Column visibility */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel className="text-xs">Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter(col => col.getCanHide())
              .map(col => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="text-xs capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={v => col.toggleVisibility(!!v)}
                >
                  {col.id.replace(/_/g, " ")}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={onRefresh} className="h-8 w-8" title="Refresh">
          <RotateCw className="h-3.5 w-3.5" />
        </Button>

        {addNewPath && (
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => navigate(addNewPath)}>
            <Plus className="h-3.5 w-3.5" />
            New {doctype}
          </Button>
        )}
      </div>
    </div>
  )
}
