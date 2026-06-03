import { useFrappeCreateDoc, useFrappeUpdateDoc } from "frappe-react-sdk";

interface SaveDocProps {
  doctype: string;
  doc: Record<string, any>;
  isUpdate?: boolean;
}

export const useFrappeSaveDoc = () => {
  const { createDoc, loading: creating, error: createError } = useFrappeCreateDoc();
  const { updateDoc, loading: updating, error: updateError } = useFrappeUpdateDoc();

  const saveDoc = async ({ doctype, doc, isUpdate = false }: SaveDocProps) => {
    try {
      if (isUpdate && doc.name) {
        // Update existing document
        const updatedDoc = await updateDoc(doctype, doc.name, doc);
        return { success: true, data: updatedDoc };
      } else {
        // Create a new document
        const newDoc = await createDoc(doctype, doc);
        return { success: true, data: newDoc };
      }
    } catch (error) {
      return { success: false, error };
    }
  };

  return { saveDoc, creating, updating, createError, updateError };
};
