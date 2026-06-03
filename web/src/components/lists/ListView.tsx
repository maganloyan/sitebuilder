import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFrappeGetCall } from "frappe-react-sdk"
import { Skeleton } from "@/components/ui/skeleton"
import DynamicTable from "../builder/DynamicTable"

interface ColumnDef {
  header: string
  accessorKey: string
  className?: string
}

interface Filter {
  field: string
  placeholder: string
}

interface Field {
  fieldname: string
  label: string
  fieldtype: string
  in_list_view: boolean
  in_standard_filter: boolean
}

const toTitleCase = (str: string) =>
  str.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")

export default function ListView() {
  const { doctype: rawDoctype } = useParams<{ doctype: string }>()
  const doctype = rawDoctype ? toTitleCase(rawDoctype) : ""
  const navigate = useNavigate()

  const [columns, setColumns] = useState<ColumnDef[]>([])
  const [filters, setFilters] = useState<Filter[]>([])
  const [fields, setFields] = useState<string[]>([])

  const { data, error, isLoading } = useFrappeGetCall<{
    message: { issingle: number; fields: Field[] }
  }>("sitebuilder.sitebuilder.api.get_doctype_fields", { doctype })

  useEffect(() => {
    if (!data?.message) return

    // Single doctypes have only one record — go straight to the form
    if (data.message.issingle) {
      navigate(`/portal/app/${rawDoctype}/view/${doctype}`, { replace: true })
      return
    }

    const listViewFields = data.message.fields.filter(f => f.in_list_view)
    const filterFields = data.message.fields.filter(f => f.in_standard_filter)

    setColumns(listViewFields.map(f => ({
      header: f.label || f.fieldname,
      accessorKey: f.fieldname,
      className: f.fieldtype === "Currency" || f.fieldtype === "Int" ? "text-right" : "",
    })))

    setFilters(filterFields.map(f => ({
      field: f.fieldname,
      placeholder: `Filter by ${f.label || f.fieldname}…`,
    })))

    setFields(listViewFields.map(f => f.fieldname))
  }, [data])

  if (isLoading) return (
    <div className="space-y-3 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )

  if (error) return (
    <p className="p-6 text-destructive text-sm">Error loading {doctype}: {error.message}</p>
  )

  return (
    <DynamicTable
      doctype={doctype}
      columns={[{ header: "Name", accessorKey: "name" }, ...columns]}
      filters={[{ field: "name", placeholder: "Filter by name…" }, ...filters]}
      fields={["name", ...fields]}
      addNewPath="new"
    />
  )
}
