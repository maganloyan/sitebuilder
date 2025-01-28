# Copyright (c) 2025, Alool Technologies and contributors
# For license information, please see license.txt

# import frappe

# import frappe
from frappe.model.document import Document


class SitePage(Document):
		
	def validate(self):
			for block in self.page_blocks:
				if block.web_template and not block.label:
					sanitized_name = ''.join(word.capitalize() for word in block.web_template.split())
					block.label = sanitized_name


