// Copyright (c) 2025, Alool Technologies and contributors
// For license information, please see license.txt


frappe.ui.form.on("Work Panel", {
 
    onload: function (frm) {
      frm.set_query("web_template", "page_blocks", function () {
        return {
          filters: {
            type: ["in", ["Section", "Component"]],
          },
        };
      });
   
    },
    validate: function (frm) {
      if (frm.doc.label && !frm.doc.route) {
        frm.set_value("route", frappe.scrub(frm.doc.label, "-"));
        frm.set_value("title", frm.doc.label);
      }
    },
    refresh: function (frm) {
     
      // Add "Go To" button for Page Component
      frm.add_custom_button( __("Site Page"), function () {
          frappe.set_route("List", "Site Page");},  __("Go To")  );
      frm.add_custom_button( __("Site Block"), function () {
          frappe.set_route("List", "Site Block");},  __("Go To")  );
      
  
      // Add "Go To" button for Web Settings
      frm.add_custom_button( __("Site Settings"), function () {
          frappe.set_route("Form", "Site Settings"); }, __("Go To") );
  
      // Add "Go To" button for Front Page
      frm.add_custom_button( __("Blog Post"), function () {
          frappe.set_route("List", "Blog Post"); }, __("Go To") );
    },


    set_meta_tags(frm) {
      frappe.utils.set_meta_tag(frm.doc.route);
    },
  });
  
  frappe.ui.form.on("Work Panel Item", {
    web_template: function (frm, cdt, cdn) {
      // Call generate_fieldname when the label changes
      generate_fieldlabel(frm, cdt, cdn);
    },
  
    edit_values(frm, cdt, cdn) {
      let row = locals[cdt][cdn]; // Get the current row from the child table
      let template_name;
      let isSection = row.type === "Section"; // Check if the type is Section
      let isDefault = row.type === "Default"; // Check if the type is Default
  
      if (isSection) {
        template_name = row.section; // Use section field if type is Section
      } else if (isDefault) {
        // If type is Default, ensure that either section or web_template is filled but not both
        if (row.section && row.web_template) {
          frappe.msgprint(
            "Error: Both 'Section' and 'Web Template' are filled. Please provide only one."
          );
          return;
        } else if (!row.section && !row.web_template) {
          frappe.msgprint(
            "Error: Please provide either 'Section' or 'Web Template' when type is Default."
          );
          return;
        }
        template_name = row.section || row.web_template; // Use the filled field
      } else {
        template_name = row.web_template; // Use web_template field if type is Page Block
      }
  
      if (!template_name) {
        frappe.msgprint("Please select a template before editing values.");
        return;
      }
  
      let values = JSON.parse(row.web_template_values || "{}");
  
      open_web_template_values_editor(template_name, values, isSection).then(
        (new_values) => {
          frappe.model.set_value(
            cdt,
            cdn,
            "web_template_values",
            JSON.stringify(new_values)
          );
        }
      );
    },
  });
  
  function generate_fieldlabel(frm, cdt, cdn) {
    // Get the current row from the child table
    let row = frappe.get_doc(cdt, cdn);
  
    if (row.web_template) {
      // Convert the web_template to capitalize first letter of each word
      row.label = row.web_template
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
  
      // Update the fieldname in the child table row
      frm.refresh_field("web_template");
    }
  }
  
  function open_web_template_values_editor(
    template_name,
    existing_values,
    isSection
  ) {
    return new Promise((resolve) => {
      // Fetch the appropriate doctype based on whether it's a Section or Page Block
      const doctype = isSection ? "Web Template" : "Site Block";
  
      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: doctype,
          name: template_name,
        },
        callback: function (r) {
          if (r.message) {
            let template = r.message;
            let fields = [];
            let tableFields = [];
            let isInsideTableBreak = false;
  
            // Loop through fields and detect Table Break
            template.fields.forEach((field) => {
              let defaultValue = existing_values[field.fieldname] || "";
  
              // Handle Table Break
              if (field.fieldtype === "Table Break") {
                isInsideTableBreak = true;
                fields.push({
                  fieldtype: "Table",
                  label: field.label || "Table",
                  fieldname: field.fieldname || "table_field",
                  data: existing_values[field.fieldname] || [], // Pre-populate table rows with existing values
                  fields: [], // We will populate this with the table columns
                });
              } else if (isInsideTableBreak) {
                // If inside Table Break, treat as table columns
                tableFields.push({
                  label: field.label,
                  fieldname: field.fieldname,
                  fieldtype: field.fieldtype || "Data", // Default to 'Data' if not defined
                  options: field.options || "",
                  reqd: field.reqd || 0,
                  in_list_view: field.in_list_view || 1, // Show this field in list view of the table
                });
              } else {
                // Handle fieldtypes Select, Link, and Markdown Editor with Text Editor option
                let fieldConfig = {
                  label: field.label,
                  fieldname: field.fieldname,
                  fieldtype: field.fieldtype || "Data", // Default to 'Data' if not defined
                  default: defaultValue,
                };
                // Handle Attach fieldtype (for file uploads)
                if (field.fieldtype === "Attach") {
                  fieldConfig.fieldtype = "Attach";
                  fieldConfig.default = defaultValue; // Pre-fill if a file is already attached
                }
  
                // Handle Select fieldtype
                if (field.fieldtype === "Select" && field.options) {
                  fieldConfig.options = field.options.split("\n"); // Convert options to array
                }
  
                // Handle Link fieldtype
                if (field.fieldtype === "Link" && field.options) {
                  fieldConfig.options = field.options; // Linked to another doctype
                }
  
                // Handle Markdown Editor as Text Editor if options specify 'Text Editor'
                if (
                  field.fieldtype === "Markdown Editor" &&
                  field.options === "Text Editor"
                ) {
                  fieldConfig.fieldtype = "Text Editor"; // Render as a rich text editor
                }
  
                // Add the field to the dialog fields array
                fields.push(fieldConfig);
              }
            });
  
            // Now handle adding the columns to the Table fields
            fields.forEach((field) => {
              if (field.fieldtype === "Table") {
                field.fields = tableFields; // Add columns to the table
              }
            });
  
            // Create the dialog
            let dialog = new frappe.ui.Dialog({
              title: `Edit Values for ${template_name}`,
              fields: fields,
              primary_action_label: "Save",
              primary_action: function (data) {
                dialog.hide();
                resolve(data);
              },
            });
  
            // Show the dialog
            dialog.show();
          }
        },
      });
    });
  }
  


