-- 1. Create the table for sensitive enterprise data
CREATE TABLE IF NOT EXISTS enterprise_data (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    allowed_role TEXT NOT NULL
);

-- 2. Clear existing data
TRUNCATE TABLE enterprise_data;

-- 3. Seed the table with role-specific data
INSERT INTO enterprise_data (content, category, allowed_role) VALUES
('Detailed Budget Spreadsheet Q1 2024', 'Finance', 'Finance'),
('Vendor Pricing Negotiated Rates - Cloud', 'Finance', 'Finance'),
('Employee Performance Review - John Doe', 'HR', 'HR'),
('Employee Salary Revision List 2024', 'HR', 'HR'),
('System Architecture Diagram v2.1', 'Engineering', 'Engineering'),
('Database Connection String - Staging', 'Engineering', 'Engineering'),
('Public Company Holiday List 2024', 'Public', 'Engineering'),
('Public Company Holiday List 2024', 'Public', 'Finance'),
('Public Company Holiday List 2024', 'Public', 'HR'),
('Vendor Security Contract v1.2', 'Legal', 'Legal'),
('GDPR Compliance Report 2024', 'Legal', 'Legal'),
('Pending IP Litigation Status', 'Legal', 'Legal');

-- 4. Enable Row Level Security (RLS)
ALTER TABLE enterprise_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_data FORCE ROW LEVEL SECURITY;

-- 5. Create a policy for Role-Based Access
-- Updated to support multiple roles (cross-functional)
DROP POLICY IF EXISTS role_based_access_policy ON enterprise_data;
CREATE POLICY role_based_access_policy ON enterprise_data
    USING (allowed_role = ANY (string_to_array(current_setting('app.current_roles', true), ',')));

-- 6. Create a RESTRICTED user (No superuser/bypass privileges)
-- We check if the user exists first to avoid errors on re-runs
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'ai_enforcement_user') THEN
    CREATE USER ai_enforcement_user WITH PASSWORD 'secure_pass_123';
  END IF;
END
$$;

-- 7. Grant MINIMAL permissions to the new user
GRANT USAGE ON SCHEMA public TO ai_enforcement_user;
GRANT SELECT ON enterprise_data TO ai_enforcement_user;

-- 8. Create the Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    access_granted BOOLEAN NOT NULL,
    details TEXT,
    client_ip TEXT
);

-- Grant permissions for the enforcement user to log audit entries
GRANT INSERT, SELECT ON audit_logs TO ai_enforcement_user;
GRANT USAGE, SELECT ON SEQUENCE audit_logs_id_seq TO ai_enforcement_user;
