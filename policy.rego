package app.rbac

import rego.v1

# Default deny
default allow := false
default high_risk := false

# Allow rules
allow if role

# The specific role that was used to grant access
role := r if {
    r := user_roles[_]
    all_permissions[r][input.category]
}

# Risk flagging
high_risk if {
    input.action == "delete_record"
}

high_risk if {
    input.action == "approve_budget"
}

# Helper to extract roles from JWT
user_roles contains role if {
    [_, payload, _] := io.jwt.decode(input.token)
    role := payload.realm_access.roles[_]
}

# Permission Mapping
all_permissions := {
    "Finance": {"costs": true, "budgets": true, "vendor_pricing": true},
    "HR": {"candidate_profiles": true, "salaries": true, "headcount": true},
    "Engineering": {"jira_tickets": true, "system_logs": true, "tech_specs": true},
    "Legal": {"compliance": true, "contracts": true, "risks": true},
    "Executive": {
        "costs": true, "budgets": true, "vendor_pricing": true,
        "candidate_profiles": true, "salaries": true, "headcount": true,
        "jira_tickets": true, "system_logs": true, "tech_specs": true,
        "compliance": true, "contracts": true, "risks": true
    }
}
