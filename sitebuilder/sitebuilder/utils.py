
import frappe
from frappe import _




@frappe.whitelist()
def utils_get_referenced_doc(doctype_name, reference_name):
    try:
        doc = frappe.get_doc(doctype_name, reference_name)

        data = {
            "head_data": {},
            "tables": {}
        }

        for field in frappe.get_meta(doctype_name).fields:
            fieldname = field.fieldname

            if field.fieldtype == "Table":
                data["tables"][fieldname] = doc.get(fieldname)
            elif fieldname in ["name", "doctype"]:
                continue
            else:
                data["head_data"][fieldname] = doc.get(fieldname)

        return data

    except Exception as e:
        frappe.log_error(message=f"Error fetching referenced doctype details: {str(e)}", title="Fetch Doctype Error")
        frappe.throw(_("Error fetching referenced doctype details. Please try again."))


# @frappe.whitelist()
# def utils_get_referenced_doc(doctype_name, reference_name):
#     try:
#         # Fetch the document based on doctype_name and reference_name
#         doc = frappe.get_doc(doctype_name, reference_name)

#         # Initialize a dictionary to hold items and head data
#         data = {
#             "head_data": {},
#             "tables": {}
#         }

#         # Iterate over all fields of the fetched document's metadata
#         for field in frappe.get_meta(doctype_name).fields:
#             fieldname = field.fieldname

#             # Check if the field is a table
#             if field.fieldtype == "Table":
#                 # Add the table data to the tables dictionary
#                 data["tables"][fieldname] = doc.get(fieldname)
#             elif fieldname in ["name", "doctype",]:
#                 # Skip fields like 'name' and 'doctype'
#                 continue
#             else:
#                 # Add field to head_data
#                 data["head_data"][fieldname] = doc.get(fieldname)

#         # Return fetched data including head data and tables
#         return data

#     except Exception as e:
#         frappe.log_error(f"Error fetching referenced doctype details: {str(e)}", title="Fetch Doctype Error")
#         frappe.throw(_("Error fetching referenced doctype details. Please try again."))

@frappe.whitelist()
def utils_get_referenced_doctype(doctype_name, reference_name):
    try:
        # Fetch the document based on doctype_name and reference_name
        doc = frappe.get_doc(doctype_name, reference_name)

        # Initialize lists to hold items and head data
        items_data = []
        head_data = {}

        # Iterate over all fields of the fetched document's metadata
        for field in frappe.get_meta(doctype_name).fields:
            fieldname = field.fieldname
            if fieldname == "items":
                # Process items table
                items_data = doc.get("items")
            elif fieldname in ["name", "doctype"]:
                # Skip fields like 'name' and 'doctype'
                continue
            else:
                # Add field to head_data
                head_data[fieldname] = doc.get(fieldname)

        # Return fetched data including items and head data
        return {
            "items": items_data,
            "head_data": head_data
        }

    except Exception as e:
        frappe.log_error(f"Error fetching referenced doctype details: {str(e)}", title="Fetch Doctype Error")
        frappe.throw(_("Error fetching referenced doctype details. Please try again."))