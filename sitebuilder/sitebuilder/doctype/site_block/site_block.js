// Copyright (c) 2025, Alool Technologies and contributors
// For license information, please see license.txt


frappe.ui.form.on("Site Block", {
    title: function (frm) {
      generate_fieldlabel(frm);
    },
  
    refresh: function (frm) {
      generate_fieldlabel(frm);
  
      // Add "Go To" button for Front Page
      frm.add_custom_button(
        __("Site Page"),
        function () {
          frappe.set_route("List", "Site Page");
        },
        __("Go To")
      );
     
  
      // Add "Go To" button for Page Component
      frm.add_custom_button(
        __("Blog Post"),
        function () {
          frappe.set_route("List", "Blog Post");
        },
        __("Go To")
      );
  
      // Add "Go To" button for Web Settings
      frm.add_custom_button(
        __("Site Settings"),
        function () {
          frappe.set_route("Form", "Site Settings");
        },
        __("Go To")
      );
  
      // Button to generate the component
      frm.add_custom_button(
        __("Generate Template"),
        function () {
          let folder_name = ""; // Initialize folder_name variable
  
          // Determine folder name based on 'generate' field
          if (frm.doc.generate === "Default") {
            folder_name = "blocks"; // Use 'blocks' for Default
          } else if (frm.doc.generate === "Page") {
            folder_name = frm.doc.page || ""; // Use the 'page' field for Page
          } else if (frm.doc.generate === "Folder Name") {
            folder_name = frm.doc.folder_name || ""; // Use the 'folder_name' field for Folder Name
          }
  
          // Check if folder_name is set, show an error if not
          if (!folder_name) {
            frappe.msgprint(
              __(
                "Error: Folder name could not be determined. Please ensure the appropriate field is filled."
              )
            );
            return;
          }
  
          frappe.call({
            method:
              "sitebuilder.sitebuilder.block_generator.generate_page_component_template",
            args: {
              docname: frm.doc.name,
              doctype: frm.doc.doctype,
              folder_name: folder_name, // Pass the determined folder name
            },
            // callback: function(r) {
            //     frappe.msgprint(__('Component generated successfully.'));
            // }
          });
        },
        __("Generate")
      );
  
      // Button to generate template fields
      frm.add_custom_button(
        __("Generate Blank Fields"),
        function () {
          let folder_name = ""; // Initialize folder_name variable
  
          // Determine folder name based on 'generate' field
          if (frm.doc.generate === "Default") {
            folder_name = "blocks"; // Use 'blocks' for Default
          } else if (frm.doc.generate === "Page") {
            folder_name = frm.doc.page || ""; // Use the 'page' field for Page
          } else if (frm.doc.generate === "Folder Name") {
            folder_name = frm.doc.folder_name || ""; // Use the 'folder_name' field for Folder Name
          }
  
          // Check if folder_name is set, show an error if not
          if (!folder_name) {
            frappe.msgprint(
              __(
                "Error: Folder name could not be determined. Please ensure the appropriate field is filled."
              )
            );
            return;
          }
  
          // Make the server call to generate the frontend component
          frappe.call({
            method:
              "sitebuilder.sitebuilder.block_generator.generate_frontend_component",
            args: {
              docname: frm.doc.name,
              doctype: frm.doc.doctype,
              folder_name: folder_name, // Pass the determined folder name
            },
            // callback: function(r) {
            //     frappe.msgprint(__('Component generated successfully.'));
            // }
          });
        },
        __("Generate")
      );
    },
  });
  
  frappe.ui.form.on("Site Block Field", {
    label: function (frm, cdt, cdn) {
      // Call generate_fieldname when the label changes
      generate_fieldname(frm, cdt, cdn);
    },
  });
  
  function generate_fieldname(frm, cdt, cdn) {
    // Get the current row from the child table
    let row = frappe.get_doc(cdt, cdn);
  
    if (row.label) {
      // Convert the label to lowercase and replace spaces with underscores
      row.fieldname = row.label
        .toLowerCase() // Convert to lowercase
        .replace(/\s+/g, "_"); // Replace spaces with underscores
  
      // Update the fieldname in the child table row
      frm.refresh_field("fields");
    }
  }
  function generate_fieldlabel(frm) {
    if (frm.doc.title) {
      // Convert the title to capitalize first letter of each word
      frm.doc.label = frm.doc.title
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
  
      frm.refresh_field("label");
    }
  }
  