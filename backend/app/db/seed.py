from app.config import settings
from app.core.security import hash_password
from app.db.database import db, new_id, utc_now_iso

COMING_SOON = "Information Coming Soon"

DEFAULT_CONDITIONS = [
    {
        "code": "condition-1",
        "stage_number": 1,
        "slug": "early-hair-thinning",
        "title": "Early Hair Thinning",
        "category_label": "Condition 1 – Early Hair Thinning",
        "severity_tag": "Stage 1 · Early Visual Stage",
        "description": "An early hair-thinning appearance characterized by reduced frontal hair density.",
        "detailed_overview": (
            "Condition 1 represents an early visual stage of hair thinning where the frontal hairline "
            "begins to show slight density reduction and mild recession while most of the scalp remains covered. "
            "This category is for visual self-assessment only and is not a medical diagnosis."
        ),
        "visual_indicators": [
            "Slightly reduced frontal hair density.",
            "Mild hairline recession near the temples.",
            "Hair thinning noticeable near the front edge.",
            "Most of the scalp remains covered with hair.",
        ],
        "image_url": "/images/condition-1-early.jpg",
        "disclaimer": "This category is for visual assessment only and must not be considered a medical diagnosis.",
    },
    {
        "code": "condition-2",
        "stage_number": 2,
        "slug": "moderate-hair-loss",
        "title": "Moderate Hair Loss",
        "category_label": "Condition 2 – Moderate Hair Loss",
        "severity_tag": "Stage 2 · Moderate Visual Stage",
        "description": "A moderate hair-thinning appearance with increasing scalp visibility.",
        "detailed_overview": (
            "Condition 2 reflects a moderate visual progression with noticeable frontal hair thinning, "
            "reduced density across the top scalp, visible scalp patches, and more noticeable hairline recession. "
            "This category is for visual self-assessment only and is not a medical diagnosis."
        ),
        "visual_indicators": [
            "Noticeable frontal hair thinning.",
            "Reduced hair density across the top scalp.",
            "Visible scalp patches under regular lighting.",
            "More noticeable hairline recession.",
        ],
        "image_url": "/images/condition-2-moderate.jpg",
        "disclaimer": "This category is for visual assessment only and must not be considered a medical diagnosis.",
    },
    {
        "code": "condition-3",
        "stage_number": 3,
        "slug": "advanced-hair-loss",
        "title": "Advanced Hair Loss",
        "category_label": "Condition 3 – Advanced Hair Loss",
        "severity_tag": "Stage 3 · Advanced Visual Stage",
        "description": "An advanced hair-loss appearance with substantial frontal recession and reduced scalp coverage.",
        "detailed_overview": (
            "Condition 3 describes an advanced visual appearance marked by significant frontal hairline "
            "recession, extensive scalp visibility, and major reduction in hair density across the frontal and top scalp. "
            "This category is for visual self-assessment only and is not a medical diagnosis."
        ),
        "visual_indicators": [
            "Significant frontal hairline recession.",
            "Extensive scalp visibility across top and crown.",
            "Major reduction in hair density.",
            "Advanced frontal and top scalp hair loss.",
        ],
        "image_url": "/images/condition-3-advanced.jpg",
        "disclaimer": "This category is for visual assessment only and must not be considered a medical diagnosis.",
    },
]

