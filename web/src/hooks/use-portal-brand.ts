import { useFrappeGetDoc } from "frappe-react-sdk"

export interface PortalBrand {
  appName: string
  appLogoUrl?: string
  isLoading: boolean
}

/** White-label portal chrome from Site Settings (single doc). */
export function usePortalBrand(): PortalBrand {
  const { data, isLoading } = useFrappeGetDoc("Site Settings", "Site Settings")

  const appName = (data?.app_name as string | undefined)?.trim() || "Portal"
  const logo = data?.app_logo as string | undefined

  return {
    appName,
    appLogoUrl: logo?.trim() ? logo : undefined,
    isLoading,
  }
}
