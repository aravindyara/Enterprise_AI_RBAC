import requests

# Configuration
KEYCLOAK_URL = "http://localhost:8080/realms/enterprise-ai/protocol/openid-connect/token"
FASTAPI_URL = "http://localhost:8000/me"

def test_rbac():
    print("--- Day 1 Verification Script ---")
    
    # 1. Get Token from Keycloak
    print("\n1. Requesting token from Keycloak...")
    data = {
        "client_id": "fastapi-backend",
        "username": "testuser",
        "password": "password",
        "grant_type": "password"
    }
    
    try:
        response = requests.post(KEYCLOAK_URL, data=data)
        if response.status_code != 200:
            print(f"❌ Failed to get token: {response.text}")
            return
        
        token = response.json().get("access_token")
        print("✅ Token received successfully!")
        
        # 2. Call FastAPI
        print("\n2. Calling FastAPI /me endpoint...")
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        backend_response = requests.get(FASTAPI_URL, headers=headers)
        
        if backend_response.status_code == 200:
            print("🎉 SUCCESS! Layer 1 is fully integrated.")
            print(f"Response: {backend_response.json()}")
        else:
            print(f"❌ FastAPI Error ({backend_response.status_code}): {backend_response.text}")
            
    except Exception as e:
        print(f"❌ Connection Error: {str(e)}")

if __name__ == "__main__":
    test_rbac()
