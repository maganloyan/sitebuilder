import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { recordPortalRecent } from "@/lib/portal-recents"
import type { CommandMenuItem } from "@/types/command-item"

export interface CommandMenuProps {
  items: CommandMenuItem[]
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
  placeholder?: string
  loading?: boolean
  shouldFilter?: boolean
  search?: string
  onSearchChange?: (value: string) => void
  onClose?: () => void
}

export function CommandMenu({
  items,
  open: controlledOpen,
  onOpenChange,
  trigger,
  placeholder = "Search or type a command…",
  loading = false,
  shouldFilter = true,
  search,
  onSearchChange,
  onClose,
}: CommandMenuProps) {
  const navigate = useNavigate()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen

  const setOpen = (next: boolean) => {
    if (!next) onClose?.()
    ;(onOpenChange ?? setInternalOpen)(next)
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onOpenChange])

  const groups = [...new Set(items.map((i) => i.group))]

  function handleSelect(item: CommandMenuItem) {
    setOpen(false)
    if (item.href) {
      recordPortalRecent({
        label: item.label,
        href: item.href,
        doctype: item.keywords,
      })
    }
    if (item.onSelect) {
      item.onSelect()
    } else if (item.href) {
      navigate(item.href)
    }
  }

  return (
    <>
      {trigger ? (
        <button type="button" onClick={() => setOpen(true)} className="contents">
          {trigger}
        </button>
      ) : null}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search documents, lists, and portal pages"
        shouldFilter={shouldFilter}
        value={search}
        onValueChange={onSearchChange}
      >
        <CommandInput placeholder={placeholder} />
        <CommandList>
          {loading ? (
            <div className="flex items-center gap-2 border-b px-3 py-2 text-muted-foreground text-xs">
              <Loader2 className="size-3 animate-spin" />
              Searching…
            </div>
          ) : null}
          {items.length === 0 && !loading ? (
            <CommandEmpty>No results found.</CommandEmpty>
          ) : (
            groups.map((group, gi) => (
              <div key={group}>
                {gi > 0 ? <CommandSeparator /> : null}
                <CommandGroup heading={group}>
                  {items
                    .filter((i) => i.group === group)
                    .map((item) => {
                      const Icon = item.icon
                      return (
                        <CommandItem
                          key={item.id}
                          value={`${item.label} ${item.keywords ?? ""} ${item.description ?? ""}`}
                          onSelect={() => handleSelect(item)}
                        >
                          {Icon ? <Icon className="size-4 shrink-0" /> : null}
                          <div className="flex min-w-0 flex-col">
                            <span>{item.label}</span>
                            {item.description ? (
                              <span className="truncate text-muted-foreground text-xs">
                                {item.description}
                              </span>
                            ) : null}
                          </div>
                        </CommandItem>
                      )
                    })}
                </CommandGroup>
              </div>
            ))
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}
