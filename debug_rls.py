import psycopg2

DB_CONFIG = {
    "dbname": "keycloak",
    "user": "keycloak",
    "password": "password123",
    "host": "localhost",
    "port": "5432"
}

def debug_rls():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # 1. Check current role (undetermined)
        cur.execute("SELECT current_setting('app.current_role', true);")
        print(f"Initial role: '{cur.fetchone()[0]}'")
        
        # 2. Set role to Finance
        cur.execute("SELECT set_config('app.current_role', 'Finance', false);")
        cur.execute("SELECT current_setting('app.current_role', true);")
        print(f"Role after setting Finance: '{cur.fetchone()[0]}'")
        
        # 3. Query enterprise_data
        print("\n--- Querying enterprise_data as 'Finance' ---")
        cur.execute("SELECT content, allowed_role FROM enterprise_data;")
        rows = cur.fetchall()
        for r in rows:
            print(f" Row: {r[0]} | Role: {r[1]}")
            
        # 4. Check if RLS is actually enabled and forced
        cur.execute("SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'enterprise_data';")
        info = cur.fetchone()
        print(f"\nTable Health Check: RLS={info[1]}, FORCE={info[2]}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    debug_rls()
