import DocForm, { type FormField } from "./DocForm"

interface DynamicFormViewProps {
  doctype: string
  fields: FormField[]
  title?: string
  urlParamName?: string
  variant?: "default" | "embedded"
}

export default function DynamicFormView({
  doctype,
  fields,
  title,
  urlParamName = "docId",
  variant = "embedded",
}: DynamicFormViewProps) {
  return (
    <DocForm
      mode="edit"
      doctype={doctype}
      fields={fields}
      title={title}
      urlParamName={urlParamName}
      variant={variant}
    />
  )
}