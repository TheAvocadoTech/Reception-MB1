import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, LayoutGrid, Users, CreditCard, LogOut } from "lucide-react";

export default function LeftSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/app/dashboard",
      icon: <Home size={18} />,
    },
    {
      name: "Companies",
      path: "/app/companies",
      icon: <LayoutGrid size={18} />,
    },
    {
      name: "Visitor",
      path: "/app/visitor",
      icon: <Users size={18} />,
    },
    {
      name: "ID Management",
      path: "/app/idmanagment",
      icon: <CreditCard size={18} />,
    },
  ];

  return (
    <aside
      style={{
        width: "240px",
        backgroundColor: "#ffffff",
        borderRight: "1px solid #e9eaec",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "24px 16px",
        boxSizing: "border-box",
      }}
    >
      <div>
        {/* Menu Section Title */}
        <p
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: "#9ca3af",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: "0 0 16px 12px",
          }}
        >
          MENU
        </p>

        {/* Navigation Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 16px",
                  borderRadius: "10px",
                  fontSize: "13.5px",
                  fontWeight: isActive ? "600" : "500",
                  color: isActive ? "#ffffff" : "#4b5563",
                  backgroundColor: isActive ? "#dc2626" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? "0 4px 12px rgba(220, 38, 38, 0.25)" : "none",
                }}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout Button */}
      <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "16px" }}>
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#dc2626",
            fontSize: "13.5px",
            fontWeight: "600",
            padding: "8px 12px",
            borderRadius: "8px",
            width: "100%",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#fee2e2")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
        >
          <LogOut size={18} color="#dc2626" />
          Logout
        </button>
      </div>
    </aside>
  );
}