frappe.ui.form.on('Work Panel', {
  onload: function(frm) {

      // frm.ignore_doctypes_on_cancel_all=["Purchase Request","Request for Quotation", "Purchase Order"];

      if (frm.is_new() && frm.doc.creation_type =="Indirect") {
          addReferenceDocsChild(frm);

          frm.clear_table('fields');
          // frm.clear_table('references');


          function addReferenceDocsChild(frm) {
              // Fetch data from the referenced doctype
              frappe.call({
                  method: "sitebuilder.sitebuilder.utils.utils_get_referenced_doc",
                  args: {
                      doctype_name: frm.doc.doctype_name,
                      reference_name: frm.doc.reference_name
                  },
                  callback: function(response) {
                      console.log("API response:", response);
                      // Check if response contains data
                      let data = response.message;
                      if (data) {
                          // Handle additional fields
                          if (data.head_data) {

                              frm.set_value({
                                 title: data.head_data.title,
                                 route: data.head_data.route,


                              }) }

                          if (data.tables && data.tables.page_blocks) {
                              $.each(data.tables.page_blocks, function(_i, e) {
                                  let item = frm.add_child("page_blocks");
                                  item.web_template = e.web_template;
                                  item.web_template_values = e.web_template_values;
                                  // item.fieldtype = e.fieldtype;
                                  // item.options = e.options;
                                  // item.default = e.default;
                                  
                              });
                              frm.refresh_field('page_blocks');
                          }


                          if (!frm.is_new()) {
                              frm.save();
                              frm.reload();
                          }

                         



                      } else {
                          console.log("No data found");
                      }
                  }
              });
          }
      }
  }
  });
