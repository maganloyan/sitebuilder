# Copyright (c) 2025, Alool Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class PortalUser(Document):
    def validate(self):
        self.sync_user()

    def sync_user(self):
        """Create or update the corresponding User record for the Portal User."""
        user = frappe.get_value("User", {"email": self.email}, "name")

        user_data = {
            "first_name": self.first_name,
            "middle_name": self.middle_name,
            "full_name": self.full_name,
            "username": self.username,
            "email": self.email,
            "phone": self.phone,
            "user_image": self.user_image,
            "banner_image": self.banner_image,
            "gender": self.gender,
            "bio": self.bio,
            "location": self.location,
            "birth_date": self.birth_date,
            "interests": self.interests,
            "new_password": self.new_password if self.new_password else None,
            "enabled": 1,  # Ensure the user is enabled
        }

        if user:
            # Update existing User
            user_doc = frappe.get_doc("User", user)
            user_doc.update(user_data)
            user_doc.save(ignore_permissions=True)  # Ignore permissions when updating
        else:
            # Create new User
            user_doc = frappe.get_doc({"doctype": "User", **user_data})
            user_doc.insert(ignore_permissions=True)

        # Assign the "Portal User" role if not already assigned
        if not frappe.db.exists("Has Role", {"parent": user_doc.name, "role": "Portal User"}):
            user_doc.append("roles", {"role": "Portal User"})

        user_doc.save(ignore_permissions=True)  # Ensure role assignment is saved
        frappe.db.commit()  # Ensure changes are saved
