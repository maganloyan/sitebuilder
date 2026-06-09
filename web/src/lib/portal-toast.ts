import { toast as sonner } from "sonner"

/** Unified portal toasts (Sonner). Drop-in for former react-hot-toast call sites. */
const portalToast = {
  success: (message: string) => sonner.success(message),
  error: (message: string) => sonner.error(message),
  loading: (message: string) => sonner.loading(message),
  dismiss: (id?: string | number) => sonner.dismiss(id),
}

export default portalToast
export { sonner as toast }
