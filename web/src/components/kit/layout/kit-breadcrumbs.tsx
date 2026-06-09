import { ChevronRight } from "lucide-react"
import { Fragment } from "react"
import { Link } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export interface BreadcrumbItemConfig {
  label: string
  href?: string
}

export function KitBreadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItemConfig[]
  className?: string
}) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <Fragment key={`${i}-${item.href ?? ""}-${item.label}`}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <Link
                    to={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                )}
              </BreadcrumbItem>
              {!isLast ? (
                <BreadcrumbSeparator>
                  <ChevronRight />
                </BreadcrumbSeparator>
              ) : null}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
