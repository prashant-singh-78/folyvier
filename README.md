# FOLIBEIR — AI-Powered Hair Analysis, 650 nm Red Light Technology & Dual WhatsApp Automation Platform

FOLIBEIR is a production-ready full-stack web application built with **React + Vite + Tailwind CSS + Framer Motion** on the frontend and **Python FastAPI + MongoDB Atlas (Motor) + Official Meta WhatsApp Business Cloud API** on the backend.

## Core Capabilities

1. **Dual Automatic WhatsApp Automation (Meta WhatsApp Business Cloud API v21.0)**:
   - Automatically dispatches personalized WhatsApp messages to **BOTH**:
     - **Business Owner's WhatsApp Number** (configurable via Super Admin Dashboard -> WhatsApp Settings; triggered on registration, first login, and hair condition assessment).
     - **Customer's Registered WhatsApp Number** (triggered automatically after confirmed assessment when explicit WhatsApp opt-in consent is recorded—no manual WhatsApp click required).
   - Features webhook verification & delivery status callbacks (`GET/POST /api/whatsapp/webhook` with `X-Hub-Signature-256` HMAC validation), background async dispatcher with exponential-backoff retries, duplicate message prevention, error logging, manual retry in Admin, and a production **Redis + Celery** worker blueprint (`backend/app/workers/celery_app.py`).
2. **Full Secure Authentication**:
   - Direct User Registration with WhatsApp number validation, password strength meter, visibility toggles, Terms & Privacy acceptance, and **separate WhatsApp communication consent**.
   - Login with **Argon2** password hashing, **JWT + HTTP-only secure cookies**, Remember Me, login rate limiting, **Google Sign-In**, and direct **Forgot / Reset Password**.
   - Dedicated **User Dashboard** with profile/WhatsApp updates, interactive Hair Condition Assessment, matched product view, and live WhatsApp communication status.
3. **3 Realistic Visual Hair Conditions & 650 nm Red Light Technology**:
   - Medically neutral visual progression across Condition 1 (Early Hair Thinning), Condition 2 (Moderate Hair Loss), and Condition 3 (Advanced Hair Loss).
   - Dedicated **650 nm Red Light Wavelength System** section + condition-mapped product specs strictly displaying only admin-verified data (`Information Coming Soon` for unconfigured fields).
4. **FOLIBEIR AI Assistant**:
   - Floating assistant on every page answering questions about the 3 conditions and 650 nm technology and directly confirming conditions for logged-in users.
5. **Super Admin Dashboard (Strictly Non-CRM)**:
   - Dashboard Statistics, User Management, Product & 650 nm Technology Management (+ image upload), Condition Management (+ image upload), and WhatsApp Settings (Business Owner number, notification toggles, customizable templates, delivery status & failed message retries).

---

## Local Development

### Backend (Python FastAPI — `http://localhost:8000`)
```powershell
npm run dev:backend
```

### Frontend (React + Vite — `http://localhost:5173`)
```powershell
npm run dev:frontend
```

- **Website:** `http://localhost:5173`
- **Super Admin Login:** `http://localhost:5173/admin/login`
  - Email: `admin@folibeir.com`
  - Password: `FolibeirAdmin@2026`

### Live Meta WhatsApp Cloud API & MongoDB Atlas
Configure `backend/.env` (see `backend/.env.example`):
- `MONGODB_URI` (MongoDB Atlas connection string)
- `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET`
- `BUSINESS_OWNER_WHATSAPP_NUMBER` (or update live in Super Admin -> WhatsApp Settings)
- Optional: `GOOGLE_CLIENT_ID`, `SMTP_HOST`/`SMTP_USER`/`SMTP_PASSWORD`, and `REDIS_URL` for Celery workers (`celery -A app.workers.celery_app worker --loglevel=info`).
