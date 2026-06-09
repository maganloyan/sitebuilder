import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useFrappeGetCall } from "frappe-react-sdk"
import { PortalErrorState } from "@/components/kit/feedback/portal-state"
import { Skeleton } from "@/components/ui/skeleton"
import DynamicCreate from "../form/DynamicCreate"

const toTitleCase = (s: string) =>
  s.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

interface RawField {
  fieldname: string; label: string; fieldtype: string; hidden: number
  read_only: number; reqd: number; options?: string; default?: string
  in_list_view?: number; display_field?: string
}

export default function CreateView() {
  const { doctype: raw } = useParams<{ doctype: string }>()
  const doctype = raw ? toTitleCase(raw) : ""

  const [childFields, setChildFields] = useState<Record<string, RawField[]>>({})

  const { data, isLoading, error } = useFrappeGetCall<{ message: { fields: RawField[] } }>(
    "sitebuilder.sitebuilder.api.get_doctype_fields",
    { doctype },
    doctype ? undefined : null
  )

  useEffect(() => {
    const tableFields = (data?.message?.fields ?? []).filter(f => f.fieldtype === "Table" && f.options)
    tableFields.forEach(async tf => {
      const r = await fetch(`/api/method/sitebuilder.sitebuilder.api.get_doctype_fields?doctype=${tf.options}`)
      const json = await r.json()
      if (json?.message?.fields) setChildFields(prev => ({ ...prev, [tf.fieldname]: json.message.fields }))
    })
  }, [data])

  const fields = (data?.message?.fields ?? []).map(f => ({
    fieldname: f.fieldname,
    label: f.label ?? "",
    type: f.fieldtype,
    hidden: !!f.hidden,
    readOnly: !!f.read_only,
    mandatory: !!f.reqd,
    options: f.options,
    default: f.default,
    display_field: f.display_field,
    fields: f.fieldtype === "Table" ? (childFields[f.fieldname] ?? []).map(cf => ({
      fieldname: cf.fieldname,
      label: cf.label ?? "",
      type: cf.fieldtype,
      options: cf.options,
      default: cf.default,
      mandatory: !!cf.reqd,
      readOnly: !!cf.read_only,
      in_list_view: !!cf.in_list_view,
    })) : undefined,
  }))

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <PortalErrorState
        title={`Couldn't load ${doctype} form`}
        description={error.message}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <DynamicCreate
      doctype={doctype}
      fields={fields}
      title={`New ${doctype}`}
      variant="embedded"
    />
  )
}
