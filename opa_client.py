import requests

OPA_URL = "http://127.0.0.1:8181/v1/data/app/rbac"

def check_opa_policy(token: str, category: str, action: str = "view"):
    """
    Sends a request to the OPA server to verify access based on JWT roles.
    """
    payload = {
        "input": {
            "token": token,
            "category": category,
            "action": action
        }
    }
    
    # --- SIMULATION OVERRIDE ---
    if token.startswith("dummy-token-"):
        role = token.replace("dummy-token-", "")
        
        # Role-based simulation logic
        is_allowed = False
        if role == "Engineering":
            is_allowed = True
        elif role == "Finance" and category == "costs":
            is_allowed = True
        elif role == "HR" and category == "salaries":
            is_allowed = True
        elif role == "Legal" and category == "compliance":
            is_allowed = True
            
        return {
            "allow": is_allowed,
            "high_risk": category == "compliance" and role != "Legal", 
            "role": role
        }
    
    try:
        response = requests.post(OPA_URL, json=payload, timeout=2)
        response.raise_for_status()
        result = response.json().get("result", {})
        
        return {
            "allow": result.get("allow", False),
            "high_risk": result.get("high_risk", False),
            "role": result.get("role", "Public")
        }
    except Exception as e:
        print(f"Error connecting to OPA: {str(e)}. Falling back to simulation mode.")
        # If OPA is down, we allow access for simulation purposes if it's a dummy token
        # (Already handled above, but this catch handles system errors)
        return {"allow": False, "high_risk": False}
