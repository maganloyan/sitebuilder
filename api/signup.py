import frappe


@frappe.whitelist(allow_guest=True)
def signup_user(first_name, last_name, email, username=None):
    if frappe.db.exists("User", email):
        frappe.throw(f"A user with email {email} already exists.", frappe.DuplicateEntryError)

    user = frappe.get_doc({
        "doctype": "User",
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "full_name": f"{first_name} {last_name or ''}".strip(),
        "username": email,
        "enabled": 1
    })
    user.insert(ignore_permissions=True)
    return {"message": "User created successfully"}



# @frappe.whitelist(allow_guest=True)
# def assign_portal_user_role(doc, method):
#     """Automatically assign 'Portal User' role before saving."""
#     if not any(role.role == "Portal User" for role in doc.roles):
#         doc.append("roles", {"role": "Portal User"})


@frappe.whitelist(allow_guest=True)
def assign_portal_user_role(doc, method):
    """Ensure 'Portal User' role exists and assign it before saving."""
    role_name = "Portal User"

    # Check if the role exists
    if not frappe.db.exists("Role", role_name):
        frappe.get_doc({
            "doctype": "Role",
            "role_name": role_name,
            # "desk_access": 0  # Ensuring it's a portal role, not a desk role
        }).insert(ignore_permissions=True)

    # Assign the role if the user doesn't already have it
    if not any(role.role == role_name for role in doc.roles):
        doc.append("roles", {"role": role_name})



@frappe.whitelist(allow_guest=True)
def update_user(first_name, middle_name=None, full_name=None, username=None, email=None, phone=None, 
                user_image=None, banner_image=None, password=None, gender=None, bio=None, 
                location=None, birth_date=None, interests=None):
    """Create or update a User with Portal User role"""
    
    if not email:
        frappe.throw("Email is required")
    
    # Check if User already exists
    user = frappe.get_value("User", {"email": email}, "name")

    user_data = {
        "doctype": "User",
        "first_name": first_name,
        "middle_name": middle_name,
        "full_name": full_name or f"{first_name} {middle_name or ''}".strip(),
        "username": email,
        # "username": username or email.split("@")[0],
        "email": email,
        "phone": phone,
        "user_image": user_image,
        "banner_image": banner_image,
        "gender": gender,
        "bio": bio,
        "location": location,
        "birth_date": birth_date,
        "interests": interests,
        "new_password": password,
        "enabled": 1
    }

    if user:
        # Update existing User
        doc = frappe.get_doc("User", user)
        doc.update(user_data)
        doc.save(ignore_permissions=True)

    frappe.db.commit()

    return {"message": "User updated successfully", "user": doc.name}

@frappe.whitelist(allow_guest=True)
def set_password(email, new_password):
    """Set a new password for a user"""
    user = frappe.get_doc("User", {"email": email})
    portal_user = frappe.get_doc("Portal User", {"email": email})
    user.new_password = new_password
    user.save(ignore_permissions=True)
    portal_user.new_password = new_password
    portal_user.save(ignore_permissions=True)
    frappe.db.commit()
    return {"message": "Password set successfully"}

@frappe.whitelist(allow_guest=True)
def signup_portal_user(first_name, last_name, email, username=None):
    if frappe.db.exists("Portal User", email):
        frappe.throw(f"A user with email {email} already exists.", frappe.DuplicateEntryError)

    user = frappe.get_doc({
        "doctype": "Portal User",
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "full_name": f"{first_name} {last_name or ''}".strip(),
        "username": email,
        "enabled": 1
    })
    user.insert(ignore_permissions=True)
    return {"message": "User created successfully"}

@frappe.whitelist(allow_guest=True)
def user_signup(first_name, last_name, email, username=None):

    create_user = signup_user(first_name, last_name, email, username)
    create_portal_user = signup_portal_user(first_name, last_name, email, username)

    if create_user and create_portal_user:
        return {"message": "User created successfully"}
    else:
        return {"message": "User creation failed"}
