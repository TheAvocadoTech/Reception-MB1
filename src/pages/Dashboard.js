import React, { useEffect, useState } from "react";
import idManagementService from "../services/idManagement.service";
import visitorService from "../services/visitorService";
import { User } from "lucide-react";

export default function Dashboard() {
  const [todayCount, setTodayCount] = useState(0);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log("📊 [DASHBOARD] Loading live analytics data from backend...");

      const [visitorRes, statsRes] = await Promise.allSettled([
        visitorService.getAllVisitors(),
        idManagementService.getStats(),
      ]);

      let visitorsList = [];
      if (visitorRes.status === "fulfilled" && visitorRes.value?.data) {
        visitorsList = visitorRes.value.data;
      }

      let count = visitorsList.length;
      if (statsRes.status === "fulfilled" && statsRes.value?.stats?.visitors !== undefined) {
        count = statsRes.value.stats.visitors;
      }

      console.log(`✅ [DASHBOARD] Received ${count} total visitors from database.`);

      setTodayCount(count);
      setRecentVisitors(visitorsList);
    } catch (err) {
      console.error("❌ [DASHBOARD] Error loading analytics:", err);
      setTodayCount(0);
      setRecentVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic bar chart calculation based on live database count
  const getDynamicBarHeights = () => {
    if (todayCount === 0) {
      return [10, 12, 10, 14, 10, 12, 10, 14, 10];
    }
    const base = Math.min(todayCount * 8, 30);
    return [
      base + 5,
      base + 12,
      base + 8,
      base + 15,
      base + 22,
      Math.min(base + 32, 65),
      base + 14,
      base + 20,
      base + 10,
    ];
  };

  const barHeights = getDynamicBarHeights();

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin-custom" style={{ width: "40px", height: "40px", border: "4px solid #dc2626", borderTopColor: "transparent", borderRadius: "50%" }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, sans-serif" }}>
      {/* Page Header */}
      <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: "0 0 24px", letterSpacing: "-0.01em" }}>
        Dashboard
      </h1>

      {/* Top Today Visitors Widget Card */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "24px 28px",
            width: "360px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid #e9eaec",
            boxSizing: "border-box",
          }}
        >
          {/* Icon + Label */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10b981",
              }}
            >
              <User size={20} />
            </div>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "#1f2937" }}>
              Today Visitors
            </span>
          </div>

          {/* Metric Count + Mini Bar Equalizer */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <span style={{ fontSize: "42px", fontWeight: "800", color: "#1f2937", lineHeight: "1" }}>
              {todayCount}
            </span>

            {/* Mini Equalizer Bar Graphic */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "32px", paddingBottom: "2px" }}>
              {barHeights.map((h, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "4px",
                    height: `${h}px`,
                    backgroundColor: idx === 5 && todayCount > 0 ? "#1f2937" : "#d1d5db",
                    borderRadius: "4px",
                    transition: "height 0.3s ease",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Visitors Table Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "24px 28px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid #e9eaec",
          maxWidth: "980px",
        }}
      >
        {recentVisitors.length === 0 ? (
          <div style={{ padding: "36px 24px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
            No recent visitors recorded in the database.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Visitor Name", "Company Name", "ID Number", "Email"].map((col, idx) => (
                  <th
                    key={idx}
                    style={{
                      textAlign: "left",
                      paddingBottom: "16px",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#dc2626",
                      borderBottom: "1px solid #f3f4f6",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {recentVisitors.map((visitor, idx) => {
                const name = visitor.VisitorName || visitor.name || "N/A";
                const company = visitor.Company || visitor.company || "N/A";
                const idNum = visitor.IdNumber || visitor.idNumber || "N/A";
                const email = visitor.Email || visitor.email || "N/A";

                return (
                  <tr key={idx} style={{ borderBottom: idx === recentVisitors.length - 1 ? "none" : "1px solid #f9fafb" }}>
                    <td style={{ padding: "16px 0", fontSize: "13.5px", color: "#1f2937", fontWeight: "500" }}>
                      {name}
                    </td>
                    <td style={{ padding: "16px 0", fontSize: "13.5px", color: "#4b5563" }}>
                      {company}
                    </td>
                    <td style={{ padding: "16px 0", fontSize: "13.5px", color: "#4b5563" }}>
                      {idNum}
                    </td>
                    <td style={{ padding: "16px 0", fontSize: "13.5px", color: "#4b5563" }}>
                      {email}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
