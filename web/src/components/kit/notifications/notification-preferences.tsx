import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { NotificationPreference } from "@/types/notification-preference"

export interface NotificationPreferencesProps {
  preferences: NotificationPreference[]
  onChange?: (id: string, channel: "email" | "inApp", value: boolean) => void
}

export function NotificationPreferences({
  preferences,
  onChange,
}: NotificationPreferencesProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Notification</TableHead>
          <TableHead className="w-24 text-center">Email</TableHead>
          <TableHead className="w-24 text-center">In-app</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {preferences.map((pref) => (
          <TableRow key={pref.id}>
            <TableCell>
              <div className="grid gap-0.5">
                <Label className="font-medium">{pref.label}</Label>
                {pref.description ? (
                  <p className="text-muted-foreground text-xs">{pref.description}</p>
                ) : null}
              </div>
            </TableCell>
            <TableCell className="text-center">
              <Switch
                checked={pref.email}
                onCheckedChange={(v) => onChange?.(pref.id, "email", v)}
                aria-label={`${pref.label} email`}
              />
            </TableCell>
            <TableCell className="text-center">
              <Switch
                checked={pref.inApp}
                onCheckedChange={(v) => onChange?.(pref.id, "inApp", v)}
                aria-label={`${pref.label} in-app`}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
