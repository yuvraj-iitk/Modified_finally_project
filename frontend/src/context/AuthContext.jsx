import { createContext, useContext, useEffect, useState } from "react";
import { keycloak } from "../keycloak";
import { api } from "../api";
const AuthContext = createContext(null);
let initialization;
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    initialization ||= keycloak.init({
      pkceMethod: "S256",
      checkLoginIframe: false,
    });
    initialization
      .then(async (authenticated) => {
        if (authenticated) {
          const profile = await api("/me");
          if (active) setUser(profile);
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Could not connect to Keycloak.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    keycloak.onAuthLogout = () => {
      setUser(null);
    };
    return () => {
      active = false;
    };
  }, []);
  const login = async () => {
    try {
      await keycloak.login({ redirectUri: `${window.location.origin}/` });
    } catch (err) {
      setError(err.message || "Login failed.");
    }
  };
  // Use the same root URL for login and logout redirects.
  const logout = async () => {
    try {
      await keycloak.logout({ redirectUri: `${window.location.origin}/` });
    } catch (err) {
      setError(err.message || "Logout failed.");
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
