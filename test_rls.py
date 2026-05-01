import requests

BASE_URL = "http://localhost:8000"
KEYCLOAK_TOKEN_URL = "http://localhost:8080/realms/enterprise-ai/protocol/openid-connect/token"

def get_token(role):
    # Using the dummy token simulation from main.py
    return f"dummy-token-{role}"

def test_rls_access(username, role, category):
    print(f"\n--- Testing RLS for role: {role} (Targeting '{category}') ---")
    token = get_token(role)
    if not token:
        print(f"FAILED: Could not get token for {username}")
        return

    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/v1/data/{category}", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Status: {response.status_code}")
        print(f"Enforcement: {data.get('enforcement_layer')}")
        print(f"Rows Returned: {len(data.get('data', [])) if isinstance(data.get('data'), list) else '0'}")
        
        # Verify that no unauthorized categories are in the output
        if isinstance(data.get('data'), list):
            for row in data['data']:
                content = row.get('content')
                cat = row.get('category')
                print(f"  [DB ROW] -> {content} ({cat})")
                
                # Check for Actual Data Leaks
                unauthorized_leaks = ["Finance", "HR", "Engineering", "Legal"]
                unauthorized_leaks.remove(data.get('role', 'Public')) # Current role is okay
                
                if cat in unauthorized_leaks:
                     print(f"  !! SECURITY BREACH: Found {cat} data in {username}'s search !!")
    else:
        print(f"Status: {response.status_code} - {response.json().get('detail')}")

if __name__ == "__main__":
    # Test 1: Engineering Role
    test_rls_access("Alice", "Engineering", "system_logs")
    
    # Test 2: Finance Role
    test_rls_access("Bob", "Finance", "costs")
    
    # Test 3: HR Role
    test_rls_access("Charlie", "HR", "salaries")

    # Test 4: Legal Role
    test_rls_access("Diana", "Legal", "compliance")
    
    # Test 5: Verify that HR CANNOT see Finance rows even if they try
    print("\n--- Testing 'Cross-Department' Restriction ---")
    test_rls_access("Charlie", "HR", "costs")