# STRICT DATA RULE: Only 650 nm wavelength is specified by prompt.
# Do NOT invent specifications, ingredients, clinical results, treatment claims, or usage instructions.
DEFAULT_PRODUCTS = [
    {
        "product_id": "prod_folibeir_c1",
        "product_name": "FOLIBEIR 650 nm Hair Care System — Early Hair Thinning Configuration",
        "product_description": (
            "Official FOLIBEIR product information mapped to Condition 1 – Early Hair Thinning, "
            "featuring our 650 nm Red Light Wavelength System. Additional verified specifications can be "
            "entered anytime via the Super Admin Dashboard."
        ),
        "wavelength": "650 nm",
        "specifications": COMING_SOON,
        "components": COMING_SOON,
        "usage_instructions": COMING_SOON,
        "safety_information": COMING_SOON,
        "features": [
            "650 nm Red Light Wavelength System",
            COMING_SOON,
        ],
        "condition_mapping": ["condition-1"],
        "product_images": ["/images/folibeir-device-650nm.jpg", "/images/product-bottle.jpg"],
    },
    {
        "product_id": "prod_folibeir_c2",
        "product_name": "FOLIBEIR 650 nm Hair Care System — Moderate Hair Loss Configuration",
        "product_description": (
            "Official FOLIBEIR product information mapped to Condition 2 – Moderate Hair Loss, "
            "featuring our 650 nm Red Light Wavelength System. Additional verified specifications can be "
            "entered anytime via the Super Admin Dashboard."
        ),
        "wavelength": "650 nm",
        "specifications": COMING_SOON,
        "components": COMING_SOON,
        "usage_instructions": COMING_SOON,
        "safety_information": COMING_SOON,
        "features": [
            "650 nm Red Light Wavelength System",
            COMING_SOON,
        ],
        "condition_mapping": ["condition-2"],
        "product_images": ["/images/folibeir-device-650nm.jpg", "/images/product-bottle.jpg"],
    },
    {
        "product_id": "prod_folibeir_c3",
        "product_name": "FOLIBEIR 650 nm Hair Care System — Advanced Hair Loss Configuration",
        "product_description": (
            "Official FOLIBEIR product information mapped to Condition 3 – Advanced Hair Loss, "
            "featuring our 650 nm Red Light Wavelength System. Additional verified specifications can be "
            "entered anytime via the Super Admin Dashboard."
        ),
        "wavelength": "650 nm",
        "specifications": COMING_SOON,
        "components": COMING_SOON,
        "usage_instructions": COMING_SOON,
        "safety_information": COMING_SOON,
        "features": [
            "650 nm Red Light Wavelength System",
            COMING_SOON,
        ],
        "condition_mapping": ["condition-3"],
        "product_images": ["/images/folibeir-device-650nm.jpg", "/images/product-bottle.jpg"],
    },
]

DEFAULT_WHATSAPP_SETTINGS = {
    "key": "default",
    "owner_whatsapp_number": settings.business_owner_whatsapp_number or "917627043971",
    "notify_owner_on_register": True,
    "notify_owner_on_first_login": True,
    "notify_owner_on_assessment": True,
    "notify_owner_on_contact": True,
    "auto_message_customer_on_assessment": True,
    "owner_template_name": settings.whatsapp_owner_template_name,
    "customer_template_name": settings.whatsapp_customer_template_name,
    "template_language": settings.whatsapp_template_language,
    "owner_assessment_template": (
        "New FOLIBEIR Customer Inquiry!\n\n"
        "Customer Name: {customer_name}\n"
        "Customer Email: {customer_email}\n"
        "WhatsApp Number: {customer_whatsapp}\n"
        "Selected Condition: {condition_label}\n"
        "Interest: {product_name} & 650 nm Red Light Technology\n"
        "Consent Status: {consent_status}\n"
        "Date: {date_time}\n\n"
        "A new customer has completed the hair condition assessment.\n\n"
        "Please follow up with the customer."
    ),
    "owner_contact_template": (
        "New FOLIBEIR Contact Query!\n\n"
        "Name: {customer_name}\n"
        "Email: {customer_email}\n"
        "WhatsApp Number: {customer_whatsapp}\n"
        "Subject: {subject}\n"
        "Message: {query_message}\n"
        "Date: {date_time}\n\n"
        "Please respond to this customer query."
    ),
    "owner_register_template": (
        "New FOLIBEIR Account Registration!\n\n"
        "Customer Name: {customer_name}\n"
        "Customer Email: {customer_email}\n"
        "WhatsApp Number: {customer_whatsapp}\n"
        "Consent Status: {consent_status}\n"
        "Date: {date_time}\n\n"
        "A new user has registered on the FOLIBEIR platform."
    ),
    "owner_first_login_template": (
        "FOLIBEIR User First Login!\n\n"
        "Customer Name: {customer_name}\n"
        "Customer Email: {customer_email}\n"
        "WhatsApp Number: {customer_whatsapp}\n"
        "Consent Status: {consent_status}\n"
        "Date: {date_time}\n\n"
        "The verified customer has logged in for the first time."
    ),
    "customer_templates": {
        "condition-1": (
            "Hello {customer_name}!\n\n"
            "Welcome to FOLIBEIR.\n\n"
            "Thank you for completing your hair condition assessment.\n\n"
            "Your Selected Condition:\n"
            "Condition 1 – Early Hair Thinning.\n\n"
            "FOLIBEIR provides product information and technology designed around your hair-care journey.\n\n"
            "Our technology information includes a 650 nm Red Light Wavelength System.\n\n"
            "Would you like to explore the complete product specifications?\n\n"
            "Thank you,\n"
            "Team FOLIBEIR."
        ),
        "condition-2": (
            "Hello {customer_name}!\n\n"
            "Thank you for choosing FOLIBEIR.\n\n"
            "Your Selected Condition:\n"
            "Condition 2 – Moderate Hair Loss.\n\n"
            "We have recorded your selected category.\n\n"
            "You can explore the FOLIBEIR product details, technical specifications and available information "
            "related to our 650 nm Red Light Technology.\n\n"
            "For further information, connect with our assistant.\n\n"
            "Team FOLIBEIR."
        ),
        "condition-3": (
            "Hello {customer_name}!\n\n"
            "Welcome to FOLIBEIR.\n\n"
            "Your Selected Condition:\n"
            "Condition 3 – Advanced Hair Loss.\n\n"
            "Thank you for exploring our platform.\n\n"
            "We invite you to learn more about the FOLIBEIR product, its technical specifications and "
            "available hair-care information.\n\n"
            "Our team is available to assist you.\n\n"
            "Team FOLIBEIR."
        ),
    },
    "technology_650nm": {
        "wavelength": "650 nm",
        "title": "FOLIBEIR 650 nm Red Light Wavelength System",
        "technical_description": (
            "FOLIBEIR incorporates a 650 nm red-light wavelength optical architecture engineered for "
            "modern personal hair-care routines. Verified technical parameters, device components, "
            "operating specifications, usage instructions, and safety guidance are managed directly "
            "by the FOLIBEIR team."
        ),
        "device_components": COMING_SOON,
        "operating_specifications": COMING_SOON,
        "usage_instructions": COMING_SOON,
        "safety_information": COMING_SOON,
        "features": [
            "Dedicated 650 nm Red Light Wavelength",
            "Condition-Mapped Product Guidance",
            COMING_SOON,
        ],
        "hero_image": "/images/folibeir-device-650nm.jpg",
    },
}


