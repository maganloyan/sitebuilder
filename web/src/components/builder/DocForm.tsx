import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useFrappeGetDoc, useFrappeUpdateDoc, useFrappeCreateDoc } from "frappe-react-sdk"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import FieldRenderer from "./FieldRenderer"
import ChildTable from "./ChildTable"
import MenuActions from "./MenuActions"

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

export default function DocForm({ doctype, fields, mode, title, urlParamName = "docId" }: DocFormProps) {
  const params = useParams()
  const navigate = useNavigate()
  const docId = params[urlParamName]

  // Single doctypes: name === doctype (only one record exists)
  const isSingle = mode === "edit" && docId === doctype

  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [isDirty, setIsDirty] = useState(false)

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

  useEffect(() => {
    if (mode === "edit" && doc) {
      setFormData(doc as Record<string, unknown>)
    } else if (mode === "create") {
      const init: Record<string, unknown> = {}
      fields.forEach(f => { init[f.fieldname] = f.type === "Table" ? [] : f.default ?? "" })
      setFormData(init)
    }
  }, [doc, mode])

  const handleChange = (fieldname: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [fieldname]: value }))
    setIsDirty(true)
  }

  const handleSave = async () => {
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

  if (isLoading) return <FormSkeleton />

  const tabs = organizeFields(fields)
  const docName = (formData.name as string) || ""
  const pageTitle = title ?? (mode === "create" ? `New ${doctype}` : docName || doctype)

  const renderField = (field: FormField) => {
    if (field.type === "Table" && field.fields?.length) {
      return (
        <ChildTable
          label={field.label}
          fieldname={field.fieldname}
          fields={field.fields}
          value={(formData[field.fieldname] as Record<string, unknown>[]) || []}
          onChange={v => handleChange(field.fieldname, v)}
        />
      )
    }
    return (
      <FieldRenderer
        field={field}
        value={(formData[field.fieldname] as string) || ""}
        onChange={v => handleChange(field.fieldname, v)}
      />
    )
  }

  const gridClass = (colCount: number) =>
    colCount <= 1 ? "grid-cols-1" :
    colCount === 2 ? "grid-cols-1 md:grid-cols-2" :
    colCount === 3 ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
    "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">

          {/* Left: back + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            {!isSingle && (
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate(listPath)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-1.5 text-sm min-w-0">
              {isSingle ? (
                <span className="font-medium truncate">{doctype}</span>
              ) : (
                <>
                  <Link to={listPath} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                    {doctype}
                  </Link>
                  <span className="text-muted-foreground/50">/</span>
                  <span className="font-medium truncate">{pageTitle}</span>
                </>
              )}
            </div>
            {isDirty && (
              <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                Unsaved
              </Badge>
            )}
          </div>

          {/* Right: save + actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isBusy || (mode === "edit" && !isDirty)}
              className="gap-1.5"
            >
              {isBusy
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Save className="h-3.5 w-3.5" />
              }
              {mode === "create" ? "Create" : "Save"}
            </Button>
            {mode === "edit" && docName && !isSingle && (
              <MenuActions
                doctype={doctype}
                docname={docName}
                onDelete={() => navigate(listPath)}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Form body ── */}
      <div className="flex-1 p-4 sm:p-6 space-y-4">
        {tabs.length === 0 ? (
          <p className="text-muted-foreground text-sm">No fields to display.</p>
        ) : tabs.length === 1 ? (
          // Single tab — don't show tab bar, just render sections
          tabs[0].sections.map((section, si) => {
            const cols = section.columns.filter(c => c.length > 0)
            if (!cols.length) return null
            return (
              <Card key={si}>
                {section.label && (
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {section.label}
                    </CardTitle>
                    <Separator />
                  </CardHeader>
                )}
                <CardContent className={`pt-4 grid gap-x-6 gap-y-4 ${gridClass(cols.length)}`}>
                  {cols.map((column, ci) => (
                    <div key={ci} className="space-y-4">
                      {column.map(field => (
                        <div key={field.fieldname}>{renderField(field)}</div>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )
          })
        ) : (
          // Multiple tabs
          <Tabs defaultValue="0">
            <TabsList className="mb-4">
              {tabs.map((tab, ti) => (
                <TabsTrigger key={ti} value={String(ti)}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab, ti) => (
              <TabsContent key={ti} value={String(ti)} className="space-y-4 mt-0">
                {tab.sections.map((section, si) => {
                  const cols = section.columns.filter(c => c.length > 0)
                  if (!cols.length) return null
                  return (
                    <Card key={si}>
                      {section.label && (
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                            {section.label}
                          </CardTitle>
                          <Separator />
                        </CardHeader>
                      )}
                      <CardContent className={`pt-4 grid gap-x-6 gap-y-4 ${gridClass(cols.length)}`}>
                        {cols.map((column, ci) => (
                          <div key={ci} className="space-y-4">
                            {column.map(field => (
                              <div key={field.fieldname}>{renderField(field)}</div>
                            ))}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )
                })}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

    </div>
  )
}
