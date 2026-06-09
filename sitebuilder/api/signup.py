import frappe
from frappe import _
from frappe.utils.password import update_password


def _ensure_portal_user_role():
	role_name = "Portal User"
	if not frappe.db.exists("Role", role_name):
		frappe.get_doc(
			{
				"doctype": "Role",
				"role_name": role_name,
			}
		).insert(ignore_permissions=True)


def _user_exists(email: str) -> bool:
	return bool(
		frappe.db.exists("User", {"email": email})
		or frappe.db.exists("Portal User", email)
	)


@frappe.whitelist(allow_guest=True)
def signup_user(first_name, last_name, email, username=None):
	"""Create a Frappe User with the Portal User role."""
	email = frappe.utils.strip(email)
	if frappe.db.exists("User", {"email": email}):
		frappe.throw(
			_("An account with this email already exists. Please sign in instead."),
			frappe.DuplicateEntryError,
		)

	_ensure_portal_user_role()
	user = frappe.get_doc(
		{
			"doctype": "User",
			"email": email,
			"first_name": first_name,
			"last_name": last_name,
			"full_name": f"{first_name} {last_name or ''}".strip(),
			"username": username or email,
			"enabled": 1,
		}
	)
	user.append("roles", {"role": "Portal User"})
	user.insert(ignore_permissions=True)
	frappe.db.commit()
	return {"message": "User created successfully", "user": user.name}


@frappe.whitelist(allow_guest=True)
def assign_portal_user_role(doc, method):
	"""Ensure Portal User role exists and assign it before saving a User."""
	_ensure_portal_user_role()
	role_name = "Portal User"
	if not any(role.role == role_name for role in doc.roles):
		doc.append("roles", {"role": role_name})


@frappe.whitelist(allow_guest=True)
def signup_portal_user(first_name, last_name, email, username=None):
	"""Create Portal User; doc_events sync the linked Frappe User."""
	email = frappe.utils.strip(email)
	if frappe.db.exists("Portal User", email):
		frappe.throw(
			_("An account with this email already exists. Please sign in instead."),
			frappe.DuplicateEntryError,
		)

	user = frappe.get_doc(
		{
			"doctype": "Portal User",
			"email": email,
			"first_name": first_name,
			"last_name": last_name,
			"full_name": f"{first_name} {last_name or ''}".strip(),
			"username": username or email,
			"enabled": 1,
		}
	)
	user.insert(ignore_permissions=True)
	frappe.db.commit()
	return {"message": "Portal user created successfully", "name": user.name}


@frappe.whitelist(allow_guest=True)
def user_signup(first_name, last_name, email, username=None):
	"""Portal signup: create Portal User (User is synced with Portal User role)."""
	email = frappe.utils.strip(email)
	if frappe.db.exists("Portal User", email):
		frappe.throw(
			_("An account with this email already exists. Please sign in instead."),
			frappe.DuplicateEntryError,
		)

	# User without Portal User can be completed (partial signup recovery).
	if frappe.db.exists("User", {"email": email}):
		return signup_portal_user(first_name, last_name, email, username)

	return signup_portal_user(first_name, last_name, email, username)


@frappe.whitelist(allow_guest=True)
def set_password(email, new_password):
	"""Set password on the linked Frappe User after signup."""
	email = frappe.utils.strip(email)
	user = frappe.db.get_value("User", {"email": email}, "name")
	if not user:
		frappe.throw(_("No user found for this email. Complete signup first."))

	update_password(user, new_password, logout_all_sessions=0)

	if frappe.db.exists("Portal User", email):
		portal_user = frappe.get_doc("Portal User", email)
		portal_user.new_password = new_password
		portal_user.save(ignore_permissions=True)

	frappe.db.commit()
	return {"message": "Password set successfully"}
