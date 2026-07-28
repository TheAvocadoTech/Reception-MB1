import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationManager } from "react-notifications";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Receptionist");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      NotificationManager.warning("Full name, email and password are required", "Warning");
      return;
    }

    try {
      setLoading(true);
      const res = await signup({ fullName, email, password, role });
      if (res && res.success) {
        NotificationManager.success("Account created successfully!", "Success");
        navigate("/app/dashboard");
      } else {
        NotificationManager.error(res?.message || "Registration failed", "Error");
      }
    } catch (err) {
      NotificationManager.error(err.message || "Registration failed", "Error");
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
        padding: "40px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
        boxSizing: "border-box"
      }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#ef4444",
            borderRadius: "14px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "800",
            fontSize: "24px",
            marginBottom: "12px"
          }}>
            C
          </div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1f2937", margin: 0 }}>Create Account</h2>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Register to CourseNavigation System</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                fontSize: "14px",
                color: "#1f2937",
                outline: "none",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
              Email Address *
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                fontSize: "14px",
                color: "#1f2937",
                outline: "none",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
              Password *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                fontSize: "14px",
                color: "#1f2937",
                outline: "none",
                boxSizing: "border-box"
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", marginBottom: "6px" }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                backgroundColor: "#f9fafb",
                fontSize: "14px",
                color: "#1f2937",
                outline: "none",
                boxSizing: "border-box"
              }}
            >
              <option value="Receptionist">Receptionist</option>
              <option value="Admin">Admin</option>
            </select>
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
              marginTop: "8px",
              transition: "background-color 0.15s"
            }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "13px", color: "#6b7280" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#ef4444", fontWeight: "600", textDecoration: "none" }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
