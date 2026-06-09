import { FieldLegend, FieldSet } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <FieldSet className={cn("flex flex-col gap-4", className)}>
      <FieldLegend variant="label">{title}</FieldLegend>
      {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
      <div className="flex flex-col gap-4">{children}</div>
      <Separator />
    </FieldSet>
  )
}
