import os
from pathlib import Path
import frappe
from frappe import _




def get_app_paths(doctype, folder_name=None):
    """
    Fetch the app path from the Block Generation Settings.
    Returns the app name, app path, and component path if found, else returns None.
    If folder_name is not provided, it defaults to "blocks" for Page Component or "sections" for Web Template.
    """
    # Set default folder_name based on the doctype
    # if not folder_name:
    #     folder_name = "blocks" if doctype == "Page Component" else "sections"
    
    if not folder_name:
        folder_name = "blocks" if doctype == "Site Block" else "sections"

    app_name = "sahal"
    app_path: Path = Path("../apps") / app_name
    if not app_path.exists():
        print("App path does not exist - ignoring page generation")
        return
    components_directory = app_path / "web" / "src" / "components"/ folder_name

    if app_path.exists():
            return app_name, app_path, components_directory

    # If no matching app is found, return None
    frappe.msgprint("No valid app found in Block Generation Settings.")
    return None, None, None

@frappe.whitelist()
def generate_page_component_template(docname, doctype, folder_name=None):
    """
    Generate the React component based on the template field in the Page Component doctype.
    """
    try:
        # Fetch the document by name and doctype
        doc = frappe.get_doc(doctype, docname)
        

        # Fetch app paths from Block Generation Settings, passing the folder name if provided
        app_name, app_path, components_directory = get_app_paths(doctype, folder_name)

        if not app_name or not app_path:
            frappe.msgprint("App path not found in Block Generation Settings.")
            return

        # Get the template content from the Page Component
        template_content = doc.get('code')
        if not template_content:
            frappe.msgprint("No template found for the Page Component.")
            return

        # Convert the component name to a valid file name (PascalCase)
        component_name = ''.join(word.capitalize() for word in docname.split())
        filename = f"{component_name}.tsx"
        full_file_path = components_directory / filename

        # Ensure the components directory exists
        components_directory.mkdir(parents=True, exist_ok=True)

        # Write the template content to the file
        with open(full_file_path, 'w') as f:
            f.write(template_content)

        frappe.msgprint(f"Successfully created Page Template {filename} at {full_file_path}", alert=True)

    except Exception as e:
        frappe.throw(_("Error generating component: {0}").format(str(e)))



@frappe.whitelist()
def generate_frontend_component(docname, doctype, folder_name=None):
    # Fetch the full document using the document name
    doc = frappe.get_doc(doctype, docname)

    # Pass the folder_name when calling get_app_paths (defaults to 'blocks')
    app_name, app_path, components_directory = get_app_paths(doctype, folder_name)
    if not app_name or not app_path or not components_directory:
        frappe.msgprint("App path not found - ignoring component generation.")
        return

    # Convert the doc name to a standard filename (PascalCase and remove spaces)
    component_name = ''.join(word.capitalize() for word in doc.name.split())
    filename = f"{component_name}.tsx"
    full_path = components_directory / filename

    # Detect Table Break field
    table_break_field = next((field for field in doc.fields if field.fieldtype == "Table Break"), None)

    # Check if any field has custom_map_item checked and there's a Table Break field
    has_table = table_break_field is not None and any(field.custom_map_item for field in doc.fields)

    # Start building the component content
    page_content = f"""
   
    import {{ Button }} from "../ui/button";

    interface {component_name}Props {{
    """

    # Define the interface for the component props
    for field in doc.fields:
        if not field.custom_map_item and field.fieldtype != "Table Break":
            field_type = "string"  # default type for most fields
            if field.fieldtype == "Int":
                field_type = "number"
            elif field.fieldtype == "Check":
                field_type = "boolean"
            elif field.fieldtype == "Attach Image":
                field_type = "string"  # Handle images as string URLs
            page_content += f"        {field.fieldname}?: {field_type};\n"

    # Conditionally add the items interface using the Table Break field name
    if has_table:
        table_fieldname = table_break_field.fieldname  # Use the Table Break fieldname (e.g., "features")
        page_content += f"""
        {table_fieldname}?: Array<{component_name}ItemProps>;
        }}

        interface {component_name}ItemProps {{
        """
        # Add fields to the items interface (fields marked with custom_map_item)
        for field in doc.fields:
             if field.custom_map_item and field.fieldtype != "Table Break":
                field_type = "string"  # default type for most fields
                if field.fieldtype == "Int":
                    field_type = "number"
                elif field.fieldtype == "Check":
                    field_type = "boolean"
                elif field.fieldtype == "Attach Image":
                    field_type = "string"  # Image URL
                page_content += f"        {field.fieldname}?: {field_type};\n"
        page_content += f"""
        }}
        """

    else:
        # Close the component props interface if no table
        page_content += f"""
        }}
        """

    # Start the component function
    page_content += f"""
    const {component_name} = ({{ {', '.join([field.fieldname for field in doc.fields  if not field.custom_map_item and field.fieldtype != "Table Break"])}{", " + table_break_field.fieldname if has_table else ""} }}: {component_name}Props) => {{
        return (
            <div>
    """

    # Generate JSX for each regular field (non-table fields)
    for field in doc.fields:
        if not field.custom_map_item and field.fieldtype != "Table Break":
            # Check if either the fieldname or label ends with 'url' or 'URL' (case-insensitive)
            if field.fieldname.lower().endswith('url') or field.label.lower().endswith('url'):
                # Replace '_url' or 'URL' in the fieldname with '_label' to get the label field
                label_field = field.fieldname.replace('_url', '_label').replace('URL', '_label')

                # Determine the button variant based on field name
                button_variant = "outline" if "secondary" in field.fieldname.lower() else "default"

                # Add the JSX for rendering the button with the correct URL and label
                page_content += f"""
                    {{ {field.fieldname} && {label_field} && (
                        <a href={{ {field.fieldname} }}>
                            <Button variant="{button_variant}">{{ {label_field} }}</Button>
                        </a>
                    )}}
                """

            elif field.fieldtype == "Attach Image":
                # Handle image fields
                page_content += f"""
                    {{ {field.fieldname} && (
                        <div>
                            <img src={{ {field.fieldname} }} alt="{field.label}" />
                        </div>
                    )}}
                """
            else:
                # Handle all other fields
                if not field.fieldname.endswith('_label'):
                    page_content += f"""
                    {{ {field.fieldname} && (
                        <div>
                            <p>{{ {field.fieldname} }}</p>
                        </div>
                    )}}
                    """

    # Conditionally add the table rendering using the Table Break field name
    if has_table:
        page_content += generate_table_component(doc, table_break_field.fieldname)

    # Closing the component JSX
    page_content += f"""
            </div>
        );
    }}

    export default {component_name};
    """

    # Ensure the directory exists
    components_directory.mkdir(parents=True, exist_ok=True)

    # Write the file
    with full_path.open("w") as f:
        f.write(page_content)

    frappe.msgprint(f"Successfully created Page component {filename} at {full_path}", alert=True)


