import React, { createContext, useState, useEffect, useContext } from "react";

/**
 * Authentication context for managing JWT and current user state.
 * Provides: user, token, login(), logout(), register(), error, loading
 */

// PUBLIC_INTERFACE
const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  return useContext(AuthContext);
}

// Simple backend base URL (adjust as needed)
const BACKEND_API = "http://localhost:3001";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("jwt") || null);
  const [user, setUser] = useState(() => localStorage.getItem("user") || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist token and user in localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem("jwt", token);
    } else {
      localStorage.removeItem("jwt");
    }
    if (user) {
      localStorage.setItem("user", user);
    } else {
      localStorage.removeItem("user");
    }
  }, [token, user]);

  // PUBLIC_INTERFACE
  async function login(username, password) {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${BACKEND_API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (resp.status === 200) {
        const data = await resp.json();
        setToken(data.access_token);
        setUser(username);
        setLoading(false);
        return { success: true };
      } else {
        const err = await resp.json();
        setError(err.detail || "Login failed");
        setLoading(false);
        return { success: false, error: err.detail };
      }
    } catch (e) {
      setError("Network error");
      setLoading(false);
      return { success: false, error: "Network error" };
    }
  }

  // PUBLIC_INTERFACE
  async function register(username, password) {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${BACKEND_API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (resp.status === 201) {
        const data = await resp.json();
        setToken(data.access_token);
        setUser(username);
        setLoading(false);
        return { success: true };
      } else {
        const err = await resp.json();
        setError(err.detail || "Registration failed");
        setLoading(false);
        return { success: false, error: err.detail };
      }
    } catch (e) {
      setError("Network error");
      setLoading(false);
      return { success: false, error: "Network error" };
    }
  }

  // PUBLIC_INTERFACE
  function logout() {
    setToken(null);
    setUser(null);
    setError(null);
    // Optionally clear localStorage here if needed
  }

  const value = {
    isAuthenticated: !!token,
    user,
    token,
    login,
    logout,
    register,
    loading,
    error,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
