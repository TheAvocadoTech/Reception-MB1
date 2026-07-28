import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationManager } from "react-notifications";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. name@domain.com)";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      NotificationManager.warning("Please correct the errors before submitting", "Validation Error");
      return;
    }

    try {
      setLoading(true);
      const res = await login({ email: email.trim(), password });
      if (res && res.success) {
        NotificationManager.success("Login successful!", "Success");
        navigate("/app/dashboard");
      } else {
        NotificationManager.error(res?.message || "Invalid credentials", "Authentication Failed");
      }
    } catch (err) {
      NotificationManager.error(err.message || "Login failed", "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
      fontFamily: "Inter, sans-serif"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        padding: "36px 32px",
        width: "380px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
        border: "1px solid #e9eaec"
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#ef4444",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "700",
            fontSize: "22px",
            margin: "0 auto 12px"
          }}>
            C
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: "0 0 4px" }}>
            CourseNav System
          </h2>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }} noValidate>
          {/* Email Field */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
              Email Address *
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: errors.email ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                backgroundColor: errors.email ? "#fef2f2" : "#f9fafb",
                fontSize: "14px",
                color: "#1f2937",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            {errors.email && (
              <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
              Password *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: errors.password ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                backgroundColor: errors.password ? "#fef2f2" : "#f9fafb",
                fontSize: "14px",
                color: "#1f2937",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
            {errors.password && (
              <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                {errors.password}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              padding: "13px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading ? "wait" : "pointer",
              marginTop: "4px",
              transition: "background-color 0.15s"
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
