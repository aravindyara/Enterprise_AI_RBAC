# Nexus AI Security Stack: Final Production Handover

## 🛡️ Project Overview
Nexus is a multi-layered, enterprise-grade AI security dashboard designed to showcase the intersection of **Identity**, **Policy Enforcement**, **Database Rigidity**, and **AI Intelligence**.

The stack enforces strict data isolation using OPA (Open Policy Agent) and Postgres RLS (Row-Level Security), while providing role-aware AI briefings through Google Gemini.

---

## 🏗️ Architecture: The 5-Layer Shield

### Layer 1: Identity & Authentication
- **Engine**: Keycloak (Simulated) / JWT
- **Mechanism**: Every request is validated via an RS256-signed JWT. Roles are extracted from the `realm_access` claim.

### Layer 2: Policy Enforcement (OPA)
- **Engine**: Open Policy Agent
- **Logic**: Written in **Rego** (`policy.rego`). It enforces attribute-based access control (ABAC). For example: "Only roles with 'HR' can view 'salaries' resources."

### Layer 3: AI Intelligence Layer
- **Engine**: Google Gemini-3-Flash
- **Function**: Role-specific "Personalities" (CFO, Legal Counsel, Security Architect) analyze the filtered data stream and provide a 3-step structured briefing:
  1. **Security Posture** (What is happening now?)
  2. **Operational Insights** (What does this mean for the business?)
  3. **Mandatory Actions** (What must be done immediately?)

### Layer 4: Audit Logging & Shield
- **Engine**: Real-time Postgres Audit Stream
- **Function**: Captures every **GRANTED** or **DENIED** attempt. The **Audit Shield** UI visualizes threat density and attack pulses in real-time.

### Layer 5: Enterprise Frontend
- **Engine**: React + Tailwind CSS
- **Features**: 
  - **Glassmorphism UI**: High-premium visual language.
  - **Global Discovery Vault**: Visualizes protected data through secure blurs and OPA locks.
  - **Secure Preview**: HANDSHAKE-validated document viewing.

---

## 🚀 Setup & Deployment

### 1. Requirements
- Python 3.9+
- Node.js 18+
- Gemini API Key (Set as `GEMINI_API_KEY` in `.env`)
- Docker (For Postgres/OPA/Keycloak stack)

### 2. Environment Variables
```bash
GEMINI_API_KEY="your_api_key_here"
GEMINI_MODEL="gemini-3-flash-preview"
DB_URL="postgresql://user:pass@localhost:5432/rbac"
```

### 3. Running the Stack
```powershell
# Start Backend
python main.py

# Start Frontend (in /frontend)
npm run dev
```

---

## 🛡️ Security Protocols
1. **Fail-Safe Default**: If OPA or the Database is unreachable, the system defaults to a **DENY-ALL** posture (or enters a restricted Simulation Mode if active).
2. **Data Sanitization**: No sensitive PII is passed to the AI Layer; only anonymized metadata strings are summarized.
3. **Audit Immutability**: All security decisions are logged instantly to the persistent audit ledger.

**Nexus AI Security Stack** v1.0 • Final Release
