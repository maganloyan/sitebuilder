import { BellIcon, CheckIcon } from "lucide-react"
import { useFrappeGetDocList, useFrappeUpdateDoc } from "frappe-react-sdk"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface NotificationLog {
  name: string
  subject: string
  email_content?: string
  creation: string
  read: number
}

type NotificationsProps = React.HTMLAttributes<HTMLDivElement>

export function Notifications({ className, ...props }: NotificationsProps) {
  const { data: notifications, isLoading, mutate } = useFrappeGetDocList<NotificationLog>(
    "Notification Log",
    {
      fields: ["name", "subject", "creation", "read"],
      filters: [["read", "=", 0]],
      orderBy: { field: "creation", order: "desc" },
      limit: 10,
    }
  )

  const { updateDoc } = useFrappeUpdateDoc()

  const markAllRead = async () => {
    if (!notifications) return
    await Promise.all(
      notifications.map((n) => updateDoc("Notification Log", n.name, { read: 1 }))
    )
    mutate()
  }

  const formatTime = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
    if (diff < 60) return `${diff} min ago`
    if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`
    return `${Math.floor(diff / 1440)} days ago`
  }

  return (
    <div className={cn("w-[380px] p-4", className)} {...props}>
      <div>
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${notifications?.length ?? 0} unread`}
        </p>
      </div>

      <div className="mt-4 grid gap-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-start py-2">
              <Skeleton className="h-2 w-2 rounded-full mt-1.5" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))
        ) : notifications?.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-muted-foreground gap-2">
            <BellIcon className="h-8 w-8 opacity-40" />
            <p className="text-sm">No unread notifications</p>
          </div>
        ) : (
          notifications?.map((n) => (
            <div key={n.name} className="grid grid-cols-[8px_1fr] items-start gap-2 py-2 border-b last:border-0">
              <span className="h-2 w-2 rounded-full bg-sky-500 mt-1.5" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-snug">{n.subject}</p>
                <p className="text-xs text-muted-foreground">{formatTime(n.creation)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications && notifications.length > 0 && (
        <div className="mt-4">
          <Button className="w-full" onClick={markAllRead}>
            <CheckIcon className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        </div>
      )}
    </div>
  )
}

export default Notifications