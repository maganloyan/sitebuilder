import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extract a user-facing message from a frappe-react-sdk / Axios error. */
export function getFrappeErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null
  const err = error as {
    message?: string
    response?: { data?: { _server_messages?: string; message?: string } }
  }
  const raw = err.response?.data?._server_messages
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as string[]
      const first = parsed[0]
      if (first) {
        const inner = JSON.parse(first) as { message?: string }
        if (inner.message) return inner.message.replace(/<[^>]+>/g, "")
      }
    } catch {
      /* fall through */
    }
  }
  return err.response?.data?.message ?? err.message ?? null
}

export function getInitials(str: string): string {
  if (typeof str !== "string" || !str.trim()) return "?"
  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  )
}
