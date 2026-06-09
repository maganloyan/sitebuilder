import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  MoreHorizontal, Pencil, Eye, Printer, FileDown,
  UserPlus, UserMinus, Workflow, Tag, Trash2,
} from "lucide-react"
import { useFrappeDeleteDoc, useFrappePostCall } from "frappe-react-sdk"
import toast from "@/lib/portal-toast"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { type ListActionType, DEFAULT_LIST_ACTIONS } from "@/lib/doctypeTypes"

interface ListActionsProps {
  doctype: string
  docname: string
  /** Called after a successful delete so the parent can refresh the list */
  onDelete?: () => void
  /** Subset of actions to show. Defaults to all. */
  actions?: ListActionType[]
  /** Base path for edit/view navigation. Defaults to current path segment. */
  basePath?: string
  /** Extra dropdown items rendered before the standard actions. */
  extraMenuItems?: React.ReactNode
}

// ─── Assign Dialog ───────────────────────────────────────────────────────────

function AssignDialog({
  open, onClose, doctype, docname,
}: { open: boolean; onClose: () => void; doctype: string; docname: string }) {
  const [assignTo, setAssignTo] = useState("")
  const [description, setDescription] = useState("")
  const { call, loading } = useFrappePostCall("frappe.desk.form.assign_to.add")

  const handleAssign = async () => {
    if (!assignTo.trim()) return
    try {
      await call({ doctype, name: docname, assign_to: [assignTo.trim()], description })
      toast.success(`Assigned to ${assignTo}`)
      setAssignTo("")
      setDescription("")
      onClose()
    } catch {
      toast.error("Assignment failed")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign {docname}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <Label>Assign to (email)</Label>
            <Input
              placeholder="user@example.com"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Description (optional)</Label>
            <Input
              placeholder="Add a note..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAssign} disabled={loading || !assignTo.trim()}>
            {loading ? "Assigning…" : "Assign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Add Tags Dialog ─────────────────────────────────────────────────────────

function AddTagsDialog({
  open, onClose, doctype, docname,
}: { open: boolean; onClose: () => void; doctype: string; docname: string }) {
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const { call, loading } = useFrappePostCall("frappe.desk.doctype.tag.tag.add_tag")

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag])
    setTagInput("")
  }

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag))

  const handleSave = async () => {
    if (!tags.length) return
    try {
      await Promise.all(
        tags.map((tag) => call({ dt: doctype, dn: docname, tag }))
      )
      toast.success("Tags added")
      setTags([])
      onClose()
    } catch {
      toast.error("Failed to add tags")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Tags to {docname}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="flex gap-2">
            <Input
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
            />
            <Button variant="outline" onClick={addTag} disabled={!tagInput.trim()}>
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </Badge>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !tags.length}>
            {loading ? "Saving…" : "Save Tags"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ListActions({
  doctype,
  docname,
  onDelete,
  actions,
  basePath,
  extraMenuItems,
}: ListActionsProps) {
  const navigate = useNavigate()
  const { deleteDoc, loading: isDeleting } = useFrappeDeleteDoc()
  const { call: applyRule } = useFrappePostCall(
    "frappe.automation.doctype.assignment_rule.assignment_rule.apply"
  )

  const [assignOpen, setAssignOpen] = useState(false)
  const [tagsOpen, setTagsOpen] = useState(false)

  const allowed = actions ?? DEFAULT_LIST_ACTIONS.map((a) => a.type)
  const show = (type: ListActionType) => allowed.includes(type)

  const slug = doctype.toLowerCase().replace(/\s+/g, "-")
  const base = basePath ?? `/portal/app/${slug}`

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${docname}"?`)) return
    try {
      await deleteDoc(doctype, docname)
      toast.success("Deleted")
      onDelete?.()
    } catch {
      toast.error("Delete failed")
    }
  }

  const handlePrint = () =>
    window.open(
      `/api/method/frappe.utils.print_format.download_pdf?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(docname)}`,
      "_blank"
    )

  const handleExport = () =>
    window.open(
      `/api/method/frappe.desk.form.utils.export_doc?doctype=${encodeURIComponent(doctype)}&name=${encodeURIComponent(docname)}`,
      "_blank"
    )

  const handleClearAssignment = async () => {
    try {
      await useFrappePostCall("frappe.desk.form.assign_to.remove")
      toast.success("Assignment cleared")
    } catch {
      toast.error("Failed to clear assignment")
    }
  }

  const handleApplyRule = async () => {
    try {
      await applyRule({ doctype, name: docname })
      toast.success("Assignment rule applied")
    } catch {
      toast.error("Failed to apply assignment rule")
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
            {docname}
          </DropdownMenuLabel>

          {extraMenuItems && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>{extraMenuItems}</DropdownMenuGroup>
            </>
          )}

          {/* Navigation */}
          {(show("edit") || show("view")) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {show("edit") && (
                  <DropdownMenuItem onClick={() => navigate(`${base}/view/${docname}`)}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                  </DropdownMenuItem>
                )}
                {show("view") && (
                  <DropdownMenuItem onClick={() => navigate(`${base}/view/${docname}`)}>
                    <Eye className="mr-2 h-4 w-4" /> View
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </>
          )}

          {/* Document actions */}
          {(show("print") || show("export")) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {show("print") && (
                  <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Print
                  </DropdownMenuItem>
                )}
                {show("export") && (
                  <DropdownMenuItem onClick={handleExport}>
                    <FileDown className="mr-2 h-4 w-4" /> Export
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </>
          )}

          {/* Assignment & tags */}
          {(show("assign") || show("clear_assignment") || show("apply_assignment_rule") || show("add_tags")) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {show("assign") && (
                  <DropdownMenuItem onClick={() => setAssignOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" /> Assign
                  </DropdownMenuItem>
                )}
                {show("clear_assignment") && (
                  <DropdownMenuItem onClick={handleClearAssignment}>
                    <UserMinus className="mr-2 h-4 w-4" /> Clear Assignment
                  </DropdownMenuItem>
                )}
                {show("apply_assignment_rule") && (
                  <DropdownMenuItem onClick={handleApplyRule}>
                    <Workflow className="mr-2 h-4 w-4" /> Apply Assignment Rule
                  </DropdownMenuItem>
                )}
                {show("add_tags") && (
                  <DropdownMenuItem onClick={() => setTagsOpen(true)}>
                    <Tag className="mr-2 h-4 w-4" /> Add Tags
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </>
          )}

          {/* Danger zone */}
          {show("delete") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isDeleting ? "Deleting…" : "Delete"}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AssignDialog
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        doctype={doctype}
        docname={docname}
      />
      <AddTagsDialog
        open={tagsOpen}
        onClose={() => setTagsOpen(false)}
        doctype={doctype}
        docname={docname}
      />
    </>
  )
}