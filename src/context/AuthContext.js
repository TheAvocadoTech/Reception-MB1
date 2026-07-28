import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/auth.service";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      try {
        const parsed = JSON.parse(savedUser);
        console.log("🔐 [AuthContext] Restored user session from localStorage:", parsed);
        setUser(parsed);
      } catch (err) {
        console.error("❌ [AuthContext] Failed to parse saved user:", err);
      }
    } else {
      console.log("ℹ️ [AuthContext] No active session found in localStorage.");
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    console.log("🔑 [AuthContext] Initiating login for:", credentials.email);
    const response = await authService.login(credentials);
    console.log("📥 [AuthContext] Login response received:", response);
    if (response.success && response.user) {
      console.log("✅ [AuthContext] Setting active user state:", response.user);
      setUser(response.user);
    }
    return response;
  };

  const signup = async (userData) => {
    console.log("📝 [AuthContext] Initiating signup for:", userData.email);
    const response = await authService.signup(userData);
    console.log("📥 [AuthContext] Signup response received:", response);
    if (response.success && response.user) {
      console.log("✅ [AuthContext] Setting active user state after signup:", response.user);
      setUser(response.user);
    }
    return response;
  };

  const logout = () => {
    console.log("🚪 [AuthContext] Logging out user.");
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
