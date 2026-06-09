import { useState } from "react"
import { useFrappeGetDocList } from "frappe-react-sdk"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface LinkFieldProps {
  fieldname: string
  label: string
  doctype: string
  value: string
  onChange: (value: string) => void
  displayField?: string
}

export default function LinkField({ fieldname, label, doctype, value, onChange, displayField }: LinkFieldProps) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const fields = displayField ? ["name", displayField] : ["name"]

  const { data: records, isLoading } = useFrappeGetDocList(doctype, {
    fields,
    filters: search
      ? [["name", "like", `%${search}%`]]
      : [],
    limit: 20,
  })

  const selected = records?.find(r => r.name === value)
  const displayValue = (r: any) =>
    displayField && r[displayField] ? `${r[displayField]} (${r.name})` : r.name

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          id={fieldname}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between font-normal", !value && "text-muted-foreground")}
        >
          <span className="truncate">
            {selected ? displayValue(selected) : value || `Select ${label}…`}
          </span>
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {value && (
              <span
                role="button"
                tabIndex={0}
                onClick={e => { e.stopPropagation(); onChange("") }}
                onKeyDown={e => e.key === "Enter" && onChange("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder={`Search ${label}…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
        </div>
        <div className="max-h-56 overflow-y-auto py-1">
          {isLoading ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">Loading…</div>
          ) : !records?.length ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">No results found.</div>
          ) : (
            records.map(r => (
              <DropdownMenuItem
                key={r.name}
                onSelect={() => { onChange(r.name); setOpen(false); setSearch("") }}
                className="gap-2"
              >
                <Check className={cn("h-4 w-4 shrink-0", r.name === value ? "opacity-100" : "opacity-0")} />
                {displayValue(r)}
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}