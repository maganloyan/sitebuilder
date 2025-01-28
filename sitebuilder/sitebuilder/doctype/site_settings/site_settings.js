// Copyright (c) 2025, Alool Technologies and contributors
// For license information, please see license.txt


frappe.ui.form.on("Site Settings", {
    setup(frm) {
      frm.set_query("navbar_template", () => ({
        filters: {
          type: "Navbar",
        },
      }));
      frm.set_query("footer_template", () => ({
        filters: {
          type: "Footer",
        },
      }));
    },
  
    refresh: function (frm) {
      // Add "Go To" button for Site Settings
      frm.add_custom_button(
        __("Site Page"),
        function () {
          frappe.set_route("List", "Site Page");
        },
        __("Go To")
      );
      // Add "Go To" button for Page Component
      frm.add_custom_button(
        __("Site Block"),
        function () {
          frappe.set_route("List", "Site Block");
        },
        __("Go To")
      );
     
  
      // Add "Go To" button for Front Page
      frm.add_custom_button(
        __("Blog Post"),
        function () {
          frappe.set_route("List", "Blog Post");
        },
        __("Go To")
      );
  
    //   frm.add_custom_button(
    //     __("Generate Front Setup"),
    //     function () {
    //       frappe.call({
    //         method:
    //           "sitebuilder.sitebuilder.block_generator.generate_front_setup_files",
    //         // callback: function(r) {
    //         //     frappe.msgprint(__('Files generated successfully'));
    //         // }
    //       });
    //     },
    //     __("Generate")
    //   );
  
    //   frm.add_custom_button(
    //     __("Generate Site Settings"),
    //     function () {
    //       frappe.call({
    //         method: "sitebuilder.sitebuilder.utils.set_default_web_settings",
    //         // callback: function(r) {
    //         //     frappe.msgprint(__('Site Settings generated successfully'));
    //         // }
    //       });
    //     },
    //     __("Generate")
    //   );
      //  // Add child button for Component Item
      //  frm.add_custom_button(__('Component Item'), function() {
      //     // Open dialog to select module
      //     frappe.prompt({
      //         label: 'Select Module',
      //         fieldname: 'selected_module',
      //         fieldtype: 'Link',
      //         options: 'Module Def',
      //         reqd: 1,
      //         filters: {
      //             app_name: ['!=', 'frappe']  // Exclude 'frappe' module
      //         }
      //     }, function(values) {
      //         // Call the method with selected module
      //         frappe.call({
      //             method: 'sitebuilder.sitebuilder.doc_creator.create_component_item_doctype',
      //             args: {
      //                 selected_module: values.selected_module  // Use selected module
      //             },
      //             // callback: function(response) {
      //             //     frappe.msgprint('Component Item created successfully.');
      //             // }
      //         });
      //     }, __('Select Module'), __('Create'));
      // }, __('Create'));
  
      // // Add child button for Page Item
      // frm.add_custom_button(__('Page Item'), function() {
      //     // Open dialog to select module
      //     frappe.prompt({
      //         label: 'Select Module',
      //         fieldname: 'selected_module',
      //         fieldtype: 'Link',
      //         options: 'Module Def',
      //         reqd: 1,
      //         filters: {
      //             app_name: ['!=', 'frappe']  // Exclude 'frappe' module
      //         }
      //     }, function(values) {
      //         // Call the method with selected module
      //         frappe.call({
      //             method: 'sitebuilder.sitebuilder.doc_creator.create_page_item_doctype',
      //             args: {
      //                 selected_module: values.selected_module  // Use selected module
      //             },
      //             // callback: function(response) {
      //             //     frappe.msgprint('Page Item created successfully.');
      //             // }
      //         });
      //     }, __('Select Module'), __('Create'));
      // }, __('Create'));
  
      // // Add child button for Page Component
      // frm.add_custom_button(__('Page Component'), function() {
      //     // Open dialog to select module
      //     frappe.prompt({
      //         label: 'Select Module',
      //         fieldname: 'selected_module',
      //         fieldtype: 'Link',
      //         options: 'Module Def',
      //         reqd: 1,
      //         filters: {
      //             app_name: ['!=', 'frappe']  // Exclude 'frappe' module
      //         }
      //     }, function(values) {
      //         // Call the method with selected module
      //         frappe.call({
      //             method: 'sitebuilder.sitebuilder.doc_creator.create_page_component_doctype',
      //             args: {
      //                 selected_module: values.selected_module  // Use selected module
      //             },
      //             // callback: function(response) {
      //             //     frappe.msgprint('Page Component created successfully.');
      //             // }
      //         });
      //     }, __('Select Module'), __('Create'));
      // }, __('Create'));
  
      // // Add child button for Front Page
      // frm.add_custom_button(__('Front Page'), function() {
      //     // Open dialog to select module
      //     frappe.prompt({
      //         label: 'Select Module',
      //         fieldname: 'selected_module',
      //         fieldtype: 'Link',
      //         options: 'Module Def',
      //         reqd: 1,
      //         filters: {
      //             app_name: ['!=', 'frappe']  // Exclude 'frappe' module
      //         }
      //     }, function(values) {
      //         // Call the method with selected module
      //         frappe.call({
      //             method: 'sitebuilder.sitebuilder.doc_creator.create_front_page_doctype',
      //             args: {
      //                 selected_module: values.selected_module  // Use selected module
      //             },
      //             // callback: function(response) {
      //             //     frappe.msgprint('Front Page created successfully.');
      //             // }
      //         });
      //     }, __('Select Module'), __('Create'));
      // }, __('Create'));
  
      // Add custom button to prompt the user
      frm.add_custom_button(
        __("Generate Blocks by Type"),
        function () {
          // Prompt dialog for selecting type and folder
          const dialog = new frappe.ui.Dialog({
            title: "Generate Templates for All Components of Selected Type",
            fields: [
              {
                fieldname: "type",
                fieldtype: "Select",
                label: "Type",
                options: [
                  "Dashboard",
                  "Auth",
                  "Data",
                  "Component",
                  "Section",
                  "Navbar",
                  "Footer",
                ],
                reqd: 1,
              },
              {
                fieldname: "folder_name",
                fieldtype: "Data",
                label: "Folder Name (Optional)",
                description:
                  "Leave blank to use default folder for selected type.",
              },
            ],
            primary_action_label: "Generate",
            primary_action(values) {
              frappe.call({
                method:
                  "sitebuilder.sitebuilder.block_generator.generate_page_components_for_type",
                args: {
                  type_: values.type,
                  folder_name: values.folder_name || null,
                },
                callback: function (response) {
                  frappe.msgprint("Templates generated successfully.");
  
                  dialog.hide();
                },
              });
            },
          });
  
          dialog.show();
        },
        __("Generate")
      );
  
      // Add a button to generate all front files if needed
      frm.add_custom_button(
        __("Generate Step 1 Files"),
        function () {
          frappe.call({
            method:
              "sitebuilder.sitebuilder.block_generator.generate_stepone_front_files",
            callback: function (r) {
              if (!r.exc) {
                frappe.msgprint(__("All files generated successfully."));
              }
            },
          });
        },
        __("Setup")
      );
  
      // Add a button to generate all front files if needed
      frm.add_custom_button(
        __("Generate Step 2 Files"),
        function () {
          frappe.call({
            method:
              "sitebuilder.sitebuilder.block_generator.generate_steptwo_front_files",
            callback: function (r) {
              if (!r.exc) {
                frappe.msgprint(__("All files generated successfully."));
              }
            },
          });
        },
        __("Setup")
      );
  
      frm.add_custom_button(__("View Website"), () => {
        window.open("/", "_blank");
      });
    },
  
    set_banner_from_image: function (frm) {
      if (!frm.doc.banner_image) {
        frappe.msgprint(__("Select a Brand Image first."));
      }
      frm.set_value("brand_html", "<img src='" + frm.doc.banner_image + "'>");
    },
  
    onload_post_render: function (frm) {
      frm.trigger("set_parent_label_options");
    },
  
    set_parent_label_options: function (frm) {
      frm.fields_dict.top_bar_items.grid.update_docfield_property(
        "parent_label",
        "options",
        frm.events.get_parent_options(frm, "top_bar_items")
      );
    },
  
    set_parent_label_options_footer: function (frm) {
      frm.fields_dict.footer_items.grid.update_docfield_property(
        "parent_label",
        "options",
        frm.events.get_parent_options(frm, "footer_items")
      );
    },
  
    authorize_api_indexing_access: function (frm) {
      frappe.call({
        method:
          "frappe.website.doctype.website_settings.google_indexing.authorize_access",
        args: {
          reauthorize: frm.doc.indexing_authorization_code ? 1 : 0,
        },
        callback: function (r) {
          if (!r.exc) {
            frm.save();
            window.open(r.message.url);
          }
        },
      });
    },
  
    enable_view_tracking: function (frm) {
      frappe.boot.website_tracking_enabled = frm.doc.enable_view_tracking;
    },
  
    set_parent_options: function (frm, doctype, name) {
      var item = frappe.get_doc(doctype, name);
      if (item.parentfield === "top_bar_items") {
        frm.trigger("set_parent_label_options");
      } else if (item.parentfield === "footer_items") {
        frm.trigger("set_parent_label_options_footer");
      }
    },
  
    get_parent_options: function (frm, table_field) {
      var items = frm.doc[table_field] || [];
      var main_items = [""];
      for (var i in items) {
        var d = items[i];
        if (!d.url && d.label) {
          main_items.push(d.label);
        }
      }
      return main_items.join("\n");
    },
  
    edit_navbar_template_values(frm) {
      frm.events.edit_template_values(frm, "navbar_template");
    },
  
    edit_footer_template_values(frm) {
      frm.events.edit_template_values(frm, "footer_template");
    },
  
    edit_template_values(frm, template_field) {
      let values_field = template_field + "_values";
      let template = frm.doc[template_field];
      if (!template) {
        frappe.show_alert(
          __("Please select {0}", [frm.get_docfield(template_field).label])
        );
        return;
      }
      let values = JSON.parse(frm.doc[values_field] || "{}");
      open_web_template_values_editor(template, values).then((new_values) => {
        frm.set_value(values_field, JSON.stringify(new_values));
      });
    },
  });
  
  frappe.ui.form.on("Site Navbar Item", {
    top_bar_items_delete(frm) {
      frm.events.set_parent_label_options(frm);
    },
  
    footer_items_add(frm, cdt, cdn) {
      frappe.model.set_value(cdt, cdn, "right", 0);
    },
  
    footer_items_delete(frm) {
      frm.events.set_parent_label_options_footer(frm);
    },
  
    parent_label: function (frm, doctype, name) {
      frm.events.set_parent_options(frm, doctype, name);
    },
  
    url: function (frm, doctype, name) {
      frm.events.set_parent_options(frm, doctype, name);
    },
  
    label: function (frm, doctype, name) {
      frm.events.set_parent_options(frm, doctype, name);
    },
  });
  
  frappe.tour["Site Settings"] = [
    {
      fieldname: "enable_view_tracking",
      title: __("Enable Tracking Page Views"),
      description: __(
        "Checking this will enable tracking page views for blogs, web pages, etc."
      ),
    },
    {
      fieldname: "disable_signup",
      title: __("Disable Signup for your site"),
      description: __(
        "Check this if you don't want users to sign up for an account on your site. Users won't get desk access unless you explicitly provide it."
      ),
    },
  ];
  