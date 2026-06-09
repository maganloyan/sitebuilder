import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useFrappeCreateDoc, useFrappeUpdateDoc, useFrappeGetDoc } from "frappe-react-sdk"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import FieldRenderer from "@/builder/form/FieldRenderer"
import ChildTable from "@/builder/table/ChildTable"

// ── Types ────────────────────────────────────────────────────────────────────

export interface DynamicFormField {
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
  dependsOn?: string
}

export interface DynamicFormChildTable {
  fieldname: string
  fields: DynamicFormField[]
}

interface DynamicFormProps {
  /** The Frappe doctype to create / edit */
  doctype: string
  /** Pre-defined field list (from form_builder.py generated file) */
  fields: DynamicFormField[]
  /** Optional child table definitions */
  childTables?: DynamicFormChildTable[]
  /** Existing doc name to edit — omit for create mode */
  docname?: string
  /** Called after successful save with the doc name */
  onSuccess?: (name: string) => void
  /** Override form title */
  title?: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DynamicForm({
  doctype,
  fields,
  childTables = [],
  docname,
  onSuccess,
  title,
}: DynamicFormProps) {
  const navigate = useNavigate()
  const isEdit = !!docname

  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [isDirty, setIsDirty] = useState(false)

  const { data: existingDoc, isLoading } = useFrappeGetDoc(
    doctype,
    isEdit ? docname : "",
    { revalidateOnFocus: false }
  )

  const { createDoc, loading: isCreating } = useFrappeCreateDoc()
  const { updateDoc, loading: isUpdating } = useFrappeUpdateDoc()

  const isBusy = isCreating || isUpdating

  // Populate form data
  useEffect(() => {
    if (isEdit && existingDoc) {
      setFormData(existingDoc as Record<string, unknown>)
    } else if (!isEdit) {
      const init: Record<string, unknown> = {}
      fields.forEach(f => {
        init[f.fieldname] = f.default ?? (f.type === "Check" ? "0" : "")
      })
      childTables.forEach(ct => { init[ct.fieldname] = [] })
      setFormData(init)
    }
  }, [existingDoc, isEdit])

  const handleChange = (fieldname: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [fieldname]: value }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    try {
      if (isEdit) {
        await updateDoc(doctype, docname as string, formData)
        toast.success("Saved")
        setIsDirty(false)
        onSuccess?.(docname as string)
      } else {
        const result = await createDoc(doctype, formData)
        toast.success(`${doctype} created`)
        onSuccess?.(result.name)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  // Separate top-level fields from child tables
  const topFields = fields.filter(f =>
    !childTables.some(ct => ct.fieldname === f.fieldname) &&
    !["Section Break", "Column Break", "Tab Break"].includes(f.type)
  )

  const pageTitle = title ?? (isEdit ? `Edit ${doctype}` : `New ${doctype}`)

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 sm:px-6 h-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium text-sm truncate">{pageTitle}</span>
            {isDirty && (
              <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">Unsaved</Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isBusy || (isEdit && !isDirty)}
            className="gap-1.5"
          >
            {isBusy
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Save className="h-3.5 w-3.5" />
            }
            {isEdit ? "Save" : "Create"}
          </Button>
        </div>
      </div>

      {/* ── Form body ── */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Main fields */}
        <Card className="rounded-xl ">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 ">
            {topFields.map(field => (
              <div key={field.fieldname} className={field.type === "Text" || field.type === "Long Text" ? "md:col-span-2" : ""}>
                <FieldRenderer
                  field={field}
                  value={(formData[field.fieldname] as string) || ""}
                  onChange={v => handleChange(field.fieldname, v)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Child tables */}
        {childTables.map(ct => (
          <ChildTable
            key={ct.fieldname}
            label={ct.fieldname.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            fieldname={ct.fieldname}
            fields={ct.fields}
            value={(formData[ct.fieldname] as Record<string, unknown>[]) || []}
            onChange={v => handleChange(ct.fieldname, v)}
          />
        ))}
      </div>
    </div>
  )
}
