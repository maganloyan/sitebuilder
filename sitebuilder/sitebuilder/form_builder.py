import frappe
from frappe import _
from pathlib import Path


@frappe.whitelist()
def generate_form(docname, doctype, folder_name="forms"):
    # Fetch the full document using the document name
    doc = frappe.get_doc(doctype, docname)

    # Determine paths
    app_name = "taywaan"  # Assuming single app
    app_path: Path = Path("../apps") / app_name
    components_directory = app_path / "web" / "src" / "components" / folder_name

    # Generate PascalCase component name
    component_name = ''.join(word.capitalize() for word in doc.name.split())
    filename = f"{component_name}.tsx"
    full_path = components_directory / filename

    # Build the fields array as a string
    fields = []
    child_tables = []
    current_table = None
    table_fields = []

    for field in doc.fields:
        field_str = []
        
        # Handle Table Break fields
        if field.fieldtype == "Table Break":
            if current_table:
                # Add the previous table to child_tables
                child_tables.append({
                    "fieldname": current_table,
                    "fields": table_fields
                })
            # Start a new table
            current_table = field.fieldname
            table_fields = []
            continue
        
        # Build field properties
        field_str.append(f'label: "{field.label}"')
        field_str.append(f'fieldname: "{field.fieldname}"')
        field_str.append(f'type: "{field.fieldtype}"')
        
        if getattr(field, 'reqd', None):
            field_str.append(f'mandatory: {str(field.reqd).lower()}')
        if getattr(field, 'readonly', None):
            field_str.append(f'readOnly: {field.readonly}')
        if getattr(field, 'hidden', None):
            field_str.append(f'hidden: {field.hidden}')
        if getattr(field, 'depends_on', None):
            field_str.append(f'dependsOn: "{field.depends_on}"')
        if getattr(field, 'options', None):
            field_str.append(f'options: "{field.options}"')
        if getattr(field, 'default', None):
            field_str.append(f'default: "{field.default}"')
        if getattr(field, 'display_field', None):
            field_str.append(f'display_field: "{field.display_field}"')

        # Add field to appropriate list
        field_obj = "{" + ", ".join(field_str) + "}"
        if current_table:
            table_fields.append(field_obj)
        else:
            fields.append("        " + field_obj)

    # Add the last table if exists
    if current_table and table_fields:
        child_tables.append({
            "fieldname": current_table,
            "fields": table_fields
        })

    # Format child tables if they exist
    child_tables_str = ""
    if child_tables:
        tables_content = []
        for table in child_tables:
            fields_str = ",\n            ".join(table["fields"])
            table_str = (
                "        {\n"
                f'          fieldname: "{table["fieldname"]}",\n'
                "          fields: [\n"
                f"            {fields_str}\n"
                "          ]\n"
                "        }"
            )
            tables_content.append(table_str)
        
        tables_joined = ",\n".join(tables_content)
        child_tables_str = (
            "\n      childTables={[\n"
            f"{tables_joined}\n"
            "      ]}"
        )

    # Join fields with proper line breaks
    fields_joined = ",\n".join(fields)

    # Create the component content
    content = (
        'import React from "react";\n'
        'import DynamicForm from "@/components/tests/DynamicForm";\n'
        '\n'
        f'const {component_name} = () => {{\n'
        '  return (\n'
        '    <DynamicForm\n'
        f'      doctype="{doc.doctype_name}"\n'
        '      fields={[\n'
        f'{fields_joined}\n'
        '      ]}'
        f'{child_tables_str}\n'
        '    />\n'
        '  );\n'
        '};\n'
        '\n'
        f'export default {component_name};\n'
    )

    # Ensure the directory exists
    components_directory.mkdir(parents=True, exist_ok=True)

    # Write the file
    with full_path.open("w", encoding='utf-8') as f:
        f.write(content)

    frappe.msgprint(f"Successfully created Page component {filename} at {full_path}", alert=True)
