import { useEffect, useMemo, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc } from "frappe-react-sdk"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import toast from "@/lib/portal-toast"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormSection } from "@/components/kit"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import FieldRenderer from "./FieldRenderer"
import ChildTable from "@/builder/table/ChildTable"
import MenuActions from "@/builder/table/MenuActions"
import { usePortalPageMetaOverride } from "@/context/portal-page-meta-context"
import {
  buildFormPageMeta,
  getDocDisplayTitle,
} from "@/lib/portal-page-meta-route"
import {
  focusFormField,
  getFirstInvalidFieldname,
  validateFormFields,
} from "@/lib/validate-form-fields"
import { Card, CardContent } from "@/components/ui/card"

// ── Types ────────────────────────────────────────────────────────────────────

export interface FormField {
  fieldname: string
  label: string
  type: string
  options?: string
  mandatory?: boolean
  readOnly?: boolean
  hidden?: boolean
  default?: string
  display_field?: string
  fields?: FormField[]
}

interface Section {
  label?: string
  columns: FormField[][]
}

interface Tab {
  label: string
  sections: Section[]
}

interface DocFormProps {
  doctype: string
  fields: FormField[]
  mode: "create" | "edit"
  title?: string
  urlParamName?: string
  /** Hides duplicate breadcrumbs; dashboard header shows route meta. */
  variant?: "default" | "embedded"
}

// ── Field layout organiser ───────────────────────────────────────────────────

function organizeFields(fields: FormField[]): Tab[] {
  const tabs: Tab[] = []
  let ti = -1, si = 0, ci = 0

  const ensureTab = () => {
    if (ti === -1) {
      ti = 0
      tabs[0] = { label: "Details", sections: [{ columns: [[]] }] }
    }
  }

  fields.forEach(field => {
    if (field.hidden) return

    if (field.type === "Tab Break") {
      ti++; si = 0; ci = 0
      tabs[ti] = { label: field.label || `Tab ${ti + 1}`, sections: [{ columns: [[]] }] }
      return
    }

    ensureTab()

    if (field.type === "Section Break") {
      si++; ci = 0
      if (!tabs[ti].sections[si]) {
        tabs[ti].sections[si] = { label: field.label, columns: [[]] }
      }
      return
    }

    if (field.type === "Column Break") {
      ci++
      if (!tabs[ti].sections[si]) tabs[ti].sections[si] = { columns: [[]] }
      if (!tabs[ti].sections[si].columns[ci]) tabs[ti].sections[si].columns[ci] = []
      return
    }

    if (!tabs[ti].sections[si]) tabs[ti].sections[si] = { columns: [[]] }
    if (!tabs[ti].sections[si].columns[ci]) tabs[ti].sections[si].columns[ci] = []
    tabs[ti].sections[si].columns[ci].push(field)
  })

  return tabs.filter(t => t.sections.some(s => s.columns.some(c => c.length > 0)))
}

