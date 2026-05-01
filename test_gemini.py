import os
from ai_agent import summarize_with_ai

def test_gemini_connection():
    print("--- Nexus AI Bridge Verification ---")
    
    # Sample data
    role = "Finance"
    category = "costs"
    data = [
        {"content": "Cloud Infra: $12,000"},
        {"content": "Database Storage: $2,500"}
    ]
    
    print(f"Role: {role} | Category: {category}")
    print("Connecting to Gemini Cloud...")
    
    try:
        summary = summarize_with_ai(role, category, data)
        print("\n[SUCCESS] AI Summary Received:")
        print("-" * 30)
        print(summary)
        print("-" * 30)
    except Exception as e:
        print(f"\n[ERROR] Connection failed: {e}")

if __name__ == "__main__":
    test_gemini_connection()
