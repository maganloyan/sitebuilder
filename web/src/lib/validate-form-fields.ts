import type { FormField } from "@/builder/form/DocForm"

export function validateFormFields(
  fields: FormField[],
  formData: Record<string, unknown>
): Record<string, string> {
  const errors: Record<string, string> = {}

  const visit = (field: FormField) => {
    if (field.hidden || field.readOnly || !field.mandatory) return

    const value = formData[field.fieldname]

    if (field.type === "Check") {
      if (value !== "1" && value !== "true" && value !== 1 && value !== true) {
        errors[field.fieldname] = `${field.label} is required`
      }
      return
    }

    if (field.type === "Table") {
      if (!Array.isArray(value) || value.length === 0) {
        errors[field.fieldname] = `Add at least one row to ${field.label}`
      }
      return
    }

    if (value === null || value === undefined || String(value).trim() === "") {
      errors[field.fieldname] = `${field.label} is required`
    }
  }

  for (const field of fields) {
    visit(field)
  }

  return errors
}

/** First invalid field in form definition order (for focus management). */
export function getFirstInvalidFieldname(
  fields: FormField[],
  errors: Record<string, string>
): string | null {
  for (const field of fields) {
    if (errors[field.fieldname]) return field.fieldname
  }
  return null
}

export function focusFormField(fieldname: string) {
  const el =
    document.getElementById(`portal-field-${fieldname}`) ??
    document.querySelector<HTMLElement>(
      `[data-portal-field="${fieldname}"] button, [data-portal-field="${fieldname}"] input, [data-portal-field="${fieldname}"] textarea`
    )
  if (!el) return
  el.focus()
  el.scrollIntoView({ block: "center", behavior: "smooth" })
}
