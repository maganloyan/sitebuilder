import { useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import { useFrappeAuth, useFrappeGetDoc } from "frappe-react-sdk"
import { Monitor, Moon, Sun } from "lucide-react"

import SetPassword from "@/auth/SetPassword"
import {
  FormSection,
  NotificationPreferences,
  SettingsLayout,
} from "@/components/kit"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { getInitials } from "@/lib/utils"
import { useTheme } from "@/lib/ThemeProvider"
import { useNotificationPreferences } from "@/hooks/use-portal-notifications"

const NAV = [
  { id: "profile", label: "Profile", href: "/portal/user/settings#profile" },
  { id: "appearance", label: "Appearance", href: "/portal/user/settings#appearance" },
  { id: "notifications", label: "Notifications", href: "/portal/user/settings#notifications" },
  { id: "security", label: "Security", href: "/portal/user/settings#security" },
] as const

type SettingsSection = (typeof NAV)[number]["id"]

function resolveSection(hash: string): SettingsSection {
  const id = hash.replace("#", "")
  if (id === "appearance" || id === "notifications" || id === "security") return id
  return "profile"
}

interface FrappeUser {
  name: string
  user_image?: string
  full_name: string
  email: string
}

function ProfileSection() {
  const { currentUser } = useFrappeAuth()
  const { data: user, isLoading } = useFrappeGetDoc<FrappeUser>("User", currentUser || "")

  if (isLoading) {
    return (
      <div className="grid max-w-md gap-4">
        <Skeleton className="size-20 rounded-lg" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!user) return <p className="text-sm text-muted-foreground">Unable to load profile.</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar className="size-20 rounded-lg">
          <AvatarImage src={user.user_image} alt={user.full_name} />
          <AvatarFallback className="rounded-lg text-lg">
            {getInitials(user.full_name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-lg">{user.full_name}</p>
          <p className="text-muted-foreground text-sm">{user.name}</p>
        </div>
      </div>
      <div className="grid max-w-md gap-4">
        <div className="grid gap-2">
          <Label htmlFor="profile-full-name">Full name</Label>
          <Input id="profile-full-name" defaultValue={user.full_name} readOnly />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" type="email" defaultValue={user.email} readOnly />
        </div>
      </div>
      <p className="text-muted-foreground text-xs max-w-md">
        Profile edits are managed in Frappe. Contact your administrator to update account details.
      </p>
    </div>
  )
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme()
  const options = [
    { id: "light" as const, label: "Light", icon: Sun },
    { id: "dark" as const, label: "Dark", icon: Moon },
    { id: "system" as const, label: "System", icon: Monitor },
  ]

  return (
    <ul className="flex max-w-md flex-col gap-2">
      {options.map(({ id, label, icon: Icon }) => (
        <li key={id}>
          <Item
            variant={theme === id ? "outline" : "muted"}
            className="cursor-pointer"
            onClick={() => setTheme(id)}
          >
            <ItemMedia variant="icon">
              <Icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{label}</ItemTitle>
              <ItemDescription>
                {id === "system" ? "Match your device preference" : `Use ${label.toLowerCase()} theme`}
              </ItemDescription>
            </ItemContent>
          </Item>
        </li>
      ))}
    </ul>
  )
}

function SecuritySection() {
  const [passwordOpen, setPasswordOpen] = useState(false)

  return (
    <>
      <div className="flex max-w-md flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          Update your portal password. You will stay signed in on this device after changing it.
        </p>
        <Button className="w-fit" onClick={() => setPasswordOpen(true)}>
          Change password
        </Button>
      </div>
      <SetPassword open={passwordOpen} onOpenChange={setPasswordOpen} />
    </>
  )
}

export function SettingsPage() {
  const { hash } = useLocation()
  const activeId = useMemo(() => resolveSection(hash), [hash])
  const {
    preferences: notificationPrefs,
    isLoading: prefsLoading,
    saving: prefsSaving,
    update: handleNotificationChange,
  } = useNotificationPreferences()

  return (
      <SettingsLayout title="Account" navItems={[...NAV]} activeId={activeId}>
        {activeId === "profile" ? (
          <FormSection title="Profile" description="Your portal identity and contact details.">
            <ProfileSection />
          </FormSection>
        ) : null}

        {activeId === "appearance" ? (
          <FormSection title="Appearance" description="Choose how the portal looks on this device.">
            <AppearanceSection />
          </FormSection>
        ) : null}

        {activeId === "notifications" ? (
          <FormSection title="Notifications" description="Email and in-app channels for portal activity.">
            {prefsLoading ? (
              <div className="grid max-w-2xl gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <NotificationPreferences
                preferences={notificationPrefs}
                onChange={(id, channel, value) => void handleNotificationChange(id, channel, value)}
              />
            )}
            <p className="text-muted-foreground text-xs">
              {prefsSaving
                ? "Saving preferences…"
                : "Synced with your Frappe Notification Settings."}
            </p>
          </FormSection>
        ) : null}

        {activeId === "security" ? (
          <FormSection title="Security" description="Password and sign-in options.">
            <SecuritySection />
          </FormSection>
        ) : null}
      </SettingsLayout>
  )
}
