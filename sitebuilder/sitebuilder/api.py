import frappe

def sync_portal_user(doc, method):
    """
    Create or update a User when a Portal User is created or updated.
    """
    user = frappe.get_value("User", {"email": doc.email}, "name")
    user_data = {
        "first_name": doc.first_name,
        "middle_name": doc.middle_name,
        "full_name": doc.full_name,
        "username": doc.username,
        "email": doc.email,
        "phone": doc.phone,
        "user_image": doc.user_image,
        "banner_image": doc.banner_image,
        "gender": doc.gender,
        "bio": doc.bio,
        "location": doc.location,
        "birth_date": doc.birth_date,
        "new_password": doc.new_password,
        "send_welcome_email": 0,  # Prevent sending default welcome email
    }
    
    if user:
        # Update existing User
        frappe.db.set_value("User", user, user_data)
    else:
        # Create new User
        user_data["enabled"] = 1  # Ensure user is active
        user_data["role_profile_name"] = "Portal User"  # Assign Portal User role
        new_user = frappe.get_doc({
            "doctype": "User",
            **user_data
        })
        new_user.insert(ignore_permissions=True)
    
    frappe.db.commit()
