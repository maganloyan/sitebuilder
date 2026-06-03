


import frappe
from frappe import _

@frappe.whitelist()
def get_doctype_fields(doctype):
    """
    Fetch fields and meta of the specified doctype.
    Returns issingle flag so the frontend can handle single doctypes correctly.
    """
    try:
        meta = frappe.get_meta(doctype)

        fields = []
        for field in meta.fields:
            fields.append({
                "fieldname": field.fieldname,
                "label": field.label,
                "fieldtype": field.fieldtype,
                "in_list_view": field.in_list_view,
                "in_standard_filter": field.in_standard_filter,
                "reqd": field.reqd,
                "options": field.options if field.options else "",
                "default": field.default if field.default else "",
                "hidden": field.hidden,
                "read_only": field.read_only,
                "depends_on": field.depends_on if field.depends_on else "",
                "display_field": field.display_field if hasattr(field, "display_field") else "",
            })

        return {
            "doctype": doctype,
            "issingle": meta.issingle,
            "fields": fields,
        }

    except Exception as e:
        frappe.throw(_("Error fetching fields: {0}").format(str(e)))






@frappe.whitelist()
def get_list(doctype, filters=None, fields="*", limit_page_length=1000, limit_start=0):
    """Fetch a list of documents from any Doctype."""
    filters = frappe.parse_json(filters) if filters else {}

    docs = frappe.get_all(
        doctype, 
        fields=fields.split(",") if fields != "*" else ["*"], 
        filters=filters,
        limit_page_length=int(limit_page_length), 
        limit_start=int(limit_start)
    )
    return docs

@frappe.whitelist()
def get_doc(doctype, name):
    """Fetch a specific document by name (ID)."""
    doc = frappe.get_doc(doctype, name)
    return doc.as_dict()

@frappe.whitelist()
def create_doc(doctype, data):
    """Create a new document in any Doctype."""
    data = frappe.parse_json(data)
    doc = frappe.get_doc({"doctype": doctype, **data})
    doc.insert()
    frappe.db.commit()
    return {"message": "Document created", "name": doc.name}

@frappe.whitelist()
def update_doc(doctype, name, data):
    """Update an existing document."""
    data = frappe.parse_json(data)
    doc = frappe.get_doc(doctype, name)
    
    for key, value in data.items():
        setattr(doc, key, value)

    doc.save()
    frappe.db.commit()
    return {"message": "Document updated", "name": doc.name}

@frappe.whitelist()
def delete_doc(doctype, name):
    """Delete a document from any Doctype."""
    frappe.delete_doc(doctype, name, force=True)
    frappe.db.commit()
    return {"message": f"{doctype} {name} deleted"}


@frappe.whitelist()
def get_count(doctype, filters=None):
    """Fetch the total count of documents in any Doctype."""
    filters = frappe.parse_json(filters) if filters else {}

    count = frappe.db.count(doctype, filters)
    return {"count": count}


@frappe.whitelist()
def search_doctypes(query):
    """Search Doctypes based on the query provided."""
    # Fetch all doctypes that start with the search query (case insensitive)
    doctypes = frappe.get_all("DocType", filters={"name": ["like", f"{query}%"]}, fields=["name"])
    
    # Return the result as a list of doctype names
    return {"message": [doctype.name for doctype in doctypes]}

import frappe
from frappe.desk.search import search_widget

@frappe.whitelist()
def search_doctype(query):
    """
    Search for doctypes based on the query string
    Returns a list of doctypes that match the search criteria
    """
    doctypes = frappe.get_all(
        "DocType",
        filters={
            "name": ("like", f"{query}%"),
            "istable": 0,
            "issingle": 0,
            "module": "Sitebuilder"
        },
        fields=["name", "module"],
        limit=10
    )
    
    return [
        {
            "name": d.name,
            "label": frappe.get_meta(d.name).title or d.name
        }
        for d in doctypes
    ]