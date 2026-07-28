import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Search, Bell, ChevronDown } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const userName = user?.FullName || user?.fullName || user?.Email || "Karan Rana";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <header
      style={{
        height: "70px",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e9eaec",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px 0 24px",
        boxSizing: "border-box",
        position: "sticky",
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Logo Placeholder */}
      <div style={{ display: "flex", alignItems: "center", width: "216px" }}>
        <img
          src="/logo.svg"
          alt="Company Logo"
          onError={(e) => {
            e.target.style.display = "none";
          }}
          style={{ height: "32px", maxWidth: "160px", objectFit: "contain" }}
        />
        {/* Fallback brand header if image not present */}
        <div id="brand-fallback" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "28px",
              height: "14px",
              background: "linear-gradient(90deg, #dc2626 0%, #ef4444 100%)",
              borderRadius: "4px",
            }}
          />
          <span style={{ fontWeight: "800", fontSize: "16px", letterSpacing: "2px", color: "#1f2937" }}>
            EQUINIX
          </span>
        </div>
      </div>

      {/* Middle: Search Bar */}
      <div style={{ flex: 1, maxWidth: "420px", position: "relative" }}>
        <Search
          size={16}
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
          }}
        />
        <input
          type="text"
          placeholder="Search"
          style={{
            width: "100%",
            backgroundColor: "#f3f4f6",
            border: "none",
            borderRadius: "20px",
            padding: "9px 65px 9px 38px",
            fontSize: "13px",
            color: "#374151",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <span
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "11px",
            color: "#9ca3af",
            backgroundColor: "#ffffff",
            padding: "2px 6px",
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            fontWeight: "500",
          }}
        >
          ⌘ + F
        </span>
      </div>

      {/* Right: Notifications & User Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* Bell Notification Icon */}
        <div style={{ position: "relative", cursor: "pointer" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              backgroundColor: "#f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4b5563",
            }}
          >
            <Bell size={18} />
          </div>
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              backgroundColor: "#dc2626",
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: "700",
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            2
          </span>
        </div>

        {/* User Pill */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              userSelect: "none",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {userInitials || "KR"}
            </div>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>
              {userName}
            </span>
            <ChevronDown size={16} style={{ color: "#6b7280" }} />
          </div>
        </div>
      </div>
    </header>
  );
}