// ── Loading skeleton ─────────────────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-5 w-48" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-9 w-64" />
      <Card>
        <CardContent className="p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function DocForm({
  doctype,
  fields,
  mode,
  title,
  urlParamName = "docId",
  variant = "default",
}: DocFormProps) {
  const params = useParams()
  const navigate = useNavigate()
  const docId = params[urlParamName]

  // Single doctypes: name === doctype (only one record exists)
  const isSingle = mode === "edit" && docId === doctype

  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [isDirty, setIsDirty] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const slug = doctype.toLowerCase().replace(/\s+/g, "-")
  const listPath = `/portal/app/${slug}`

  // ── Data ──
  const { data: doc, isLoading } = useFrappeGetDoc(
    doctype,
    mode === "edit" ? (docId as string) : "",
    { revalidateOnFocus: false }
  )
  const { updateDoc, loading: isSaving } = useFrappeUpdateDoc()
  const { createDoc, loading: isCreating } = useFrappeCreateDoc()

  const isBusy = isSaving || isCreating
  const { apply: applyPageMeta, clear: clearPageMeta } = usePortalPageMetaOverride()
  const isEmbedded = variant === "embedded"

  useEffect(() => {
    if (mode === "edit" && doc) {
      setFormData(doc as Record<string, unknown>)
    } else if (mode === "create") {
      const init: Record<string, unknown> = {}
      fields.forEach(f => { init[f.fieldname] = f.type == "Table" ? [] : f.default ?? "" })
      setFormData(init)
    }
  }, [doc, mode])

  const handleChange = (fieldname: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [fieldname]: value }))
    setIsDirty(true)
    if (fieldErrors[fieldname]) {
      setFieldErrors(prev => {
        const next = { ...prev }
        delete next[fieldname]
        return next
      })
    }
  }

  const handleSave = async () => {
    const errors = validateFormFields(fields, formData)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      toast.error("Please fix the highlighted fields")
      const first = getFirstInvalidFieldname(fields, errors)
      if (first) {
        requestAnimationFrame(() => focusFormField(first))
      }
      return
    }
    setFieldErrors({})

    try {
      if (mode === "edit") {
        await updateDoc(doctype, formData.name as string, formData)
        toast.success("Saved")
        setIsDirty(false)
      } else {
        const result = await createDoc(doctype, formData)
        toast.success(`${doctype} created`)
        navigate(`${listPath}/view/${result.name}`)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed")
    }
  }

  const docName = (formData.name as string) || ""
  const displayTitle = useMemo(
    () => getDocDisplayTitle(formData),
    [formData]
  )
  const pageTitle = useMemo(() => {
    if (mode === "create") return title ?? `New ${doctype}`
    if (isLoading) return (docId as string) || doctype
    return title ?? (displayTitle || docName || doctype)
  }, [mode, title, doctype, isLoading, docId, displayTitle, docName])

  useEffect(() => {
    applyPageMeta(buildFormPageMeta(doctype, mode, pageTitle))
    return () => clearPageMeta()
  }, [applyPageMeta, clearPageMeta, doctype, mode, pageTitle])

  if (isLoading) return <FormSkeleton />

  const tabs = organizeFields(fields)

  const renderField = (field: FormField) => {
    if (field.type === "Table" && field.fields?.length) {
      return (
        <div className="space-y-1.5" data-portal-field={field.fieldname}>
          <ChildTable
            label={field.label}
            fieldname={field.fieldname}
            fields={field.fields}
            value={(formData[field.fieldname] as Record<string, unknown>[]) || []}
            onChange={v => handleChange(field.fieldname, v)}
          />
          {fieldErrors[field.fieldname] ? (
            <p className="text-destructive text-xs" role="alert">
              {fieldErrors[field.fieldname]}
            </p>
          ) : null}
        </div>
      )
    }
    return (
      <FieldRenderer
        field={field}
        value={(formData[field.fieldname] as string) || ""}
        onChange={v => handleChange(field.fieldname, v)}
        error={fieldErrors[field.fieldname]}
      />
    )
  }

  const gridClass = (colCount: number) =>
    colCount <= 1 ? "grid-cols-1" :
    colCount === 2 ? "grid-cols-1 md:grid-cols-2" :
    colCount === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
    "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

  const renderFormSection = (section: Section, si: number) => {
    const cols = section.columns.filter((c) => c.length > 0)
    if (!cols.length) return null

    const scalarCols = cols.map((col) => col.filter((f) => f.type !== "Table"))
    const tableFields = cols.flatMap((col) => col.filter((f) => f.type === "Table"))
    const activeScalarCols = scalarCols.filter((c) => c.length > 0)
    const hasScalars = activeScalarCols.length > 0

    const scalarPanel = hasScalars ? (
      <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm sm:p-5">
        <div className={`grid gap-x-5 gap-y-5 ${gridClass(activeScalarCols.length)}`}>
          {activeScalarCols.map((column, ci) => (
            <div key={ci} className="space-y-5">
              {column.map((field) => (
                <div key={field.fieldname}>{renderField(field)}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ) : null

    const tablePanel =
      tableFields.length > 0 ? (
        <div className={cn("space-y-4", hasScalars && "mt-6")}>
          {tableFields.map((field) => (
            <div key={field.fieldname}>{renderField(field)}</div>
          ))}
        </div>
      ) : null

    const content = (
      <>
        {scalarPanel}
        {tablePanel}
      </>
    )

    if (section.label) {
      return (
        <FormSection key={si} title={section.label}>
          {content}
        </FormSection>
      )
    }
    return (
      <div key={si} className="space-y-4">
        {content}
      </div>
    )
  }

  const formBodyClass = cn("flex-1 space-y-4", isEmbedded ? "pt-2" : "p-4 sm:p-6")

  const formSections =
    tabs.length === 0 ? (
      <p className="text-muted-foreground text-sm">No fields to display.</p>
    ) : tabs.length === 1 ? (
      tabs[0].sections.map((section, si) => renderFormSection(section, si))
    ) : (
      tabs.map((tab, ti) => (
        <TabsContent key={ti} value={String(ti)} className="mt-0 space-y-4">
          {tab.sections.map((section, si) => renderFormSection(section, si))}
        </TabsContent>
      ))
    )

  const formToolbar = (
    <div className="sticky top-0 z-10 flex h-12 items-center justify-between gap-3 border-b bg-background px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {!isSingle ? (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={() => navigate(listPath)}
            aria-label={`Back to ${doctype} list`}
          >
            <ArrowLeft className="size-4" />
          </Button>
        ) : null}
        {!isEmbedded && !isSingle ? (
          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            <Link
              to={listPath}
              className="truncate text-muted-foreground hover:text-foreground"
            >
              {doctype}
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="truncate font-medium">{pageTitle}</span>
          </div>
        ) : null}
        {isDirty ? (
          <Badge variant="outline" className="shrink-0 text-muted-foreground text-xs">
            Unsaved
          </Badge>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isBusy || (mode === "edit" && !isDirty)}
          className="gap-1.5"
        >
          {isBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
          {mode === "create" ? "Create" : "Save"}
        </Button>
        {mode === "edit" && docName && !isSingle ? (
          <MenuActions
            doctype={doctype}
            docname={docName}
            onDelete={() => navigate(listPath)}
          />
        ) : null}
      </div>
    </div>
  )

  if (tabs.length > 1) {
    return (
      <Tabs defaultValue="0" className="flex min-h-full flex-col">
        {formToolbar}
        <div className={formBodyClass}>
          <TabsList className="mb-4 h-9 w-fit">
            {tabs.map((tab, ti) => (
              <TabsTrigger key={ti} value={String(ti)}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {formSections}
        </div>
      </Tabs>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      {formToolbar}
      <div className={formBodyClass}>{formSections}</div>
    </div>
  )
}
