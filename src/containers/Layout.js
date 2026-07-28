import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import Dashboard from "../pages/Dashboard";
import Companies from "../pages/Companies";
import Visitors from "../pages/Visitors";
import IDManagement from "../pages/IDManagement";
import { NotificationContainer } from "react-notifications";

export default function Layout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      {/* Top Header Bar */}
      <Header />

      {/* Main Body Area (Sidebar + Content) */}
      <div style={{ display: "flex", flex: 1, minHeight: "calc(100vh - 70px)" }}>
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Dynamic Route Content */}
        <main style={{ flex: 1, minWidth: 0, overflowX: "hidden" }}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="companies" element={<Companies />} />
            <Route path="visitor" element={<Visitors />} />
            <Route path="idmanagment" element={<IDManagement />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
        </main>
      </div>

      <NotificationContainer />
    </div>
  );
}
