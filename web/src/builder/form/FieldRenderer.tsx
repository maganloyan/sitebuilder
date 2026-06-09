import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Field, FieldContent, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Camera, Pencil, X } from "lucide-react"
import { cn } from "@/lib/utils"
import FileUpload from "./FileUpload"
import LinkField from "./LinkField"
import { DatePicker } from "./DatePicker"

interface Field {
  label: string
  fieldname: string
  type: string
  options?: string
  mandatory?: boolean
  readOnly?: boolean
  default?: string
  display_field?: string
  hidden?: boolean
  in_list_view?: boolean
}

interface FieldRendererProps {
  field: Field
  value: string
  onChange: (value: string) => void
  error?: string
}

export default function FieldRenderer({ field, value, onChange, error }: FieldRendererProps) {
  if (field.hidden) return null

  // Layout-only field types — rendered by the parent layout, not here
  if (["Section Break", "Column Break", "Tab Break"].includes(field.type)) return null

  const val = value ?? field.default ?? ""
  const isReadOnly = field.readOnly
  const readOnlyClass = isReadOnly
    ? "cursor-default border-transparent bg-muted/40 text-muted-foreground"
    : ""
  const invalidClass = error ? "border-destructive ring-destructive/20" : ""
  const fieldFocusProps = {
    id: `portal-field-${field.fieldname}`,
    "data-portal-field": field.fieldname,
  } as const

  const renderInput = () => {
    switch (field.type) {
      case "Text":
      case "Small Text":
      case "Long Text":
      case "Code":
        return (
          <Textarea
            {...fieldFocusProps}
            value={val}
            onChange={e => onChange(e.target.value)}
            readOnly={isReadOnly}
            placeholder={`Enter ${field.label.toLowerCase()}…`}
            className={cn("min-h-[80px] resize-y", readOnlyClass, invalidClass)}
            aria-invalid={!!error}
          />
        )

      case "Check":
        return (
          <Checkbox
            checked={val === "1" || val === "true"}
            onCheckedChange={checked => onChange(checked ? "1" : "0")}
            disabled={isReadOnly}
            id={`portal-field-${field.fieldname}`}
            className="shrink-0"
          />
        )

      case "Date":
        return (
          <DatePicker
            value={val}
            onChange={onChange}
            disabled={isReadOnly}
          />
        )

      case "Datetime":
        return (
          <Input
            {...fieldFocusProps}
            type="datetime-local"
            value={val}
            onChange={e => onChange(e.target.value)}
            readOnly={isReadOnly}
            className={cn(readOnlyClass, invalidClass)}
            aria-invalid={!!error}
          />
        )

      case "Float":
      case "Currency":
        return (
          <Input
            {...fieldFocusProps}
            type="number"
            step="0.01"
            value={val}
            onChange={e => onChange(e.target.value)}
            readOnly={isReadOnly}
            placeholder={field.type === "Currency" ? "0.00" : "0.0"}
            className={cn(readOnlyClass, invalidClass)}
            aria-invalid={!!error}
          />
        )

      case "Int":
        return (
          <Input
            {...fieldFocusProps}
            type="number"
            step="1"
            value={val}
            onChange={e => onChange(e.target.value)}
            readOnly={isReadOnly}
            placeholder="0"
            className={cn(readOnlyClass, invalidClass)}
            aria-invalid={!!error}
          />
        )

      case "Select": {
        const options = (field.options ?? "").split("\n").filter(Boolean)
        const selectValue = val && options.includes(val) ? val : ""
        return (
          <Select
            key={`${field.fieldname}-${selectValue || "__empty__"}`}
            value={selectValue}
            onValueChange={onChange}
            disabled={isReadOnly}
          >
            <SelectTrigger
              {...fieldFocusProps}
              className={cn(readOnlyClass, invalidClass)}
              aria-invalid={!!error}
            >
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}…`} />
            </SelectTrigger>
            <SelectContent>
              {options.map(opt => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      }

      case "Link":
        return (
          <LinkField
            fieldname={field.fieldname}
            label={field.label}
            doctype={field.options ?? ""}
            value={val}
            onChange={onChange}
            displayField={field.display_field}
          />
        )

      case "Attach":
      case "Attach Image": {
        const isImage = field.type === "Attach Image"
        const isLogo = /logo|avatar|icon/i.test(field.fieldname)
        const isCover = /cover|banner|hero|background/i.test(field.fieldname)
        const shape = isLogo ? "square" : isCover ? "wide" : "auto"
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [hovered, setHovered] = useState(false)

        if (val && isImage) {
          if (isLogo) {
            return (
              <div
                className="relative h-24 w-24 rounded-xl overflow-hidden border bg-muted/30 cursor-pointer group"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                <img src={val} alt={field.label} className="h-full w-full object-cover" />
                {/* Hover overlay */}
                <div className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/60 transition-opacity duration-150",
                  hovered ? "opacity-100" : "opacity-0"
                )}>
                  <button
                    onClick={() => document.getElementById(`upload-${field.fieldname}`)?.click()}
                    className="flex items-center gap-1 rounded-md bg-white/20 hover:bg-white/30 px-2 py-1 text-white text-xs font-medium transition-colors"
                  >
                    <Pencil className="h-3 w-3" /> Change
                  </button>
                  <button
                    onClick={() => onChange("")}
                    className="flex items-center gap-1 rounded-md bg-white/20 hover:bg-red-500/60 px-2 py-1 text-white text-xs font-medium transition-colors"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </div>
                {/* Hidden file input for change */}
                <input
                  id={`upload-${field.fieldname}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const fd = new FormData()
                    fd.append("file", file)
                    fd.append("is_private", "0")
                    const res = await fetch("/api/method/upload_file", { method: "POST", body: fd })
                    const json = await res.json()
                    if (json.message?.file_url) onChange(json.message.file_url)
                    e.target.value = ""
                  }}
                />
              </div>
            )
          }

          // Cover / wide image
          return (
            <div
              className="relative h-32 w-full rounded-xl overflow-hidden border bg-muted/30 cursor-pointer group"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            >
              <img src={val} alt={field.label} className="h-full w-full object-cover" />
              <div className={cn(
                "absolute inset-0 flex items-center justify-center gap-2 bg-black/50 transition-opacity duration-150",
                hovered ? "opacity-100" : "opacity-0"
              )}>
                <button
                  onClick={() => document.getElementById(`upload-${field.fieldname}`)?.click()}
                  className="flex items-center gap-1.5 rounded-md bg-white/20 hover:bg-white/30 px-3 py-1.5 text-white text-xs font-medium transition-colors"
                >
                  <Camera className="h-3.5 w-3.5" /> Change
                </button>
                <button
                  onClick={() => onChange("")}
                  className="flex items-center gap-1.5 rounded-md bg-white/20 hover:bg-red-500/60 px-3 py-1.5 text-white text-xs font-medium transition-colors"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              </div>
              <input
                id={`upload-${field.fieldname}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const fd = new FormData()
                  fd.append("file", file)
                  fd.append("is_private", "0")
                  const res = await fetch("/api/method/upload_file", { method: "POST", body: fd })
                  const json = await res.json()
                  if (json.message?.file_url) onChange(json.message.file_url)
                  e.target.value = ""
                }}
              />
            </div>
          )
        }

        // Non-image attach with value
        if (val) {
          return (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <p className="text-sm text-muted-foreground flex-1 truncate">{val.split("/").pop()}</p>
              <Button variant="ghost" size="icon" className="size-9" onClick={() => window.open(val, "_blank")} aria-label="Open file">
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="size-9 text-destructive hover:text-destructive" onClick={() => onChange("")} aria-label="Remove file">
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        }

        return (
          <FileUpload
            fieldname={field.fieldname}
            onFileUpload={onChange}
            accept={isImage ? "image/*" : undefined}
            shape={shape}
          />
        )
      }

      default:
        return (
          <Input
            {...fieldFocusProps}
            type="text"
            value={val}
            onChange={e => onChange(e.target.value)}
            readOnly={isReadOnly}
            placeholder={`Enter ${field.label.toLowerCase()}…`}
            className={cn(readOnlyClass, invalidClass)}
            aria-invalid={!!error}
          />
        )
    }
  }

  const mandatoryMark = field.mandatory ? (
    <span className="text-destructive" aria-hidden>
      *
    </span>
  ) : null

  if (field.type === "Check" && field.label) {
    return (
      <Field
        orientation="horizontal"
        data-portal-field={field.fieldname}
        className={cn(
          "items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/15 px-3 py-2.5 min-h-10",
          isReadOnly && "opacity-80"
        )}
      >
        <FieldLabel
          htmlFor={`portal-field-${field.fieldname}`}
          className="cursor-pointer text-sm font-medium text-foreground"
        >
          {field.label}
          {mandatoryMark}
        </FieldLabel>
        {renderInput()}
        {error ? (
          <p className="text-destructive text-xs col-span-full" role="alert">
            {error}
          </p>
        ) : null}
      </Field>
    )
  }

  return (
    <Field data-portal-field={field.fieldname} className="gap-1.5">
      {field.label ? (
        <FieldLabel
          htmlFor={`portal-field-${field.fieldname}`}
          className="text-xs font-medium text-muted-foreground"
        >
          {field.label}
          {mandatoryMark}
        </FieldLabel>
      ) : null}
      <FieldContent>{renderInput()}</FieldContent>
      {error ? (
        <p className="text-destructive text-xs" role="alert">
          {error}
        </p>
      ) : null}
    </Field>
  )
}