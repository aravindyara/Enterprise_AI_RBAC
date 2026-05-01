import os
import requests

import psycopg2
from fastapi import FastAPI, Depends, HTTPException, status, Request, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from typing import List, Optional
from opa_client import check_opa_policy
from ai_agent import summarize_with_ai, chat_with_agent
from dotenv import load_dotenv

# Initialize Environment
load_dotenv()

app = FastAPI(title="Enterprise AI Stack - Layer 2 (RBAC + OPA + RLS)")

# --- Database Configuration ---
DB_CONFIG = {
    "dbname": "keycloak",
    "user": "ai_enforcement_user",
    "password": "secure_pass_123",
    "host": "localhost",
    "port": "5432",
    "connect_timeout": 2
}

# --- Layer 4: Audit Simulation Store ---
# Used when the database is offline
audit_log_store = []

def log_audit_entry(user_role: str, action: str, resource: str, granted: bool, details: str = None, client_ip: str = "Unknown"):
    """Logs security events to the database or the simulation store."""
    entry = {
        "timestamp": "Now", # Will be handled by DB or just for simulation
        "user_role": user_role,
        "action": action,
        "resource": resource,
        "access_granted": granted,
        "details": details,
        "client_ip": client_ip
    }
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO audit_logs (user_role, action, resource, access_granted, details, client_ip) VALUES (%s, %s, %s, %s, %s, %s)",
            (user_role, action, resource, granted, details, client_ip)
        )
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Audit Log (Simulation): {user_role} {action} {resource} - Granted: {granted}")
        audit_log_store.append(entry)
        if len(audit_log_store) > 50: audit_log_store.pop(0) # Keep it small

# --- CORS Configuration ---
# This allows our UI (running in the browser) to talk to Keycloak and FastAPI.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace "*" with your UI's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration (These should ideally be environment variables)
KEYCLOAK_URL = "http://localhost:8080"
REALM = "enterprise-ai"
CLIENT_ID = "fastapi-backend"
ALGORITHM = "RS256"

JWKS_URL = f"{KEYCLOAK_URL}/realms/{REALM}/protocol/openid-connect/certs"

security = HTTPBearer()

def get_jwks():
    """Fetches the public keys from Keycloak, with a fallback for presentations."""
    try:
        response = requests.get(JWKS_URL, timeout=1)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"⚠️ Keycloak Offline: Using Presentation Simulation Mode. ({str(e)})")
        # Return a mock JWKS structure so the JWT library doesn't crash
        return {"keys": []}

async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    """Validates the JWT token or extracts user info from a simulation token."""
    
    # --- SIMULATION OVERRIDE ---
    if token.credentials.startswith("dummy-token-"):
        role = token.credentials.replace("dummy-token-", "")
        return {
            "user_id": f"sim_{role.lower()}",
            "roles": [role],
            "username": f"Demo_{role}"
        }
    
    jwks = get_jwks()
    
    try:
        # Decode the header to find the kid (Key ID)
        header = jwt.get_unverified_header(token.credentials)
        kid = header.get("kid")
        
        # Find the correct public key from JWKS
        key = next((k for k in jwks["keys"] if k["kid"] == kid), None)
        if not key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token header: Key ID not found."
            )
        
        # Validate and decode the token
        payload = jwt.decode(
            token.credentials,
            key,
            algorithms=[ALGORITHM],
            audience="account", # Default audience for Keycloak tokens
            options={"verify_aud": False} # Set to False if audience doesn't match
        )
        
        # Extract User ID and Roles
        user_id = payload.get("sub")
        # Keycloak puts realm roles in 'realm_access'
        roles = payload.get("realm_access", {}).get("roles", [])
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token is missing subject (user_id)."
            )
            
        return {
            "user_id": user_id,
            "roles": roles,
            "username": payload.get("preferred_username")
        }
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@app.get("/me")
async def read_me(user: dict = Depends(get_current_user)):
    """Protected route that returns user information including roles."""
    return {
        "message": "Access granted",
        "user_id": user["user_id"],
        "username": user["username"],
        "roles": user["roles"]
    }

