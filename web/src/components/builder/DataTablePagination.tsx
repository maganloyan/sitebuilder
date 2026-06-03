import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DataTablePaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  itemsPerPage: number
  selectedCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

export function DataTablePagination({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  selectedCount,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const from = Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)
  const to = Math.min(currentPage * itemsPerPage, totalCount)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 text-sm text-muted-foreground">

      {/* Left: selection + rows per page */}
      <div className="flex items-center gap-4">
        {selectedCount > 0 && (
          <span className="text-xs font-medium text-foreground">
            {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
          </span>
        )}
        <div className="flex items-center gap-2">
          <span className="text-xs whitespace-nowrap">Rows per page</span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={v => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-7 w-16 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50].map(size => (
                <SelectItem key={size} value={String(size)} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Right: page info + controls */}
      <div className="flex items-center gap-3">
        <span className="text-xs whitespace-nowrap">
          {from}–{to} of {totalCount}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
            <ChevronsLeft className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="min-w-[4rem] text-center text-xs font-medium text-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onPageChange(totalPages)} disabled={currentPage >= totalPages}>
            <ChevronsRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

    </div>
  )
}
