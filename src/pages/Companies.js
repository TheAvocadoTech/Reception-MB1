import React, { useState, useEffect, useRef } from "react";
import { NotificationManager } from "react-notifications";
import companyService from "../services/company.service";
import { X } from "lucide-react";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    industry: "",
    address: "",
    website: "",
  });
  const [errors, setErrors] = useState({});
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      console.log("🏢 [COMPANIES UI] Fetching company list from SQL database...");
      const response = await companyService.getAll();
      console.log("📥 [COMPANIES UI] Database response:", response);
      if (response && response.success) {
        setCompanies(response.companies || []);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error("❌ [COMPANIES UI] Fetch error:", error);
      setCompanies([]);
      NotificationManager.error(error.message || "Failed to fetch companies from database", "Error");
    } finally {
      setLoading(false);
    }
  };

  const validateCompanyForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9+\s\-()]{7,20}$/;
    const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(:\d{1,5})?(\/.*)?$/i;

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    } else if (formData.companyName.trim().length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters";
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person name is required";
    } else if (formData.contactPerson.trim().length < 2) {
      newErrors.contactPerson = "Contact person name must be at least 2 characters";
    }

    if (formData.email && formData.email.trim() !== "") {
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address (e.g. info@company.com)";
      }
    }

    if (formData.phone && formData.phone.trim() !== "") {
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = "Please enter a valid phone number (e.g. +1 9876543210)";
      }
    }

    if (formData.website && formData.website.trim() !== "") {
      if (!urlRegex.test(formData.website.trim())) {
        newErrors.website = "Please enter a valid URL (e.g. https://company.com)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setFormData({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      industry: "",
      address: "",
      website: "",
    });
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      companyName: company.CompanyName || company.companyName || "",
      contactPerson: company.ContactPerson || company.contactPerson || "",
      email: company.Email || company.email || "",
      phone: company.Phone || company.phone || "",
      industry: company.Industry || company.industry || "",
      address: company.Address || company.address || "",
      website: company.Website || company.website || "",
    });
    setErrors({});
    setShowModal(true);
    setOpenMenuId(null);
  };

  const handleSaveCompany = async () => {
    if (!validateCompanyForm()) {
      NotificationManager.warning("Please correct the form errors before saving", "Validation Failed");
      return;
    }

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email ? formData.email.trim() : null,
        phone: formData.phone ? formData.phone.trim() : null,
        industry: formData.industry ? formData.industry.trim() : null,
        address: formData.address ? formData.address.trim() : null,
        website: formData.website ? formData.website.trim() : null,
      };

      if (editingCompany) {
        const id = editingCompany.CompanyID || editingCompany._id;
        const response = await companyService.update(id, payload);
        if (response && response.success) {
          NotificationManager.success("Company updated in database successfully", "Success");
          fetchCompanies();
          handleCloseModal();
        }
      } else {
        const response = await companyService.create(payload);
        if (response && response.success) {
          NotificationManager.success("Company saved to database successfully", "Success");
          fetchCompanies();
          handleCloseModal();
        }
      }
    } catch (error) {
      NotificationManager.error(error.message || "Operation failed", "Error");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCompany(null);
    setErrors({});
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm("Are you sure you want to delete this company from database?")) {
      try {
        const response = await companyService.delete(id);
        if (response && response.success) {
          NotificationManager.success("Company deleted from database successfully", "Success");
          fetchCompanies();
          setOpenMenuId(null);
        }
      } catch (error) {
        NotificationManager.error(error.message || "Delete failed", "Error");
      }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin-custom" style={{ width: "40px", height: "40px", border: "4px solid #dc2626", borderTopColor: "transparent", borderRadius: "50%" }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, sans-serif" }}>
      {/* Page Title & Add Button Container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          width: "460px",
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: 0, letterSpacing: "-0.01em" }}>
          Companies
        </h1>

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
            padding: "8px 16px",
            fontSize: "13.5px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#111827")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f2937")}
        >
          Add
          <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" />
            <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" />
            <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" />
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" />
          </svg>
        </button>
      </div>

      {/* Companies Card Stack */}
      <div style={{ width: "460px", display: "flex", flexDirection: "column", gap: "12px" }} ref={menuRef}>
        {companies.length === 0 ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px dashed #d1d5db",
              padding: "36px 24px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "14px",
            }}
          >
            No companies found in database. Click <strong>Add</strong> to create a company.
          </div>
        ) : (
          companies.map((company) => {
            const companyId = company.CompanyID || company._id;
            const compName = company.CompanyName || company.companyName;

            return (
              <div
                key={companyId}
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  border: "1px solid #e9eaec",
                  padding: "18px 24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  position: "relative",
                }}
              >
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
                  {compName}
                </span>

                {/* Options Menu Kebab Button */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setOpenMenuId(openMenuId === companyId ? null : companyId)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 8px",
                      color: "#9ca3af",
                      fontSize: "18px",
                      lineHeight: 1,
                      borderRadius: "6px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#374151")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
                    title="Options"
                  >
                    ⋮
                  </button>

                  {/* Popup Menu */}
                  {openMenuId === companyId && (
                    <div
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "calc(100% + 4px)",
                        zIndex: 50,
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        padding: "6px",
                        minWidth: "120px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <button
                        onClick={() => handleOpenEditModal(company)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#f3f4f6",
                          color: "#374151",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDeleteCompany(companyId)}
                        style={{
                          width: "100%",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#fee2e2",
                          color: "#ef4444",
                          fontSize: "13px",
                          fontWeight: "500",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Company Popup Modal */}
      {showModal && (
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
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: "700", color: "#ef4444", margin: 0 }}>
                {editingCompany ? "Edit Company" : "Add Company"}
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

            {/* Form Fields Stack */}
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* COMPANY NAME */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  COMPANY NAME *
                </label>
                <input
                  type="text"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) => {
                    setFormData({ ...formData, companyName: e.target.value });
                    if (errors.companyName) setErrors({ ...errors, companyName: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.companyName ? "#fef2f2" : "#f9fafb",
                    border: errors.companyName ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.companyName && (
                  <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                    {errors.companyName}
                  </span>
                )}
              </div>

              {/* CONTACT PERSON */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  CONTACT PERSON *
                </label>
                <input
                  type="text"
                  placeholder="Enter contact person name"
                  value={formData.contactPerson}
                  onChange={(e) => {
                    setFormData({ ...formData, contactPerson: e.target.value });
                    if (errors.contactPerson) setErrors({ ...errors, contactPerson: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.contactPerson ? "#fef2f2" : "#f9fafb",
                    border: errors.contactPerson ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.contactPerson && (
                  <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                    {errors.contactPerson}
                  </span>
                )}
              </div>

              {/* EMAIL */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  EMAIL
                </label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.email ? "#fef2f2" : "#f9fafb",
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

              {/* PHONE */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  PHONE
                </label>
                <input
                  type="text"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    if (errors.phone) setErrors({ ...errors, phone: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.phone ? "#fef2f2" : "#f9fafb",
                    border: errors.phone ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.phone && (
                  <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                    {errors.phone}
                  </span>
                )}
              </div>

              {/* INDUSTRY */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  INDUSTRY
                </label>
                <input
                  type="text"
                  placeholder="Enter industry"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />

                {/* Industry Selection Quick Chips */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, industry: "" })}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: "#f3f4f6",
                      border: "none",
                      cursor: "pointer",
                    }}
                    title="Clear"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, industry: "IT" })}
                    style={{
                      backgroundColor: formData.industry === "IT" ? "#ef4444" : "#f3f4f6",
                      color: formData.industry === "IT" ? "#ffffff" : "#374151",
                      border: "none",
                      borderRadius: "16px",
                      padding: "4px 14px",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    IT
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, industry: "manufacturing" })}
                    style={{
                      backgroundColor: formData.industry === "manufacturing" ? "#ef4444" : "#f3f4f6",
                      color: formData.industry === "manufacturing" ? "#ffffff" : "#374151",
                      border: "none",
                      borderRadius: "16px",
                      padding: "4px 14px",
                      fontSize: "12px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    manufacturing
                  </button>
                </div>
              </div>

              {/* ADDRESS */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  ADDRESS
                </label>
                <input
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{
                    width: "100%",
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* WEBSITE */}
              <div>
                <label style={{ fontSize: "11px", fontWeight: "600", color: "#9ca3af", letterSpacing: "0.05em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  WEBSITE
                </label>
                <input
                  type="text"
                  placeholder="Enter website URL"
                  value={formData.website}
                  onChange={(e) => {
                    setFormData({ ...formData, website: e.target.value });
                    if (errors.website) setErrors({ ...errors, website: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.website ? "#fef2f2" : "#f9fafb",
                    border: errors.website ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.website && (
                  <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                    {errors.website}
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: "28px" }}>
              <button
                onClick={handleSaveCompany}
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
                {editingCompany ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
