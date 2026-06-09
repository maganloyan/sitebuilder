"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import { formatDateForDisplay, formatDateToString, parseLocalDate } from "@/builder/table/data-grid/data-grid"
import { cn } from "@/lib/utils"
import type { ChildTableField } from "./child-table-utils"
import {
  denormalizeValueFromGrid,
  fieldToCellOpts,
  isEditableChildField,
  normalizeRowForGrid,
} from "./child-table-utils"

interface ChildTableRowSheetProps {
  open: boolean
  onClose: () => void
  rowIndex: number
  row: Record<string, unknown>
  fields: ChildTableField[]
  onSave: (updated: Record<string, unknown>) => void
  tableLabel: string
}

function SheetFieldControl({
  field,
  value,
  onChange,
}: {
  field: ChildTableField
  value: unknown
  onChange: (value: unknown) => void
}) {
  const readOnly = field.readOnly ?? false
  const cellOpts = fieldToCellOpts(field)

  switch (cellOpts.variant) {
    case "checkbox":
      return (
        <Checkbox
          checked={Boolean(value)}
          onCheckedChange={checked => onChange(checked === true)}
          disabled={readOnly}
          id={field.fieldname}
        />
      )

    case "number":
      return (
        <Input
          type="number"
          step={cellOpts.step}
          value={value === null || value === undefined ? "" : String(value)}
          onChange={e => {
            const raw = e.target.value
            onChange(raw === "" ? null : Number(raw))
          }}
          readOnly={readOnly}
          className="h-9"
        />
      )

    case "select":
      return (
        <Select
          value={String(value ?? "")}
          onValueChange={onChange}
          disabled={readOnly}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}…`} />
          </SelectTrigger>
          <SelectContent>
            {cellOpts.options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )

    case "date": {
      const dateStr = String(value ?? "")
      const selected = dateStr ? (parseLocalDate(dateStr) ?? undefined) : undefined
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={readOnly}
              className={cn(
                "h-9 w-full justify-start font-normal",
                !dateStr && "text-muted-foreground",
              )}
            >
              {dateStr ? formatDateForDisplay(dateStr) : `Pick ${field.label.toLowerCase()}…`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selected}
              defaultMonth={selected ?? new Date()}
              onSelect={date => onChange(date ? formatDateToString(date) : "")}
            />
          </PopoverContent>
        </Popover>
      )
    }

    case "long-text":
      return (
        <Textarea
          value={String(value ?? "")}
          onChange={e => onChange(e.target.value)}
          readOnly={readOnly}
          className="min-h-[88px] resize-y"
          placeholder={`Enter ${field.label.toLowerCase()}…`}
        />
      )

    case "url":
      return (
        <Input
          type="url"
          value={String(value ?? "")}
          onChange={e => onChange(e.target.value)}
          readOnly={readOnly}
          className="h-9"
          placeholder={`Enter ${field.label.toLowerCase()}…`}
        />
      )

    default:
      return (
        <Input
          type="text"
          value={String(value ?? "")}
          onChange={e => onChange(e.target.value)}
          readOnly={readOnly}
          className="h-9"
          placeholder={`Enter ${field.label.toLowerCase()}…`}
        />
      )
  }
}

export default function ChildTableRowSheet({
  open, onClose, rowIndex, row, fields, onSave, tableLabel,
}: ChildTableRowSheetProps) {
  const sheetFields = fields.filter(isEditableChildField)
  const [draft, setDraft] = useState<Record<string, unknown>>(() =>
    normalizeRowForGrid(row, fields),
  )

  useEffect(() => {
    if (open) {
      setDraft(normalizeRowForGrid(row, fields))
    }
  }, [open, row, fields])

  const apply = () => {
    const saved: Record<string, unknown> = { ...row }
    for (const field of sheetFields) {
      saved[field.fieldname] = denormalizeValueFromGrid(
        draft[field.fieldname],
        field,
      )
    }
    onSave(saved)
    onClose()
  }

  const discard = () => {
    setDraft(normalizeRowForGrid(row, fields))
    onClose()
  }

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
            <SheetDescription className="sr-only">
              Edit all fields for row {rowIndex + 1} in {tableLabel}.
            </SheetDescription>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-5">
            {sheetFields.map(field => {
              const value = draft[field.fieldname]
              const isCheck = field.type === "Check"

              return (
                <div key={field.fieldname} className="space-y-1.5">
                  {isCheck ? (
                    <div className="flex items-center gap-2">
                      <SheetFieldControl
                        field={field}
                        value={value}
                        onChange={v => setDraft(prev => ({ ...prev, [field.fieldname]: v }))}
                      />
                      <Label htmlFor={field.fieldname} className="cursor-pointer font-normal">
                        {field.label}
                        {field.mandatory && <span className="ml-0.5 text-destructive">*</span>}
                      </Label>
                    </div>
                  ) : (
                    <>
                      <Label
                        htmlFor={field.fieldname}
                        className={field.mandatory ? "after:content-['*'] after:ml-0.5 after:text-destructive" : ""}
                      >
                        {field.label}
                      </Label>
                      <SheetFieldControl
                        field={field}
                        value={value}
                        onChange={v => setDraft(prev => ({ ...prev, [field.fieldname]: v }))}
                      />
                    </>
                  )}
                </div>
              )
            })}
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