# Separate function to handle the table break and generate the table JSX
def generate_table_component(doc, table_fieldname):
    # Start generating the table part of the JSX
    table_content = f"""
            {{{table_fieldname} && {table_fieldname}.map((item, idx) => (
                <div key={{idx}}>
    """

    # Generate the table fields
    for field in doc.fields:
        if field.custom_map_item and field.fieldtype != "Table Break":
            if field.fieldtype == "Attach Image":
                # Handle image fields inside the table
                table_content += f"""
                    {{ item.{field.fieldname} && (
                        <div>
                            <img src={{ item.{field.fieldname} }} alt="Image" />
                        </div>
                    )}}
                """
            elif field.fieldtype == "Link" or field.fieldname.lower().endswith('url'):
                # Handle link or URL fields
                label_field = field.fieldname.replace('_url', '_label').replace('URL', '_label')
                table_content += f"""
                    {{ item.{field.fieldname} && item.{label_field} && (
                        <a href={{ item.{field.fieldname} }}>
                            <Button variant="default">{{ item.{label_field} }}</Button>
                        </a>
                    )}}
                """
            else:
                # Handle other fields inside the table
                if not field.fieldname.endswith('_label'):
                    table_content += f"""
                        {{ item.{field.fieldname} && (
                            <div>
                                <p>{{ item.{field.fieldname} }}</p>
                            </div>
                        )}}
                    """

    # Close the table JSX
    table_content += """
                </div>
            ))}
    """

    return table_content




@frappe.whitelist()
def generate_all_page_components():
    """
    Generate React components for all records in the Page Component doctype
    by calling the generate_page_component_template function, using 'blocks' as the folder.
    """
    try:
        # Fetch all records from the Page Component doctype
        page_components = frappe.get_all('Page Component', fields=['name'])

        if not page_components:
            frappe.msgprint("No Page Components found.")
            return

        for component in page_components:
            docname = component['name']

            # Call the existing function to generate each component template using the 'blocks' folder
            generate_page_component_template(docname, 'Page Component', 'blocks')

    except Exception as e:
        frappe.throw(_("Error generating components: {0}").format(str(e)))


# @frappe.whitelist()
# def generate_all_page_components(doc, method=None):
#     """
#     Fetches all Web Templates and generates frontend components for each one.
#     This can be run in the hook to generate components for all templates at once.
#     """
#     # Fetch all Web Template documents
#     web_templates = frappe.get_all('Page Component', fields=['name', 'template'])

#     # Loop through each Web Template and generate the frontend component
#     for template in web_templates:
#         # Fetch the full document for each template
#         doc = frappe.get_doc('Page Component', template.name)
#         generate_page_component_template(doc)

#     frappe.msgprint(f"Frontend components have been generated for all Web Templates.")
    
@frappe.whitelist()
def generate_page_components_for_type(type_, folder_name=None):
    """
    Generate templates for all Page Component records of the selected type.
    If a folder_name is provided, use it; otherwise, use the default folder for the type.
    """
    try:
        # Fetch all Page Component records of the selected type
        page_components = frappe.get_all('Page Component', filters={'type': type_}, fields=['name'])

        # Determine the folder name (use provided or default based on type)
        folder_name = folder_name or get_default_folder(type_)

        # Iterate over each Page Component and generate the template
        for component in page_components:
            generate_page_component_template(docname=component['name'], doctype='Page Component', folder_name=folder_name)

        frappe.msgprint(f"Generated templates for {len(page_components)} Page Component(s) of type {type_} in folder {folder_name}", alert=True)
        

    except Exception as e:
        frappe.throw(_("Error generating components: {0}").format(str(e)))


def get_default_folder(type_):
    """
    Get default folder based on the type.
    """
    default_folders = {
        "Component": "blocks",
        "Section": "sections",
        "Dashboard": "dashboard",
        "Auth": "auth",
        "Navbar": "layout",
        "Footer": "layout",
        "Data": "data"
    }
    return default_folders.get(type_, "blocks")
