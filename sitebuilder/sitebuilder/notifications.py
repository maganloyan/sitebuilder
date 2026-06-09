# Copyright (c) 2025, Alool Technologies and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.desk.doctype.notification_log.notification_log import (
	enqueue_create_notification,
	mark_all_as_read as frappe_mark_all_as_read,
	mark_as_read as frappe_mark_as_read,
)
from frappe.desk.doctype.notification_settings.notification_settings import (
	create_notification_settings,
)

PREFERENCE_EMAIL_FIELDS = {
	"portal-alerts": "enable_email_assignment",
	"mentions": "enable_email_mention",
	"system": "enable_email_event_reminders",
}

DEFAULT_PREFERENCES = [
	{
		"id": "portal-alerts",
		"label": "Portal alerts",
		"description": "Updates about work panels and site pages",
	},
	{
		"id": "mentions",
		"label": "Mentions & assignments",
		"description": "When someone assigns you a document",
	},
	{
		"id": "system",
		"label": "System messages",
		"description": "Maintenance and platform announcements",
	},
]


def _ensure_notification_settings(user: str):
	if not frappe.db.exists("Notification Settings", user):
		create_notification_settings(user)


def _resolve_users(users):
	"""Accept Frappe usernames or user email addresses."""
	if isinstance(users, str):
		users = [u.strip() for u in users.split(",") if u.strip()]
	users = list(dict.fromkeys(users))
	resolved = []
	for user in users:
		if frappe.db.exists("User", user):
			resolved.append(user)
			continue
		name = frappe.db.get_value("User", {"email": user, "enabled": 1}, "name")
		if name:
			resolved.append(name)
	return resolved


@frappe.whitelist()
def send_portal_notification(
	subject,
	message="",
	users=None,
	link=None,
	document_type=None,
	document_name=None,
	notification_type="Alert",
):
	"""Create in-app Notification Log entries for one or more users."""
	if frappe.session.user == "Guest":
		frappe.throw(_("You must be logged in to send notifications"), frappe.PermissionError)

	recipients = _resolve_users(users) if users else [frappe.session.user]
	if not recipients:
		frappe.throw(_("No valid recipients found"))
	if not frappe.has_permission("Notification Log", "create"):
		# Portal users may only notify themselves unless they have desk permissions.
		recipients = [u for u in recipients if u == frappe.session.user]
		if not recipients:
			frappe.throw(_("Not permitted to send notifications to other users"), frappe.PermissionError)
	if not recipients:
		frappe.throw(_("At least one recipient is required"))

	doc = {
		"type": notification_type,
		"subject": subject,
		"email_content": message or subject,
		"document_type": document_type,
		"document_name": document_name,
		"from_user": frappe.session.user,
	}
	if link:
		doc["link"] = link

	# Frappe's queue worker resolves recipients by email.
	recipient_emails = [
		frappe.db.get_value("User", user, "email") for user in recipients if frappe.db.get_value("User", user, "email")
	]
	if not recipient_emails:
		frappe.throw(_("Recipients have no email addresses"))
	enqueue_create_notification(recipient_emails, doc)
	return {"message": "Notification queued", "recipients": recipients}


@frappe.whitelist()
def mark_notification_read(docname: str):
	"""Mark a single notification as read for the current user."""
	frappe_mark_as_read(docname)
	return {"ok": True}


@frappe.whitelist()
def mark_all_notifications_read():
	"""Mark all unread notifications as read for the current user."""
	frappe_mark_all_as_read()
	return {"ok": True}


@frappe.whitelist()
def get_portal_notification_preferences():
	"""Return notification preference rows for the portal settings UI."""
	user = frappe.session.user
	_ensure_notification_settings(user)
	settings = frappe.get_doc("Notification Settings", user)
	in_app_enabled = bool(settings.enabled)

	preferences = []
	for row in DEFAULT_PREFERENCES:
		email_field = PREFERENCE_EMAIL_FIELDS[row["id"]]
		preferences.append(
			{
				**row,
				"email": bool(settings.get(email_field)),
				"inApp": in_app_enabled,
			}
		)
	return {"preferences": preferences}


@frappe.whitelist()
def update_portal_notification_preference(preference_id, channel, value):
	"""Update a single preference toggle from the portal settings UI."""
	user = frappe.session.user
	_ensure_notification_settings(user)
	settings = frappe.get_doc("Notification Settings", user)
	value = frappe.parse_json(value) if isinstance(value, str) else value
	enabled = 1 if value else 0

	if channel == "inApp":
		settings.enabled = enabled
	elif channel == "email":
		field = PREFERENCE_EMAIL_FIELDS.get(preference_id)
		if not field:
			frappe.throw(_("Unknown notification preference"))
		settings.set(field, enabled)
	else:
		frappe.throw(_("Invalid channel"))

	settings.save(ignore_permissions=True)
	frappe.db.commit()
	return get_portal_notification_preferences()


def notify_site_page_update(doc, method=None):
	"""Notify portal users when a site page is saved."""
	if frappe.flags.in_import or frappe.flags.in_install:
		return

	portal_users = frappe.get_all("Portal User", pluck="name", filters={"enabled": 1})
	if not portal_users:
		return

	subject = _("Site page updated: {0}").format(doc.title or doc.name)
	link = f"/portal/app/site-page/view/{doc.name}"
	enqueue_create_notification(
		portal_users,
		{
			"type": "Alert",
			"subject": subject,
			"email_content": subject,
			"document_type": doc.doctype,
			"document_name": doc.name,
			"link": link,
			"from_user": frappe.session.user,
		},
	)
