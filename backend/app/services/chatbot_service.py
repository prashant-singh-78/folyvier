from typing import Any, Dict, Optional

from app.db.database import db
from app.db.seed import COMING_SOON


async def get_chatbot_init() -> Dict[str, Any]:
    conditions = await db.find("conditions", {}, sort_field="stage_number")
    return {
        "bot_name": "FOLIBEIR AI Assistant",
        "welcome_message": "Welcome to FOLIBEIR! Let's understand your hair condition.",
        "disclaimer": (
            "Visual assessment categories are for informational guidance only and do not constitute "
            "a medical diagnosis."
        ),
        "quick_options": [
            {
                "id": "opt_1",
                "label": "1. I have mild frontal hair thinning.",
                "action": "condition",
                "condition_code": "condition-1",
            },
            {
                "id": "opt_2",
                "label": "2. My scalp is becoming visible.",
                "action": "condition",
                "condition_code": "condition-2",
            },
            {
                "id": "opt_3",
                "label": "3. I have significant hair loss.",
                "action": "condition",
                "condition_code": "condition-3",
            },
            {
                "id": "opt_4",
                "label": "4. I want to know about FOLIBEIR technology.",
                "action": "technology",
            },
        ],
        "conditions": conditions,
    }


async def handle_chatbot_message(
    *,
    message: str = "",
    action: str = "",
    condition_code: str = "",
    user: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    conditions = await db.find("conditions", {}, sort_field="stage_number")
    products = await db.find("products")
    wa_cfg = await db.find_one("whatsapp_settings", {"key": "default"}) or {}
    tech = wa_cfg.get("technology_650nm") or {}

    lower = (message or "").lower().strip()

    matched_code = condition_code
    if not matched_code:
        if any(k in lower for k in ["condition 1", "mild", "early", "frontal hair thinning"]) or lower == "1":
            matched_code = "condition-1"
        elif any(k in lower for k in ["condition 2", "moderate", "scalp is becoming visible", "visible scalp"]) or lower == "2":
            matched_code = "condition-2"
        elif any(k in lower for k in ["condition 3", "advanced", "significant hair loss", "extensive"]) or lower == "3":
            matched_code = "condition-3"

    # 1. Condition match
    if matched_code:
        cond = next((c for c in conditions if c["code"] == matched_code), None)
        prod = next((p for p in products if matched_code in (p.get("condition_mapping") or [])), None)
        if cond:
            reply_lines = [
                f"You selected {cond['category_label']}.",
                f"\n{cond['description']}",
                "\nFOLIBEIR incorporates a 650 nm Red Light Wavelength System alongside verified condition-mapped product information.",
            ]
            if user:
                reply_lines.append(
                    "\nClick 'Confirm & Send to WhatsApp' below to save this assessment to your FOLIBEIR profile and automatically trigger personalized WhatsApp updates."
                )
            else:
                reply_lines.append(
                    "\nCreate a free FOLIBEIR account or log in so we can save your selected condition and automatically send personalized FOLIBEIR details to your WhatsApp."
                )

            return {
                "reply": "".join(reply_lines),
                "selected_condition": cond,
                "recommended_product": prod,
                "can_confirm_assessment": bool(user),
                "requires_login": not bool(user),
                "quick_options": [
                    {
                        "id": "tech_info",
                        "label": "Learn about 650 nm Red Light Technology",
                        "action": "technology",
                    },
                    {
                        "id": "compare_all",
                        "label": "Compare all 3 hair conditions",
                        "action": "explain_conditions",
                    },
                ],
            }

    # 2. 650 nm Technology request
    if action == "technology" or lower == "4" or any(
        k in lower for k in ["650", "technology", "red light", "laser", "wavelength", "product", "device", "spec"]
    ):
        reply = (
            f"FOLIBEIR 650 nm Red Light Technology:\n\n"
            f"• Red Light Wavelength: {tech.get('wavelength', '650 nm')}\n"
            f"• Overview: {tech.get('technical_description', COMING_SOON)}\n"
            f"• Device Components: {tech.get('device_components', COMING_SOON)}\n"
            f"• Operating Specifications: {tech.get('operating_specifications', COMING_SOON)}\n"
            f"• Safety Information: {tech.get('safety_information', COMING_SOON)}\n\n"
            "Would you like to select your hair condition stage to explore matched product information?"
        )
        return {
            "reply": reply,
            "technology": tech,
            "quick_options": [
                {"id": "opt_1", "label": "1. I have mild frontal hair thinning.", "action": "condition", "condition_code": "condition-1"},
                {"id": "opt_2", "label": "2. My scalp is becoming visible.", "action": "condition", "condition_code": "condition-2"},
                {"id": "opt_3", "label": "3. I have significant hair loss.", "action": "condition", "condition_code": "condition-3"},
            ],
        }

    # 3. Explain all 3 conditions
    if action == "explain_conditions" or any(k in lower for k in ["condition", "stage", "compare", "difference"]):
        summary = "\n\n".join(f"• {c['category_label']}: {c['description']}" for c in conditions)
        return {
            "reply": (
                f"FOLIBEIR organizes visual hair appearance into three informational categories:\n\n{summary}\n\n"
                "Note: These categories are for visual assessment only and are not medical diagnoses. Which stage feels closest to you?"
            ),
            "quick_options": [
                {"id": "opt_1", "label": "1. I have mild frontal hair thinning.", "action": "condition", "condition_code": "condition-1"},
                {"id": "opt_2", "label": "2. My scalp is becoming visible.", "action": "condition", "condition_code": "condition-2"},
                {"id": "opt_3", "label": "3. I have significant hair loss.", "action": "condition", "condition_code": "condition-3"},
            ],
        }

    # 4. Medical diagnosis guardrail
    if any(k in lower for k in ["diagnos", "cure", "doctor", "medical", "prescription"]):
        return {
            "reply": (
                "FOLIBEIR cannot provide a medical diagnosis, clinical treatment claim, or prescription. "
                "I can help you explore our three visual hair-loss stages, explain our 650 nm Red Light Technology, "
                "and trigger verified FOLIBEIR WhatsApp product information."
            ),
            "quick_options": [
                {"id": "explain", "label": "Explain the 3 hair conditions", "action": "explain_conditions"},
                {"id": "opt_4", "label": "Explore 650 nm Technology", "action": "technology"},
            ],
        }

    return {
        "reply": (
            "Welcome to FOLIBEIR! I can explain our three visual hair-condition categories, share verified "
            "650 nm Red Light Technology specifications, and help save your assessment for automatic WhatsApp updates."
        ),
        "quick_options": [
            {"id": "opt_1", "label": "1. I have mild frontal hair thinning.", "action": "condition", "condition_code": "condition-1"},
            {"id": "opt_2", "label": "2. My scalp is becoming visible.", "action": "condition", "condition_code": "condition-2"},
            {"id": "opt_3", "label": "3. I have significant hair loss.", "action": "condition", "condition_code": "condition-3"},
            {"id": "opt_4", "label": "4. I want to know about FOLIBEIR technology.", "action": "technology"},
        ],
    }
