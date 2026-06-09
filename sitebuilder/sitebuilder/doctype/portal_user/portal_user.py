# Copyright (c) 2025, Alool Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

PORTAL_ROLE = "Portal User"


def _ensure_portal_user_role():
	if not frappe.db.exists("Role", PORTAL_ROLE):
		frappe.get_doc({"doctype": "Role", "role_name": PORTAL_ROLE}).insert(ignore_permissions=True)


def _assign_portal_role(user_doc):
	_ensure_portal_user_role()
	if not any(role.role == PORTAL_ROLE for role in user_doc.roles):
		user_doc.append("roles", {"role": PORTAL_ROLE})


def sync_on_save(doc, method=None):
    """Hook handler called by doc_events — delegates to the instance method."""
    doc.sync_user()


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
            user_doc = frappe.get_doc("User", user)
            user_doc.update(user_data)
            _assign_portal_role(user_doc)
            user_doc.save(ignore_permissions=True)
        else:
            user_doc = frappe.get_doc({"doctype": "User", **user_data})
            _assign_portal_role(user_doc)
            user_doc.flags.no_welcome_mail = True
            user_doc.insert(ignore_permissions=True)
