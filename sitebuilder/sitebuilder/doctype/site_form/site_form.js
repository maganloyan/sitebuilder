// Copyright (c) 2025, Alool Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on("Site Form", {
	refresh(frm) {



      // Button to generate template fields
      frm.add_custom_button(
        __("Generate Form"),
        function () {
        //   let folder_name = ""; // Initialize folder_name variable
  
        //   // Determine folder name based on 'generate' field
        //   if (frm.doc.generate === "Default") {
        //     folder_name = "blocks"; // Use 'blocks' for Default
        //   } else if (frm.doc.generate === "Page") {
        //     folder_name = frm.doc.page || ""; // Use the 'page' field for Page
        //   } else if (frm.doc.generate === "Folder Name") {
        //     folder_name = frm.doc.folder_name || ""; // Use the 'folder_name' field for Folder Name
        //   }
  
        //   // Check if folder_name is set, show an error if not
        //   if (!folder_name) {
        //     frappe.msgprint(
        //       __(
        //         "Error: Folder name could not be determined. Please ensure the appropriate field is filled."
        //       )
        //     );
        //     return;
        //   }
  
          // Make the server call to generate the frontend component
          frappe.call({
            method:
              "sitebuilder.sitebuilder.form_builder.generate_form",
            args: {
              docname: frm.doc.name,
              doctype: frm.doc.doctype,
              folder_name: "tests", // Pass the determined folder name
            },
            // callback: function(r) {
            //     frappe.msgprint(__('Component generated successfully.'));
            // }
          });
        },
        // __("Generate")
      );
	},
});
