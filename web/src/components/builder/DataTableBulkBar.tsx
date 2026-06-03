import { Loader2, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface DataTableBulkBarProps {
  selectedCount: number
  isDeleting: boolean
  onDelete: () => void
  onClear: () => void
}

export function DataTableBulkBar({ selectedCount, isDeleting, onDelete, onClear }: DataTableBulkBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-accent/60 px-3 py-1.5 text-sm animate-in fade-in slide-in-from-top-1 duration-150">
      <span className="font-medium text-foreground">
        {selectedCount} selected
      </span>
      <Separator orientation="vertical" className="h-4" />
      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="destructive"
          size="sm"
          className="h-7 gap-1.5 text-xs"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Trash2 className="h-3 w-3" />
          }
          Delete
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClear} title="Clear selection">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
