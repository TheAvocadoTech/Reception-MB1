import React, { useState, useEffect, useCallback } from "react";
import { NotificationManager } from "react-notifications";
import visitorService, { qrUtils } from "../services/visitorService";
import companyService from "../services/company.service";
import { User, X } from "lucide-react";

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [companies, setCompanies] = useState([]);

  const [qrFormData, setQrFormData] = useState({
    name: "",
    contact: "",
    email: "",
    idNumber: "",
    company: "",
  });
  const [errors, setErrors] = useState({});

  const fetchVisitors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await visitorService.getAllVisitors();
      if (response.success && response.data) {
        setVisitors(response.data);
      } else {
        setVisitors([]);
      }
    } catch (err) {
      console.error("Fetch visitors error:", err);
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await companyService.getAll();
      const list = response.companies || [];
      const companyNames = list.map((c) => c.CompanyName || c.companyName || "");
      setCompanies(companyNames.filter(Boolean));
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
    fetchCompanies();
  }, [fetchVisitors, fetchCompanies]);

  const validateQRForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\s\-()]{7,20}$/;

    if (!qrFormData.name.trim()) {
      newErrors.name = "Visitor name is required";
    } else if (qrFormData.name.trim().length < 2) {
      newErrors.name = "Visitor name must be at least 2 characters";
    }

    if (!qrFormData.contact.trim()) {
      newErrors.contact = "Contact number is required";
    } else if (!phoneRegex.test(qrFormData.contact.trim())) {
      newErrors.contact = "Please enter a valid contact number (e.g. 9876534210)";
    }

    if (qrFormData.email && qrFormData.email.trim() !== "") {
      if (!emailRegex.test(qrFormData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    if (!qrFormData.idNumber.trim()) {
      newErrors.idNumber = "ID Number is required";
    }

    if (!qrFormData.company) {
      newErrors.company = "Please select a company";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAddQR = () => {
    setSelectedVisitor(null);
    setQrFormData({
      name: "",
      contact: "",
      email: "",
      idNumber: `Tag${visitors.length + 1}`,
      company: companies[0] || "",
    });
    setErrors({});
    setShowQRModal(true);
  };

  const handleShowQRCode = async (visitor) => {
    setSelectedVisitor(visitor);
    const token = visitor.QrToken || visitor.token;
    const TEMP_BROWSER_BASE = "http://192.168.20.10:8000/temp";
    const textToEncode = token
      ? `${TEMP_BROWSER_BASE}/?token=${token}`
      : JSON.stringify({
          id: visitor.IdManagementID || visitor._id,
          name: visitor.VisitorName || visitor.name,
          idNumber: visitor.IdNumber || visitor.idNumber,
        });
    const qrData = await qrUtils.generateQRDataURL(textToEncode);
    setSelectedQRCode(qrData);
    setShowQRCodeModal(true);
  };

  const handleSubmitQR = async () => {
    if (!validateQRForm()) {
      NotificationManager.warning("Please correct the form errors before sending", "Validation Failed");
      return;
    }

    try {
      setLoading(true);
      await visitorService.createVisitor({
        visitorName: qrFormData.name.trim(),
        phoneNumber: qrFormData.contact.trim(),
        email: qrFormData.email ? qrFormData.email.trim() : null,
        company: qrFormData.company,
        idNumber: qrFormData.idNumber.trim(),
        purpose: "Meeting",
      });

      NotificationManager.success(`Visitor ${qrFormData.name} added & QR generated!`, "Success");
      setShowQRModal(false);
      fetchVisitors();
    } catch (err) {
      NotificationManager.error(err.message || "Failed to create visitor", "Error");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic bar graphic heights based on live database count
  const getDynamicBarHeights = () => {
    const count = visitors.length;
    if (count === 0) {
      return [10, 12, 10, 14, 10, 12, 10, 14, 10];
    }
    const base = Math.min(count * 8, 30);
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

  if (loading && visitors.length === 0) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin-custom" style={{ width: "40px", height: "40px", border: "4px solid #dc2626", borderTopColor: "transparent", borderRadius: "50%" }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, sans-serif" }}>
      {/* Page Header & Add Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          maxWidth: "680px",
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: 0, letterSpacing: "-0.01em" }}>
          Visitors
        </h1>

        <button
          onClick={handleOpenAddQR}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#1f2937",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: "8px 16px",
            fontSize: "13.5px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#111827")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f2937")}
        >
          Add +
        </button>
      </div>

      {/* Top Total Visitors Widget Card */}
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
              Total Visitors
            </span>
          </div>

          {/* Metric Count + Mini Bar Equalizer */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <span style={{ fontSize: "42px", fontWeight: "800", color: "#1f2937", lineHeight: "1" }}>
              {visitors.length}
            </span>

            {/* Mini Equalizer Bar Graphic */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: "5px", height: "32px", paddingBottom: "2px" }}>
              {barHeights.map((h, idx) => (
                <div
                  key={idx}
                  style={{
                    width: "4px",
                    height: `${h}px`,
                    backgroundColor: idx === 5 ? "#1f2937" : "#d1d5db",
                    borderRadius: "4px",
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Visitors Table Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "24px 28px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid #e9eaec",
          maxWidth: "680px",
        }}
      >
        {visitors.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
            No visitors registered yet. Click <strong>Add +</strong> to register a visitor.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    paddingBottom: "16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#dc2626",
                    borderBottom: "1px solid #f3f4f6",
                    width: "40%",
                  }}
                >
                  Visitor Name
                </th>
                <th
                  style={{
                    textAlign: "left",
                    paddingBottom: "16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#dc2626",
                    borderBottom: "1px solid #f3f4f6",
                    width: "40%",
                  }}
                >
                  Phone Number
                </th>
                <th
                  style={{
                    textAlign: "right",
                    paddingBottom: "16px",
                    borderBottom: "1px solid #f3f4f6",
                    width: "20%",
                  }}
                />
              </tr>
            </thead>

            <tbody>
              {visitors.map((visitor, idx) => {
                const name = visitor.VisitorName || visitor.name || "Swastik Thiramdas";
                const phone = visitor.PhoneNumber || visitor.phone || "9876534210";

                return (
                  <tr key={idx} style={{ borderBottom: idx === visitors.length - 1 ? "none" : "1px solid #f9fafb" }}>
                    <td style={{ padding: "18px 0", fontSize: "13.5px", color: "#1f2937", fontWeight: "500" }}>
                      {name}
                    </td>
                    <td style={{ padding: "18px 0", fontSize: "13.5px", color: "#4b5563" }}>
                      {phone}
                    </td>
                    <td style={{ padding: "18px 0", textAlign: "right" }}>
                      <button
                        onClick={() => handleShowQRCode(visitor)}
                        style={{
                          backgroundColor: "#dc2626",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "10px",
                          padding: "8px 18px",
                          fontSize: "13px",
                          fontWeight: "600",
                          cursor: "pointer",
                          boxShadow: "0 2px 6px rgba(220, 38, 38, 0.2)",
                          transition: "background-color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#b91c1c")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                      >
                        Send QR
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal: QR Generator / Add Visitor */}
      {showQRModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "32px 28px",
              width: "440px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              boxSizing: "border-box",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#ef4444", margin: 0 }}>
                QR Generator
              </h3>
              <button
                onClick={() => setShowQRModal(false)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#f3f4f6",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Fields Stack */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Name */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "#9ca3af", display: "block", marginBottom: "6px" }}>
                  Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  value={qrFormData.name}
                  onChange={(e) => {
                    setQrFormData({ ...qrFormData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.name ? "#fef2f2" : "#ffffff",
                    border: errors.name ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.name && (
                  <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Contact */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "#9ca3af", display: "block", marginBottom: "6px" }}>
                  Contact *
                </label>
                <input
                  type="text"
                  placeholder="Enter contact number"
                  value={qrFormData.contact}
                  onChange={(e) => {
                    setQrFormData({ ...qrFormData, contact: e.target.value });
                    if (errors.contact) setErrors({ ...errors, contact: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.contact ? "#fef2f2" : "#ffffff",
                    border: errors.contact ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.contact && (
                  <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                    {errors.contact}
                  </span>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "#9ca3af", display: "block", marginBottom: "6px" }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={qrFormData.email}
                  onChange={(e) => {
                    setQrFormData({ ...qrFormData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.email ? "#fef2f2" : "#ffffff",
                    border: errors.email ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.email && (
                  <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* ID Number */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "#9ca3af", display: "block", marginBottom: "6px" }}>
                  ID Number *
                </label>
                <input
                  type="text"
                  placeholder="Enter ID number"
                  value={qrFormData.idNumber}
                  onChange={(e) => {
                    setQrFormData({ ...qrFormData, idNumber: e.target.value });
                    if (errors.idNumber) setErrors({ ...errors, idNumber: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.idNumber ? "#fef2f2" : "#ffffff",
                    border: errors.idNumber ? "1.5px solid #ef4444" : "1px solid #ef4444",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.idNumber && (
                  <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                    {errors.idNumber}
                  </span>
                )}
              </div>

              {/* Company Dropdown */}
              <div>
                <label style={{ fontSize: "12px", fontWeight: "500", color: "#9ca3af", display: "block", marginBottom: "6px" }}>
                  Company *
                </label>
                <select
                  value={qrFormData.company}
                  onChange={(e) => {
                    setQrFormData({ ...qrFormData, company: e.target.value });
                    if (errors.company) setErrors({ ...errors, company: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.company ? "#fef2f2" : "#ffffff",
                    border: errors.company ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13.5px",
                    color: qrFormData.company ? "#1f2937" : "#9ca3af",
                    outline: "none",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select a Company</option>
                  {companies.map((c, i) => (
                    <option key={i} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {errors.company && (
                  <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                    {errors.company}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: "28px" }}>
              <button
                onClick={handleSubmitQR}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "14px",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "15px",
                  fontWeight: "700",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
                  transition: "background-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
              >
                Send QR Code
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View & Download QR Code Pass */}
      {showQRCodeModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "24px",
              padding: "28px",
              width: "380px",
              textAlign: "center",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", margin: "0 0 4px" }}>
              Visitor Entry Pass
            </h3>
            <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px" }}>
              {selectedVisitor?.VisitorName || selectedVisitor?.name} ({selectedVisitor?.PhoneNumber || selectedVisitor?.phone})
            </p>

            {selectedQRCode && (
              <img
                src={selectedQRCode}
                alt="QR Pass"
                style={{
                  width: "180px",
                  height: "180px",
                  margin: "0 auto 20px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "8px",
                }}
              />
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                onClick={() => {
                  qrUtils.downloadQRCode(selectedQRCode, `Visitor_Pass_${selectedVisitor?.VisitorName || "Pass"}.png`);
                  NotificationManager.success("Downloaded QR Pass Image!", "Success");
                }}
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Download PNG
              </button>
              <button
                onClick={() => setShowQRCodeModal(false)}
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  color: "#4b5563",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
