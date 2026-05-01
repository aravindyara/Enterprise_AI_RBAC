# Keycloak Configuration Guide: Enterprise AI Stack

This guide provides a detailed walkthrough for setting up Keycloak to handle Role-Based Access Control (RBAC) for your FastAPI backend.

---

## 🚀 1. Launching & Access
1.  **Start the Services**: Ensure your containers are running:
    ```bash
    docker-compose up -d
    ```
2.  **Admin Console**: Open your browser and navigate to `http://localhost:8080`.
3.  **Login**: Use the administrator credentials defined in your `docker-compose.yml`:
    -   **Username**: `admin`
    -   **Password**: `admin`

---

## 🏰 2. Create a Realm
A **Realm** is an isolated space where you manage your users, roles, and clients.
1.  Hover over the **master** realm name in the top-left corner.
2.  Click the blue **Create Realm** button.
3.  **Realm name**: `enterprise-ai`.
4.  Click **Create**.
    > [!NOTE]
    > Avoid using the `master` realm for your application. It should be reserved for administrative purposes only.

---

## 🔌 3. Create a Client
A **Client** represents the application (FastAPI) that will be requesting identity information.
1.  In the `enterprise-ai` realm sidebar, click **Clients**.
2.  Click **Create client**.
3.  **Client ID**: `fastapi-backend`.
4.  **Name**: Optional (e.g., "Enterprise AI Backend").
5.  Click **Next**.
6.  **Capability config**:
    -   **Client authentication**: `Off` (Keeping it Public simplifies initial development).
    -   **Authorization**: `Off`.
    -   **Authentication flow**: Keep `Standard flow` and `Direct access grants` checked.
7.  Click **Next**.
8.  **Login settings**:
    -   **Root URL**: `http://localhost:8000` (Your FastAPI app URL).
    -   **Valid redirect URIs**: `http://localhost:8000/*`.
    -   **Web origins**: `+` (Allows CORS from the same origin).
9.  Click **Save**.

---

## 🛡️ 4. Define Realm Roles
Roles are the building blocks of RBAC.
1.  In the sidebar, click **Realm roles**.
2.  Click **Create role**.
3.  **Role name**: `Finance`.
4.  Click **Save**.
5.  Repeat this for `HR` and `Engineering`.
    -   *Optional*: You can add descriptions to explain what each role can access.

---

## 👤 5. Create and Configure a Test User
1.  In the sidebar, click **Users**.
2.  Click **Add user**.
3.  **Username**: `testuser`.
4.  **Email verified**: `On`.
5.  Click **Create**.
6.  Go to the **Credentials** tab:
    -   Click **Set password**.
    -   **Password**: `password`.
    -   **Temporary**: `Off` (Prevents Keycloak from asking for a password change on first login).
    -   Click **Save**, then confirm the popup.
7.  Go to the **Role mapping** tab:
    -   Click **Assign role**.
    -   Filter by "realm roles".
    -   Select `Engineering` (or HR/Finance).
    -   Click **Assign**.

---

## 🔍 6. Verification: Obtain & Inspect the JWT
To prove the setup is working, you can request a token manually and inspect it.

### A. Fetch the Token
Run this command in your terminal:
```bash
curl --location 'http://localhost:8080/realms/enterprise-ai/protocol/openid-connect/token' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'client_id=fastapi-backend' \
--data-urlencode 'username=testuser' \
--data-urlencode 'password=password' \
--data-urlencode 'grant_type=password'
```

### B. Inspect the Token
1.  Copy the `access_token` from the response.
2.  Go to [jwt.io](https://jwt.io).
3.  Paste the token into the **Encoded** box.
4.  Look at the **Payload**:
    -   `sub`: This is the internal Keycloak User ID.
    -   `realm_access.roles`: You should see `["Engineering"]` (or the role you assigned).
    -   `preferred_username`: You should see `testuser`.

If you see these fields, your Keycloak Day 1 setup is 100% successful!