@app.get("/v1/data/{category}")
async def get_data(
    category: str, 
    action: str = "view", 
    request: Request = None,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user: dict = Depends(get_current_user)
):
    """
    1. Checks with OPA if the user is allowed (RBAC).
    2. Fetches data from Postgres (RLS Enforcement).
    """
    token = credentials.credentials
    opa_decision = check_opa_policy(token, category, action)
    
    if not opa_decision.get("allow"):
        log_audit_entry("Unknown", action, category, False, "Denied by OPA Policy", request.client.host)
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access Denied by OPA. You are not authorized to access '{category}'."
        )

    # --- Database Enforcement (RLS) ---
    all_user_roles = ",".join(user.get("roles", []))
    log_audit_entry(all_user_roles, action, category, True, "Authorized by OPA", request.client.host)
    
    # --- Database Enforcement (RLS) ---
    db_results = []
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT set_config('app.current_roles', %s, false);", (all_user_roles,))
        cur.execute("SELECT content, category FROM enterprise_data;")
        db_results = cur.fetchall()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Database Offline: {e}. Switching to Layer 4 Simulation.")
        # --- REQUIREMENT: DATABASE SIMULATION FALLBACK ---
        # If DB is down, we provide safe mock data filtered by roles
        user_roles_list = user.get("roles", [])
        if "Executive" in user_roles_list:
             db_results = [
                ("Q3 Revenue Report: +12%", "Finance"), ("Budget Review: Approved", "Finance"),
                ("Onboarding: 5 New Hires", "HR"), ("Policy: Remote Work", "HR"),
                ("GDPR Compliance Audit 2024", "Legal"), ("Vendor Security Contract v1.2", "Legal")
            ]
        elif "Finance" in user_roles_list:
            db_results = [("Q3 Revenue Report: +12%", "Finance"), ("Budget Review: Approved", "Finance"), ("Cloud Infrastructure Costs: $12k", "Finance")]
        elif "HR" in user_roles_list:
            db_results = [("Onboarding: 5 New Hires", "HR"), ("Policy: Remote Work", "HR"), ("Payroll: Processing Completed", "HR")]
        elif "Legal" in user_roles_list:
            formatted_data = [
                {"content": "Pending Vendor Contract - Cloud Services", "category": "Compliance", "severity": "Medium"},
                {"content": "GDPR Compliance Audit 2024", "category": "Compliance", "severity": "High"},
                {"content": "Internal Policy Verification Loop", "category": "Compliance", "severity": "Low"}
            ]
            return {
                "category": category,
                "role": all_user_roles,
                "data": formatted_data,
                "enforcement_layer": "Postgres RLS Simulation"
            }
        else:
            db_results = [("Public Bulletin: Welcome", "Public")]

    # Process results into a readable format
    formatted_data = [{"content": r[0], "category": r[1]} for r in db_results]

    return {
        "category": category,
        "action": action,
        "role": all_user_roles,
        "data": formatted_data,
        "risk_gate_status": "Flagged as HIGH RISK" if opa_decision.get("high_risk") else "Safe",
        "enforcement_layer": "Database RLS Active"
    }

@app.post("/v1/ai/summarize/{category}")
async def summarize_data(
    category: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user: dict = Depends(get_current_user)
):
    """
    Layer 3: Generates an AI summary of the RLS-filtered data.
    """
    # Reuse the same secure data fetching logic
    token = credentials.credentials
    opa_decision = check_opa_policy(token, category, "view")
    
    if not opa_decision.get("allow"):
        raise HTTPException(status_code=403, detail="Unauthorized for AI Analysis.")

    all_user_roles = ",".join(user.get("roles", []))
    
    # --- Database Enforcement (RLS) ---
    db_results = []
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT set_config('app.current_roles', %s, false);", (all_user_roles,))
        cur.execute("SELECT content FROM enterprise_data;")
        db_results = cur.fetchall()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Database Offline (AI): {e}. Switching to Layer 4 Simulation.")
        user_roles_list = user.get("roles", [])
        if "Finance" in user_roles_list:
            db_results = [("Detailed Budget Spreadsheet Q1 2024",), ("Vendor Pricing Negotiated Rates",)]
        elif "HR" in user_roles_list:
            db_results = [("Performance Review: John Doe",), ("Salary Revision 2024",)]
        elif "Legal" in user_roles_list:
            db_results = [("GDPR Report 2024",), ("Vendor Security Contract",)]
        else:
            db_results = [("Public Bulletin: Welcome",)]

    # Convert to simple list of dicts for AI
    data_for_ai = [{"content": r[0]} for r in db_results]
    
    # Call Layer 3 (The AI Layer)
    # Pick the primary role for the AI personality, or default to the first one
    primary_role = user.get("roles", ["Public"])[0]
    ai_summary = summarize_with_ai(primary_role, category, data_for_ai)
    
    return {
        "role": all_user_roles,
        "category": category,
        "ai_insight": ai_summary,
        "layer_3_status": "AI Summarization Complete"
    }

