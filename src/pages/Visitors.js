import React, { useState, useEffect, useCallback } from "react";
import { NotificationManager } from "react-notifications";
import visitorService, { qrUtils } from "../services/visitorService";
import companyService from "../services/company.service";
import idManagementService from "../services/idManagement.service";
import Pagination from "../components/Pagination";
import {
  User,
  X,
  Search,
  Clock,
  QrCode,
  Edit2,
  Trash2,
  UserPlus,
  PlayCircle,
  StopCircle,
} from "lucide-react";

export default function Visitors() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [companies, setCompanies] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState({});       // { [visitorId]: idNumber }
  const [selectedCompanies, setSelectedCompanies] = useState({}); // { [visitorId]: companyName }

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [selectedQRCode, setSelectedQRCode] = useState(null);

  // Visitor profile form data (permanent: name, phone, email only)
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
  });
  const [errors, setErrors] = useState({});

  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await visitorService.getAllVisitors();
      if (response && response.success && response.data) {
        setVisitors(response.data);
      } else {
        setVisitors([]);
      }
    } catch (err) {
      console.error("Fetch visitors error:", err);
      setVisitors([]);
      NotificationManager.error(err.message || "Failed to load visitors", "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await companyService.getAll();
      const list = response.companies || [];
      const companyNames = list.map((c) => c.CompanyName || c.companyName || "").filter(Boolean);
      setCompanies(companyNames);

      if (companyNames.length > 0) {
        setSelectedCompanies((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((id) => {
            if (!companyNames.includes(next[id])) {
              next[id] = companyNames[0];
            }
          });
          return next;
        });
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  }, []);

  const fetchAvailableTags = useCallback(async () => {
    try {
      const response = await idManagementService.getAvailableTags();
      if (response && response.success) {
        const tags = response.tags || [];
        setAvailableTags(tags);

        const validTagSet = new Set(tags.map((t) => t.idNumber));

        setSelectedTags((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((id) => {
            if (!validTagSet.has(next[id])) {
              next[id] = tags[0] ? tags[0].idNumber : "";
            }
          });
          return next;
        });
      } else {
        setAvailableTags([]);
      }
    } catch (err) {
      console.error("Error fetching available tags:", err);
      setAvailableTags([]);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
    fetchCompanies();
    fetchAvailableTags();
  }, [fetchVisitors, fetchCompanies, fetchAvailableTags]);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\s\-()]{7,20}$/;

    if (!formData.name.trim()) {
      newErrors.name = "Visitor name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Visitor name must be at least 2 characters";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Phone number is required";
    } else if (!phoneRegex.test(formData.contact.trim())) {
      newErrors.contact = "Please enter a valid phone number (e.g. 9876543210)";
    }

    if (formData.email && formData.email.trim() !== "") {
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAddModal = () => {
    setEditingVisitor(null);
    setFormData({
      name: "",
      contact: "",
      email: "",
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleOpenEditModal = (visitor) => {
    setEditingVisitor(visitor);
    setFormData({
      name: visitor.VisitorName || visitor.name || "",
      contact: visitor.PhoneNumber || visitor.phone || "",
      email: visitor.Email || visitor.email || "",
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingVisitor(null);
    setFormData({ name: "", contact: "", email: "", company: "" });
    setErrors({});
  };

  const handleSaveVisitorProfile = async () => {
    if (!validateForm()) {
      NotificationManager.warning("Please correct the form errors before saving", "Validation Failed");
      return;
    }

    try {
      if (editingVisitor) {
        const id = editingVisitor.IdManagementID || editingVisitor._id;
        const payload = {
          visitorName: formData.name.trim(),
          phoneNumber: formData.contact.trim(),
          email: formData.email ? formData.email.trim() : null,
        };
        await visitorService.updateVisitor(id, payload);
        NotificationManager.success("Visitor profile updated successfully", "Success");
      } else {
        const payload = {
          visitorName: formData.name.trim(),
          phoneNumber: formData.contact.trim(),
          email: formData.email ? formData.email.trim() : null,
          purpose: "Meeting",
        };
        await visitorService.createVisitor(payload);
        NotificationManager.success("Permanent visitor added to directory", "Success");
      }

      handleCloseModal();
      fetchVisitors();
    } catch (err) {
      NotificationManager.error(err.message || "Operation failed", "Error");
    }
  };

  const handleDeleteVisitor = async (id) => {
    if (window.confirm("Are you sure you want to delete this visitor profile from the directory?")) {
      try {
        await visitorService.deleteVisitor(id);
        NotificationManager.success("Visitor deleted successfully", "Success");
        fetchVisitors();
      } catch (err) {
        NotificationManager.error(err.message || "Delete failed", "Error");
      }
    }
  };

  // "On Visit" Tag + Company Assignment (Inline Table Action)
  const handleAssignTagOnVisit = async (visitor) => {
    const visitorId = visitor.IdManagementID || visitor._id;
    const selectedTag = selectedTags[visitorId] || (availableTags[0] ? availableTags[0].idNumber : null);
    const selectedCompany = selectedCompanies[visitorId] || (companies[0] ? companies[0] : null);

    if (!selectedCompany || String(selectedCompany).trim() === "") {
      NotificationManager.warning(
        "Selecting a company from the dropdown is compulsory to start a visit and generate a QR pass.",
        "Company Required"
      );
      return;
    }

    if (!selectedTag || String(selectedTag).trim() === "") {
      NotificationManager.warning(
        "Selecting an available ID tag from the dropdown is compulsory to start a visit and generate a QR pass.",
        "ID Tag Required"
      );
      return;
    }

    try {
      const res = await visitorService.assignTag(visitorId, selectedTag, selectedCompany);
      NotificationManager.success(
        `Tag '${selectedTag}' & company '${selectedCompany}' assigned to ${visitor.VisitorName} until 12 AM midnight!`,
        "Visit Started"
      );

      // Generate & open QR code modal immediately
      const token = res.data?.token || res.data?.QrToken || visitor.QrToken;
      const TEMP_BROWSER_BASE = process.env.REACT_APP_TEMP_BROWSER_URL || "http://192.168.20.10:3000/temp";
      const textToEncode = `${TEMP_BROWSER_BASE}/?token=${token}`;

      const qrData = await qrUtils.generateQRDataURL(textToEncode);
      setSelectedVisitor({ ...visitor, ...res.data, QrToken: token });
      setSelectedQRCode(qrData);
      setShowQRCodeModal(true);

      // Refresh table and tags
      fetchVisitors();
      fetchAvailableTags();
    } catch (err) {
      NotificationManager.error(err.message || "Failed to start visit", "Error");
    }
  };

  // End visit early
  const handleEndVisit = async (visitorId) => {
    try {
      await visitorService.endVisit(visitorId);
      NotificationManager.info("Visit ended. ID tag released back to available pool.", "Visit Ended");
      fetchVisitors();
      fetchAvailableTags();
    } catch (err) {
      NotificationManager.error(err.message || "Failed to end visit", "Error");
    }
  };

  const handleShowQRCodeModal = async (visitor) => {
    setSelectedVisitor(visitor);
    const token = visitor.QrToken || visitor.token;
    const TEMP_BROWSER_BASE = process.env.REACT_APP_TEMP_BROWSER_URL || "http://192.168.20.10:3000/temp";
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter visitors by Name, Email, or Phone
  const filteredVisitors = visitors.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const name = (v.VisitorName || v.name || "").toLowerCase();
    const phone = (v.PhoneNumber || v.phone || "").toLowerCase();
    const email = (v.Email || v.email || "").toLowerCase();
    const company = (v.Company || v.company || "").toLowerCase();
    return name.includes(q) || phone.includes(q) || email.includes(q) || company.includes(q);
  });

  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVisitors = filteredVisitors.slice(indexOfFirstItem, indexOfLastItem);

  const currentlyOnVisitCount = visitors.filter((v) => v.isOnVisit).length;

  if (loading && visitors.length === 0) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin-custom" style={{ width: "40px", height: "40px", border: "4px solid #dc2626", borderTopColor: "transparent", borderRadius: "50%" }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, sans-serif" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: 0, letterSpacing: "-0.01em" }}>
            Visitors Directory
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
            Permanent visitor profiles & daily "On Visit" RFID tag check-ins
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: "#1f2937",
            color: "#ffffff",
            border: "none",
            borderRadius: "10px",
            padding: "9px 18px",
            fontSize: "13.5px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#111827")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f2937")}
        >
          <UserPlus size={16} />
          Add Visitor +
        </button>
      </div>

      {/* Top Search & Stats Bar */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "28px", alignItems: "stretch" }}>
        {/* Search Bar Input */}
        <div style={{ flex: 1, position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search visitor by Name, Phone Number, Email, or Company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#ffffff",
              border: "1px solid #e9eaec",
              borderRadius: "16px",
              paddingLeft: "46px",
              paddingRight: "16px",
              fontSize: "13.5px",
              color: "#1f2937",
              outline: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Total Visitors Card */}
        <div
          style={{
            width: "200px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "16px 20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            border: "1px solid #e9eaec",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600", display: "block" }}>
              Total Directory
            </span>
            <span style={{ fontSize: "24px", fontWeight: "800", color: "#1f2937" }}>
              {visitors.length}
            </span>
          </div>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
            <User size={18} />
          </div>
        </div>

        {/* Currently On Visit Card */}
        <div
          style={{
            width: "220px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "16px 20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
            border: "1px solid #e9eaec",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "600", display: "block" }}>
              Currently On Visit
            </span>
            <span style={{ fontSize: "24px", fontWeight: "800", color: "#10b981" }}>
              {currentlyOnVisitCount}
            </span>
          </div>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Visitors Directory Table Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "24px 28px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid #e9eaec",
        }}
      >
        {filteredVisitors.length === 0 ? (
          <div style={{ padding: "40px 24px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
            {searchQuery ? `No visitors match "${searchQuery}"` : "No visitors added to directory yet. Click Add Visitor + to register one."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingBottom: "16px", fontSize: "12.5px", fontWeight: "600", color: "#dc2626", borderBottom: "1px solid #f3f4f6", width: "5%" }}>
                  #
                </th>
                <th style={{ textAlign: "left", paddingBottom: "16px", fontSize: "12.5px", fontWeight: "600", color: "#dc2626", borderBottom: "1px solid #f3f4f6", width: "22%" }}>
                  Visitor Details
                </th>
                <th style={{ textAlign: "left", paddingBottom: "16px", fontSize: "12.5px", fontWeight: "600", color: "#dc2626", borderBottom: "1px solid #f3f4f6", width: "15%" }}>
                  Phone Number
                </th>
                <th style={{ textAlign: "left", paddingBottom: "16px", fontSize: "12.5px", fontWeight: "600", color: "#dc2626", borderBottom: "1px solid #f3f4f6", width: "18%" }}>
                  Company
                </th>
                <th style={{ textAlign: "left", paddingBottom: "16px", fontSize: "12.5px", fontWeight: "600", color: "#dc2626", borderBottom: "1px solid #f3f4f6", width: "28%" }}>
                  Today's Visit Tag Assignment
                </th>
                <th style={{ textAlign: "right", paddingBottom: "16px", borderBottom: "1px solid #f3f4f6", width: "12%" }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentVisitors.map((visitor, idx) => {
                const visitorId = visitor.IdManagementID || visitor._id;
                const name = visitor.VisitorName || visitor.name || "N/A";
                const phone = visitor.PhoneNumber || visitor.phone || "N/A";
                const email = visitor.Email || visitor.email || "";
                const isOnVisit = visitor.isOnVisit;
                const activeTag = visitor.IdNumber || visitor.activeTagNumber;
                const absoluteIndex = indexOfFirstItem + idx + 1;

                return (
                  <tr key={visitorId || idx} style={{ borderBottom: idx === currentVisitors.length - 1 ? "none" : "1px solid #f9fafb" }}>
                    {/* # */}
                    <td style={{ padding: "16px 0", fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
                      {absoluteIndex}
                    </td>

                    {/* Visitor Name & Email */}
                    <td style={{ padding: "16px 0" }}>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{name}</div>
                      {email && <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{email}</div>}
                    </td>

                    {/* Phone Number */}
                    <td style={{ padding: "16px 0", fontSize: "13.5px", color: "#374151" }}>
                      {phone}
                    </td>

                    {/* Company (Active Visit Company) */}
                    <td style={{ padding: "16px 0", fontSize: "13.5px", color: "#374151" }}>
                      {isOnVisit ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            backgroundColor: "#e0f2fe",
                            color: "#0369a1",
                            padding: "5px 12px",
                            borderRadius: "10px",
                            fontSize: "12.5px",
                            fontWeight: "700",
                            border: "1px solid #bae6fd",
                          }}
                        >
                          🏢 {visitor.activeCompany || visitor.Company || visitor.company || "N/A"}
                        </span>
                      ) : (
                        <span style={{ color: "#9ca3af", fontSize: "12.5px", fontStyle: "italic" }}>Not On Visit</span>
                      )}
                    </td>

                    {/* Today's Visit Tag & Company Assignment Column */}
                    <td style={{ padding: "16px 0" }}>
                      {isOnVisit ? (
                        /* Currently On Visit: Show Active Badge + View QR + End Visit (No Dropdowns / No On Visit button) */
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              padding: "6px 12px",
                              borderRadius: "12px",
                              backgroundColor: "#ecfdf5",
                              color: "#059669",
                              fontSize: "12.5px",
                              fontWeight: "700",
                              border: "1px solid #a7f3d0",
                            }}
                          >
                            <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                            On Visit (Tag: {activeTag || "Assigned"})
                          </span>

                          <button
                            onClick={() => handleShowQRCodeModal(visitor)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 12px",
                              borderRadius: "8px",
                              backgroundColor: "#f3f4f6",
                              color: "#374151",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                          >
                            <QrCode size={14} />
                            View QR
                          </button>

                          <button
                            onClick={() => handleEndVisit(visitorId)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              padding: "6px 10px",
                              borderRadius: "8px",
                              backgroundColor: "#fef2f2",
                              color: "#dc2626",
                              border: "none",
                              fontSize: "12px",
                              fontWeight: "600",
                              cursor: "pointer",
                            }}
                            title="End visit early to release tag and company"
                          >
                            <StopCircle size={14} />
                            End Visit
                          </button>
                        </div>
                      ) : (
                        /* Not Currently On Visit: Company Dropdown + Select Tag Dropdown + "On Visit" Button */
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          {/* Company Dropdown */}
                          <select
                            value={selectedCompanies[visitorId] || companies[0] || ""}
                            onChange={(e) =>
                              setSelectedCompanies({ ...selectedCompanies, [visitorId]: e.target.value })
                            }
                            style={{
                              backgroundColor: "#ffffff",
                              border: "1px solid #d1d5db",
                              borderRadius: "8px",
                              padding: "6px 10px",
                              fontSize: "12.5px",
                              color: "#1f2937",
                              outline: "none",
                              cursor: "pointer",
                              maxWidth: "140px",
                            }}
                          >
                            <option value="">Select Company</option>
                            {companies.map((c, i) => (
                              <option key={i} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>

                          {/* Tag Dropdown */}
                          {availableTags.length > 0 ? (
                            <>
                              <select
                                value={selectedTags[visitorId] || availableTags[0]?.idNumber || ""}
                                onChange={(e) =>
                                  setSelectedTags({ ...selectedTags, [visitorId]: e.target.value })
                                }
                                style={{
                                  backgroundColor: "#ffffff",
                                  border: "1px solid #d1d5db",
                                  borderRadius: "8px",
                                  padding: "6px 10px",
                                  fontSize: "12.5px",
                                  color: "#1f2937",
                                  outline: "none",
                                  cursor: "pointer",
                                  maxWidth: "150px",
                                }}
                              >
                                {availableTags.map((tag) => (
                                  <option key={tag.tagId || tag.idNumber} value={tag.idNumber}>
                                    {tag.nickname} ({tag.idNumber})
                                  </option>
                                ))}
                              </select>

                              <button
                                onClick={() => handleAssignTagOnVisit(visitor)}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  backgroundColor: "#10b981",
                                  color: "#ffffff",
                                  border: "none",
                                  borderRadius: "8px",
                                  padding: "7px 14px",
                                  fontSize: "12.5px",
                                  fontWeight: "600",
                                  cursor: "pointer",
                                  transition: "background-color 0.15s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#059669")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#10b981")}
                              >
                                <PlayCircle size={14} />
                                On Visit
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#b45309", backgroundColor: "#fffbeb", padding: "6px 10px", borderRadius: "8px", border: "1px solid #fef3c7" }}>
                              ⚠️ All tags in use
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td style={{ padding: "16px 0", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => handleOpenEditModal(visitor)}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "8px",
                            backgroundColor: "#f3f4f6",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#4b5563",
                          }}
                          title="Edit Visitor Profile"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteVisitor(visitorId)}
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "8px",
                            backgroundColor: "#fee2e2",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            color: "#dc2626",
                          }}
                          title="Delete Visitor"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredVisitors.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Modal 1: Add/Edit Permanent Visitor Profile */}
      {showAddModal && (
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
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#ef4444", margin: 0 }}>
                {editingVisitor ? "Edit Visitor Profile" : "Add Permanent Visitor"}
              </h3>
              <button
                onClick={handleCloseModal}
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

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Name */}
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                  Visitor Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.name ? "#fef2f2" : "#ffffff",
                    border: errors.name ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  autoFocus
                />
                {errors.name && <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>{errors.name}</span>}
              </div>

              {/* Phone */}
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.contact}
                  onChange={(e) => {
                    setFormData({ ...formData, contact: e.target.value });
                    if (errors.contact) setErrors({ ...errors, contact: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.contact ? "#fef2f2" : "#ffffff",
                    border: errors.contact ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.contact && <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>{errors.contact}</span>}
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. john@company.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.email ? "#fef2f2" : "#ffffff",
                    border: errors.email ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.email && <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>{errors.email}</span>}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: "9px 18px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  color: "#4b5563",
                  fontSize: "13.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVisitorProfile}
                style={{
                  padding: "9px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "13.5px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                {editingVisitor ? "Update Profile" : "Save Visitor"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: View & Print QR Code */}
      {showQRCodeModal && selectedVisitor && selectedQRCode && (
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
              width: "420px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1f2937", margin: 0 }}>
                Visitor Check-In Pass
              </h3>
              <button
                onClick={() => setShowQRCodeModal(false)}
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

            <div style={{ backgroundColor: "#f9fafb", borderRadius: "16px", padding: "16px", marginBottom: "20px" }}>
              <img
                src={selectedQRCode}
                alt="Visitor QR Code"
                style={{ width: "220px", height: "220px", borderRadius: "12px" }}
              />
            </div>

            <div style={{ marginBottom: "20px", textAlign: "left", fontSize: "13.5px" }}>
              <div style={{ fontWeight: "700", fontSize: "16px", color: "#1f2937" }}>
                {selectedVisitor.VisitorName || selectedVisitor.name}
              </div>
              <div style={{ color: "#6b7280", fontSize: "12.5px", marginTop: "2px" }}>
                Phone: {selectedVisitor.PhoneNumber || selectedVisitor.phone} | Company: {selectedVisitor.Company || selectedVisitor.company}
              </div>
              <div style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#ecfdf5", color: "#059669", padding: "4px 10px", borderRadius: "8px", fontWeight: "600", fontSize: "12px" }}>
                Tag Assigned: {selectedVisitor.IdNumber || selectedVisitor.activeTagNumber} (Expires 12 AM)
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                onClick={() => qrUtils.downloadQR(selectedQRCode, selectedVisitor.VisitorName || selectedVisitor.name)}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Download PNG
              </button>
              <button
                onClick={() => qrUtils.printQR(selectedQRCode, { name: selectedVisitor.VisitorName, phone: selectedVisitor.PhoneNumber, company: selectedVisitor.Company, idNumber: selectedVisitor.IdNumber })}
                style={{
                  padding: "10px 20px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Print Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
