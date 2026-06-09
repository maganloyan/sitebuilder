import { MoreVertical, Printer, Trash2, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFrappeDeleteDoc } from "frappe-react-sdk";
import toast from "@/lib/portal-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface MenuActionsProps {
  doctype: string;
  docname?: string;
  onDelete?: () => void;
  isNewDoc?: boolean;
  extraMenuItems?: React.ReactNode;
}

export default function MenuActions({ doctype, docname, onDelete, isNewDoc = false, extraMenuItems }: MenuActionsProps) {
  const navigate = useNavigate();
  const { deleteDoc, loading: isDeleting } = useFrappeDeleteDoc();

  const handleDelete = async () => {
    if (!docname || isNewDoc) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete this ${doctype}?`);
    if (!confirmDelete) return;

    try {
      await deleteDoc(doctype, docname);
      toast.success(`${doctype} deleted successfully`);
      onDelete?.();
      // Navigate back to list view
      navigate(`/portal/app/${doctype.toLowerCase().replace(/\s+/g, '-')}`);
    } catch (error) {
      toast.error(`Failed to delete ${doctype}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePrint = () => {
    if (!docname || isNewDoc) return;
    window.open(`/api/method/frappe.utils.print_format.download_pdf?doctype=${doctype}&name=${docname}`, '_blank');
  };

  const handleExport = () => {
    if (!docname || isNewDoc) return;
    window.open(`/api/method/frappe.desk.form.utils.export_doc?doctype=${doctype}&name=${docname}`, '_blank');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {extraMenuItems}
        {!isNewDoc && (
          <>
            <DropdownMenuItem
              onClick={handlePrint}
              className="cursor-pointer"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExport}
              className="cursor-pointer"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-destructive focus:text-destructive"
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}