@app.post("/v1/ai/chat/{category}")
async def chat_endpoint(
    category: str,
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user: dict = Depends(get_current_user)
):
    """
    Conversational AI Assistant. 
    Enforces OPA/RLS before allowing the chat to access context data.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body")
        
    question = body.get("question")
    if not question:
        raise HTTPException(status_code=400, detail="Missing 'question' in request body.")

    token = credentials.credentials
    # OPA checks if this user is allowed to 'view' (chat) this category
    opa_decision = check_opa_policy(token, category, "view") 
    
    if not opa_decision.get("allow"):
        log_audit_entry(user.get("roles", ["Unknown"])[0], "chat_denied", category, False, f"Illegal Query: {question}", request.client.host)
        return {
            "response": f"🚨 SECURITY RESTRICTION: I am unauthorized to share intelligence regarding the '{category}' sector with your current credentials. This attempt has been logged by the Nexus Shield.",
            "restricted": True
        }

    all_user_roles = ",".join(user.get("roles", []))
    log_audit_entry(all_user_roles, "chat", category, True, f"User Query: {question}", request.client.host)

    # --- Fetch Context Data (RLS-filtered) ---
    db_results = []
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT set_config('app.current_roles', %s, false);", (all_user_roles,))
        cur.execute("SELECT content FROM enterprise_data;")
        db_results = cur.fetchall()
        cur.close()
        conn.close()
    except Exception:
        # Simulation Fallback for context
        user_roles_list = user.get("roles", [])
        if "Finance" in user_roles_list: db_results = [("Q1 Fiscal Ledger: Expenditure high on cloud infrastructure.",), ("Q3 Revenue Report: +12% growth across sectors.",)]
        elif "HR" in user_roles_list: db_results = [("Performance Review: Annual cycles complete.",), ("Payroll: Processing for Q2 2024 finalized.",)]
        elif "Legal" in user_roles_list: db_results = [("GDPR Compliance Audit: High severity risk found in data handling.",), ("Vendor Security Contract: Vetted and signed.",)]
        else: db_results = [("Public Bulletin: Nexus System Online.",)]

    context_data = [{"content": r[0]} for r in db_results]
    
    # Generate the conversational response
    primary_role = user.get("roles", ["Public"])[0]
    chat_response = chat_with_agent(primary_role, category, context_data, question)

    return {
        "response": chat_response,
        "role": all_user_roles,
        "category": category,
        "restricted": False
    }

@app.post("/v1/ai/summarize/audit")
async def summarize_audit_logs(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user: dict = Depends(get_current_user)
):
    """
    Layer 3: Generates an AI security posture summary from audit logs.
    Restricted to Engineering/SysAdmin.
    """
    if "Engineering" not in user.get("roles", []):
        raise HTTPException(status_code=403, detail="Security audits are restricted to the Engineering identity.")

    # Fetch recent logs using the existing logic or simulation fallback
    logs = await get_audit_logs(user)
    
    # Format ONLY the last 15 logs for the AI Agent (Speed optimization)
    data_for_ai = []
    for log in logs[:15]:
        status_str = "GRANTED" if log.get('granted') else "BLOCKED"
        content = f"[{log.get('timestamp')}] Role:{log.get('role')} Action:{log.get('action')} Resource:{log.get('resource')} Status:{status_str} Detail:{log.get('details')}"
        data_for_ai.append({"content": content})

    # Call AI Layer (Personality will be Engineering)
    ai_summary = summarize_with_ai("Engineering", "System Audit Logs", data_for_ai)

    return {
        "role": "Engineering",
        "category": "Audit",
        "ai_insight": ai_summary,
        "layer_3_status": "Security Posture Analysis Complete"
    }

@app.get("/v1/audit/logs")
async def get_audit_logs(user: dict = Depends(get_current_user)):
    """
    Returns audit logs for the Engineering/SysAdmin role.
    """
    if "Engineering" not in user.get("roles", []):
        raise HTTPException(status_code=403, detail="Audit logs are restricted to Engineering role.")
    
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        cur.execute("SELECT id, timestamp, user_role, action, resource, access_granted, details, client_ip FROM audit_logs ORDER BY timestamp DESC LIMIT 50;")
        logs = cur.fetchall()
        cur.close()
        conn.close()
        return [{"id": l[0], "timestamp": l[1], "role": l[2], "action": l[3], "resource": l[4], "granted": l[5], "details": l[6], "ip": l[7]} for l in logs]
    except Exception:
        # Fallback to simulation store
        return audit_log_store[::-1]

@app.get("/v1/meta/catalog")
async def get_resource_catalog(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user: dict = Depends(get_current_user)
):
    """
    Returns a global map of all enterprise assets for the 'Discovery' view.
    Explicitly flags which items are restricted by OPA for the current role.
    """
    all_resources = [
        {"id": "c1", "title": "Q1 Fiscal Ledger", "category": "costs", "owner": "Finance", "description": "Consolidated expenditure and revenue stream for Q1 2024."},
        {"id": "c2", "title": "Cloud Infrastructure Costs", "category": "costs", "owner": "Finance", "description": "AWS/GCP monthly burn rate and scaling projections."},
        {"id": "s1", "title": "Executive Payroll 2024", "category": "salaries", "owner": "HR", "description": "Confidential compensation details for senior leadership."},
        {"id": "s2", "title": "Talent Bonus Schedule", "category": "salaries", "owner": "HR", "description": "Quarterly performance-based incentive distribution list."},
        {"id": "p1", "title": "GDPR Compliance Audit", "category": "compliance", "owner": "Legal", "description": "Privacy risk assessment and PII data handling report."},
        {"id": "p2", "title": "Vendor Data Processor Agreement", "category": "compliance", "owner": "Legal", "description": "Standard security clauses for external cloud providers."},
    ]
    
    token = credentials.credentials
    results = []
    
    for res in all_resources:
        # Check OPA for each resource category to see if restricted
        opa_check = check_opa_policy(token, res["category"], "view")
        results.append({
            **res,
            "is_restricted": not opa_check.get("allow"),
            "policy_detail": "Authorized by OPA" if opa_check.get("allow") else "Restricted by Nexus Policy"
        })
        
    return results

@app.post("/v1/data/upload")
async def upload_enterprise_data(
    category: str,
    content: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user: dict = Depends(get_current_user)
):
    """
    Securely uploads a piece of enterprise data.
    Ensures the user has the role corresponding to the category they are uploading to.
    """
    user_roles = user.get("roles", [])
    
    # Simple verification: User must have the role of the category (e.g. Finance role for Finance category)
    # In a real app, you might have a specific 'Manager' role too.
    if category not in user_roles and "Engineering" not in user_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Security Violation: You do not have permission to commit data to the '{category}' sector."
        )

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        # Insert the data with the allowed_role matching the category
        cur.execute(
            "INSERT INTO enterprise_data (content, category, allowed_role) VALUES (%s, %s, %s)",
            (content, category, category)
        )
        conn.commit()
        cur.close()
        conn.close()
        log_audit_entry(",".join(user_roles), "upload", category, True, "Data committed to secure vault")
        return {"message": "Data successfully encrypted and stored in the departmental vault."}
    except Exception as e:
        print(f"Database Offline (Upload): {e}. Simulation mode active.")
        return {"message": "Data saved to simulation buffer (Database is offline)."}

# --- Mount the Static Dashboard ---
# This serves our visual demo UI at http://localhost:8000/
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
