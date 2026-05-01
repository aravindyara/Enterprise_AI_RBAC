import streamlit as st
import requests
import pandas as pd

st.set_page_config(page_title="Nexus AI - Security Dashboard", page_icon="🛡️", layout="wide")

# --- CUSTOM CSS FOR BRANDING ---
st.markdown("""
    <style>
    .main {
        background-color: #0f172a;
        color: white;
    }
    .stButton>button {
        width: 100%;
        border-radius: 12px;
        height: 3em;
        font-weight: bold;
    }
    </style>
    """, unsafe_allow_html=True)

# --- SIDEBAR: ROLE SIMULATION ---
st.sidebar.title("🛡️ Nexus Gate")
st.sidebar.subheader("JWT Simulation Layer")

test_role = st.sidebar.selectbox(
    "Select Active Security Role:",
    ["Finance", "HR", "Legal"]
)

st.sidebar.divider()
st.sidebar.info(f"**Current Context:** {test_role}\n\n**JWT Header:** Bearer dummy-token-{test_role}")

# Connection Status
backend_url = "http://localhost:8000"
try:
    response = requests.get(f"{backend_url}/me", headers={"Authorization": f"Bearer dummy-token-{test_role}"})
    if response.status_code == 200:
        st.sidebar.success("✅ Layer 2: Backend Connected")
    else:
        st.sidebar.error("❌ Layer 2: API Error")
except:
    st.sidebar.warning("⚠️ Layer 2: Backend Offline")

# --- MAIN UI ---
st.title(f"🚀 Enterprise AI Workspace: {test_role} Sector")
st.markdown("---")

# User Query Input
query = st.text_input("Ask a security-cleared question to Layer 3 (Ollama):", 
                     placeholder=f"e.g., 'Summarize recent {test_role.lower()} updates'")

# Logic to handle different categories based on role
category_map = {"Finance": "Financials", "HR": "Personnel", "Legal": "Compliance"}
active_category = category_map.get(test_role)

if st.button(f"Generate AI Insight for {test_role}"):
    with st.spinner("Decrypting and Analyzing via Ollama..."):
        headers = {"Authorization": f"Bearer dummy-token-{test_role}"}
        
        # 1. Fetch RAW RLS Data
        data_resp = requests.get(f"{backend_url}/v1/data/{active_category}", headers=headers)
        
        # 2. Fetch AI Summary
        ai_resp = requests.post(f"{backend_url}/v1/ai/summarize/{active_category}", headers=headers)

        # 3. Handle Rendering
        if data_resp.status_code == 200 and ai_resp.status_code == 200:
            res_data = data_resp.json()
            data = res_data.get("data", [])
            ai_insight = ai_resp.json().get("ai_insight", "No AI insight generated.")
            
            # --- CONDITIONAL VIEW LOGIC (Requirement 2) ---
            if test_role == "Finance":
                st.success("**Financial Data Table**")
                if isinstance(data, list) and data:
                    df = pd.DataFrame(data)
                    st.table(df)
                else:
                    st.info(data if isinstance(data, str) else "No financials found.")
                st.markdown(f"### AI Summary\n{ai_insight}")

            elif test_role == "HR":
                st.info("**HR Scorecard Metrics**")
                cols = st.columns(len(data) if isinstance(data, list) and data else 1)
                if isinstance(data, list) and data:
                    for i, item in enumerate(data):
                        with cols[i]:
                            st.metric(label=f"Metric {i+1}", value=item.get("content", "N/A"))
                st.markdown(f"### Personnel Insight\n{ai_insight}")

            elif test_role == "Legal":
                st.warning("**Compliance Risk Matrix**")
                st.markdown(f"### High Priority Audit Summary")
                st.warning(ai_insight)
                # Show raw compliance data in a structured way
                if isinstance(data, list):
                    for item in data:
                        st.error(f"🚩 RISK LOG: {item.get('content')}")
        
        else:
            if data_resp.status_code != 200:
                st.error(f"Layer 2/4 Error: Data Fetch Failed (Status: {data_resp.status_code})")
            if ai_resp.status_code != 200:
                st.error(f"Layer 3 Error: AI Summary Failed (Status: {ai_resp.status_code})")

# Footer
st.markdown("---")
st.caption("Nexus AI RBAC Stack - Layer 5 (Streamlit Edition)")
