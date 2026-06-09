import DocForm, { type FormField } from "./DocForm"

interface DynamicCreateProps {
  doctype: string
  fields: FormField[]
  title?: string
  urlParamName?: string
  variant?: "default" | "embedded"
}

export default function DynamicCreate({
  doctype,
  fields,
  title,
  urlParamName = "docId",
  variant = "default",
}: DynamicCreateProps) {
  return (
    <DocForm
      mode="create"
      doctype={doctype}
      fields={fields}
      title={title}
      urlParamName={urlParamName}
      variant={variant}
    />
  )
}