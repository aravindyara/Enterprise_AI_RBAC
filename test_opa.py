import requests

KEYCLOAK_URL = "http://localhost:8080/realms/enterprise-ai/protocol/openid-connect/token"
BASE_URL = "http://localhost:8000/v1/data"

def get_token():
    data = {
        "client_id": "fastapi-backend",
        "username": "testuser",
        "password": "password",
        "grant_type": "password"
    }
    response = requests.post(KEYCLOAK_URL, data=data)
    return response.json().get("access_token")

def test_opa():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print("--- Day 2: OPA RBAC & Risk Gate Verification ---\n")

    # Test 1: Authorized access (Engineering -> system_logs)
    print("Test 1: Engineering user accessing 'system_logs'...")
    res1 = requests.get(f"{BASE_URL}/system_logs", headers=headers)
    print(f"Response: {res1.status_code} - {res1.json()}\n")

    # Test 2: Unauthorized access (Engineering -> salaries)
    print("Test 2: Engineering user accessing 'salaries' (HR data)...")
    res2 = requests.get(f"{BASE_URL}/salaries", headers=headers)
    print(f"Response: {res2.status_code} - {res2.json()}\n")

    # Test 3: Risk Gate (Engineering -> system_logs WITH delete action)
    print("Test 3: Engineering user attempting 'delete_record' on 'system_logs'...")
    res3 = requests.get(f"{BASE_URL}/system_logs?action=delete_record", headers=headers)
    print(f"Response: {res3.status_code} - {res3.json()}\n")

    # Test 4: Public access (Plumbing check)
    print("Test 4: Checking public access (plumbing check)...")
    res4 = requests.get(f"{BASE_URL}/public", headers=headers)
    print(f"Response: {res4.status_code} - {res4.json()}\n")

if __name__ == "__main__":
    test_opa()
