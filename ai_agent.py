import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load Environment Variables
load_dotenv()

# --- AI Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# Configure the Gemini SDK
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

PERSONALITY_MAP = {
    "Legal": {
        "title": "Nexus Chief Legal Counsel",
        "tone": "Ultra-formal, ultra-precise, and hyper-vigilant about liability.",
        "focus": "Regulatory gaps, contractual exposure, and intellectual property protection."
    },
    "Finance": {
        "title": "Chief Financial Intelligence Officer",
        "tone": "Vested, data-driven, and focused on ROI/efficiency.",
        "focus": "Burn rate, cost optimization, revenue leakage, and fiscal forecasting."
    },
    "HR": {
        "title": "Global People Operations Lead",
        "tone": "Supportive, culture-centric, and focused on compliance/retention.",
        "focus": "Employee sentiment, policy adherence, and talent management risk."
    },
    "Engineering": {
        "title": "Principal Security Architect",
        "tone": "Technical, cold-logic, and zero-trust oriented.",
        "focus": "Threat vectors, access anomalies, and system integrity logs."
    }
}

def summarize_with_ai(role: str, category: str, data_rows: list):
    """
    Takes RLS-filtered data and generates a role-aware summary using Gemini Cloud.
    """
    profile = PERSONALITY_MAP.get(role, {"title": "Nexus Assistant", "tone": "Professional", "focus": "Business value"})
    
    data_text = "\n".join([f"- {row['content']}" for row in data_rows]) if data_rows else "NO DATA AVAILABLE"
    
    prompt = f"""
    You are the '{profile['title']}'. 
    Operational Persona: {profile['tone']}
    Strategic Focus: {profile['focus']}

    TASK: Provide a HIGH-SPEED intelligence brief of the '{category}' data provided below. 
    ENFORCEMENT: Be surgical. No conversational fillers.

    MANDATORY STRUCTURE:
    1. CURRENT SECURITY POSTURE: [State 1 specific trend or risk level in 1 sentence]
    2. OPERATIONAL INSIGHTS: [List 2-3 high-impact observations]
    3. MANDATORY ACTION: [State 1-2 critical next steps]

    DATA FEED:
    {data_text}
    """

    if not GEMINI_API_KEY:
        print("Nexus AI Key Missing. Using Simulation Layer.")
        return simulate_ai_response(role, category, data_rows)

    try:
        model = genai.GenerativeModel(
            model_name=GEMINI_MODEL,
            generation_config={
                "temperature": 0.2, # Lower temperature for even faster/more direct response
                "top_p": 0.9,
                "max_output_tokens": 300, # Reduced for speed
            }
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Cloud AI Bridge Offline: {e}. Falling back to Simulation.")
        return simulate_ai_response(role, category, data_rows)

def chat_with_agent(role: str, category: str, data_rows: list, question: str):
    """
    Conversational interface that answers departmental questions using RLS data.
    """
    profile = PERSONALITY_MAP.get(role, {"title": "Nexus Assistant", "tone": "Professional", "focus": "Business value"})
    
    # Format context from database records
    context_text = "\n".join([f"- {row['content']}" for row in data_rows]) if data_rows else "NO CONTEXT DATA FOUND IN YOUR SEGMENT"
    
    prompt = f"""
    You are the '{profile['title']}' Virtual Assistant.
    Operational Persona: {profile['tone']}
    Strategic Focus: {profile['focus']}

    TASK: Answer the following USER QUESTION using ONLY the provided DEPARTMENTAL RECORDS.
    
    SECURITY PROTOCOLS:
    1. If the context is empty, state that the data segment is locked or unavailable.
    2. If the user asks for information outside of '{role}' or '{category}', refuse to answer and cite OPA/RLS restrictions.
    3. Be conversational and helpful, but professional.

    DEPARTMENTAL RECORDS (CONTEXT):
    {context_text}

    USER QUESTION:
    {question}

    RESPONSE (Keep it concise and clear):
    """

    if not GEMINI_API_KEY:
        return f"(Simulation) As your {role} Assistant, I've reviewed our records. Regarding '{question}': Based on our {category} data, I can see {len(data_rows)} relevant items. Please connect a valid Gemini API key for detailed natural language analysis."

    try:
        model = genai.GenerativeModel(model_name=GEMINI_MODEL)
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"System Error: Chat engine currently disconnected ({str(e)}). Audit logs remain active."

def simulate_ai_response(role: str, category: str, data_rows: list):
    """
    Fallback simulation for demo purposes.
    """
    if not data_rows:
        return f"Hello! No {category} information found for the {role} department currently."

    summary = f"Hello! (Simulation Mode) Here is your {category} update for {role}:\n\n"
    for row in data_rows:
        summary += f"- {row['content']}\n"
    return summary
