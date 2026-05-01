import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));

  useEffect(() => {
    if (token) {
      if (token.startsWith('dummy-token-')) {
        // Handle simulation/demo tokens
        const role = token.replace('dummy-token-', '');
        setUser({
          username: `Demo_${role}_User`,
          role: role,
          id: 'demo-uuid'
        });
        localStorage.setItem('access_token', token);
      } else {
        try {
          const decoded = jwtDecode(token);
          // Extract realm roles from Keycloak JWT format
          const roles = decoded.realm_access?.roles || [];
          
          // Map Keycloak roles to our dashboard roles
          let role = 'Public';
          if (roles.includes('Finance')) role = 'Finance';
          else if (roles.includes('HR')) role = 'HR';
          else if (roles.includes('Engineering')) role = 'Engineering';
          else if (roles.includes('Legal')) role = 'Legal';

          setUser({
            username: decoded.preferred_username,
            role: role,
            id: decoded.sub
          });
          localStorage.setItem('access_token', token);
        } catch (err) {
          console.error("Invalid token", err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('access_token');
        }
      }
    }
  }, [token]);

  const login = (newToken) => setToken(newToken);
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
