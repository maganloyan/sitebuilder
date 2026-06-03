import { CalendarIcon } from "lucide-react"
import { format, parse, isValid } from "date-fns"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: string        // ISO or dd-MM-yyyy string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({ value, onChange, placeholder = "Pick a date", disabled }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const parseDate = (v?: string): Date | undefined => {
    if (!v) return undefined
    const d = new Date(v)
    if (isValid(d)) return d
    const parsed = parse(v, "dd-MM-yyyy", new Date())
    return isValid(parsed) ? parsed : undefined
  }

  const selected = parseDate(value)

  const handleSelect = (date?: Date) => {
    if (!date) return
    onChange?.(format(date, "yyyy-MM-dd"))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-start text-left font-normal", !selected && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selected ? format(selected, "dd MMM yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          captionLayout="dropdown"
          fromYear={2000}
          toYear={new Date().getFullYear() + 5}
          defaultMonth={selected}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}