import DocForm, { type FormField } from "./DocForm"

interface DynamicFormViewProps {
  doctype: string
  fields: FormField[]
  title?: string
  urlParamName?: string
}

export default function DynamicFormView({ doctype, fields, title, urlParamName = "docId" }: DynamicFormViewProps) {
  return <DocForm mode="edit" doctype={doctype} fields={fields} title={title} urlParamName={urlParamName} />
}