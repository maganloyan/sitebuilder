export interface InAppNotification {
  id: string
  title: string
  body: string
  read: boolean
  createdAt: string
  href?: string
  type?: string
  documentType?: string
  documentName?: string
}
