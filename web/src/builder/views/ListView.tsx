import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFrappeGetCall } from "frappe-react-sdk"
import { PortalErrorState } from "@/components/kit/feedback/portal-state"
import { DataTableSkeleton } from "@/components/kit/feedback/view-skeletons"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LayoutTemplate } from "lucide-react"
import DynamicTable from "../table/DynamicTable"

interface ColumnDef {
  header: string
  accessorKey: string
  fieldtype?: string
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

    if (data.message.issingle) {
      navigate(`/portal/app/${rawDoctype}/view/${doctype}`, { replace: true })
      return
    }

    const listViewFields = data.message.fields.filter(f => f.in_list_view)
    const filterFields = data.message.fields.filter(f => f.in_standard_filter)

    setColumns(listViewFields.map(f => ({
      header: f.label || f.fieldname,
      accessorKey: f.fieldname,
      fieldtype: f.fieldtype,
      className:
        f.fieldtype === "Currency" || f.fieldtype === "Int" || f.fieldtype === "Float"
          ? "text-right tabular-nums"
          : "",
    })))

    setFilters(filterFields.map(f => ({
      field: f.fieldname,
      placeholder: `Filter by ${f.label || f.fieldname}…`,
    })))

    setFields(listViewFields.map(f => f.fieldname))
  }, [data])

  if (isLoading) {
    return <DataTableSkeleton filterCount={2} columnCount={4} />
  }

  if (error) {
    return (
      <PortalErrorState
        title={`Couldn't load ${doctype}`}
        description={error.message}
        onRetry={() => window.location.reload()}
      />
    )
  }

  const isSitePage = doctype === "Site Page"

  return (
    <DynamicTable
      doctype={doctype}
      columns={[
        { header: "Name", accessorKey: "name", fieldtype: "Data" },
        ...columns,
      ]}
      filters={[{ field: "name", placeholder: "Filter by name…" }, ...filters]}
      fields={["name", ...fields]}
      addNewPath="new"
      rowMenuItems={isSitePage ? (name) => (
        <DropdownMenuItem onClick={() => navigate(`/portal/page-builder/${encodeURIComponent(name)}`)}>
          <LayoutTemplate className="mr-2 h-4 w-4" />
          Page Builder
        </DropdownMenuItem>
      ) : undefined}
    />
  )
}