async def seed_database() -> None:
    # 1. Default Super Admin
    admin_exists = await db.find_one("users", {"email": settings.default_admin_email})
    if not admin_exists:
        now = utc_now_iso()
        await db.insert_one(
            "users",
            {
                "user_id": new_id("usr"),
                "full_name": settings.default_admin_name,
                "email": settings.default_admin_email,
                "mobile_number": "0000000000",
                "whatsapp_number": settings.business_owner_whatsapp_number or "0000000000",
                "password_hash": hash_password(settings.default_admin_password),
                "email_verified": True,
                "whatsapp_consent": True,
                "consent_timestamp": now,
                "role": "super_admin",
                "selected_condition": "",
                "first_login_notified": True,
                "created_at": now,
            },
        )
        print(f"[Seed] Created Super Admin: {settings.default_admin_email}")

    # 2. Hair Conditions
    for cond in DEFAULT_CONDITIONS:
        exists = await db.find_one("conditions", {"code": cond["code"]})
        if not exists:
            await db.insert_one("conditions", cond)

    # 3. Products
    for prod in DEFAULT_PRODUCTS:
        exists = await db.find_one("products", {"product_id": prod["product_id"]})
        if not exists:
            await db.insert_one("products", prod)

    # 4. WhatsApp Settings & 650 nm Technology config
    wa_cfg = await db.find_one("whatsapp_settings", {"key": "default"})
    if not wa_cfg:
        await db.insert_one("whatsapp_settings", DEFAULT_WHATSAPP_SETTINGS)
    else:
        patch = {}
        if "notify_owner_on_contact" not in wa_cfg:
            patch["notify_owner_on_contact"] = True
        if not wa_cfg.get("owner_contact_template"):
            patch["owner_contact_template"] = DEFAULT_WHATSAPP_SETTINGS["owner_contact_template"]
        if not wa_cfg.get("owner_whatsapp_number") and settings.business_owner_whatsapp_number:
            patch["owner_whatsapp_number"] = settings.business_owner_whatsapp_number
        if patch:
            await db.update_one("whatsapp_settings", {"key": "default"}, patch)
