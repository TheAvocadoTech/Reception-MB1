import React, { useState, useEffect, useCallback } from "react";
import { NotificationManager } from "react-notifications";
import companyService from "../services/company.service";
import Pagination from "../components/Pagination";
import { X, Building2, Edit2, Trash2 } from "lucide-react";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [errors, setErrors] = useState({});

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await companyService.getAll();
      if (response && response.success) {
        setCompanies(response.companies || []);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error("❌ Fetch companies error:", error);
      setCompanies([]);
      NotificationManager.error(error.message || "Failed to fetch companies", "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const validateCompanyForm = () => {
    const newErrors = {};
    if (!companyName.trim()) {
      newErrors.companyName = "Company name is required";
    } else if (companyName.trim().length < 2) {
      newErrors.companyName = "Company name must be at least 2 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAddModal = () => {
    setEditingCompany(null);
    setCompanyName("");
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = (company) => {
    setEditingCompany(company);
    setCompanyName(company.CompanyName || company.companyName || "");
    setErrors({});
    setShowModal(true);
  };

  const handleSaveCompany = async () => {
    if (!validateCompanyForm()) {
      NotificationManager.warning("Please enter a valid company name", "Validation Failed");
      return;
    }

    try {
      const payload = {
        companyName: companyName.trim(),
      };

      if (editingCompany) {
        const id = editingCompany.CompanyID || editingCompany._id;
        const response = await companyService.update(id, payload);
        if (response && response.success) {
          NotificationManager.success("Company updated successfully", "Success");
          fetchCompanies();
          handleCloseModal();
        }
      } else {
        const response = await companyService.create(payload);
        if (response && response.success) {
          NotificationManager.success("Company added successfully", "Success");
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
    setCompanyName("");
    setErrors({});
  };

  const handleDeleteCompany = async (id) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        const response = await companyService.delete(id);
        if (response && response.success) {
          NotificationManager.success("Company deleted successfully", "Success");
          fetchCompanies();
        }
      } catch (error) {
        NotificationManager.error(error.message || "Delete failed", "Error");
      }
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(companies.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = companies.slice(indexOfFirstItem, indexOfLastItem);

  if (loading && companies.length === 0) {
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
          maxWidth: "680px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: 0, letterSpacing: "-0.01em" }}>
            Companies
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
            Manage registered company directory
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
          Add Company +
        </button>
      </div>

      {/* Total Companies Card */}
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "50%",
                backgroundColor: "#e0f2fe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0284c7",
              }}
            >
              <Building2 size={20} />
            </div>
            <span style={{ fontSize: "15px", fontWeight: "600", color: "#1f2937" }}>
              Total Companies
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <span style={{ fontSize: "40px", fontWeight: "800", color: "#1f2937", lineHeight: "1" }}>
              {companies.length}
            </span>
          </div>
        </div>
      </div>

      {/* Companies List Table Card */}
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
        {companies.length === 0 ? (
          <div style={{ padding: "36px 24px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
            No companies added yet. Click <strong>Add Company +</strong> to add one.
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
                    width: "15%",
                  }}
                >
                  #
                </th>
                <th
                  style={{
                    textAlign: "left",
                    paddingBottom: "16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#dc2626",
                    borderBottom: "1px solid #f3f4f6",
                    width: "60%",
                  }}
                >
                  Company Name
                </th>
                <th
                  style={{
                    textAlign: "right",
                    paddingBottom: "16px",
                    borderBottom: "1px solid #f3f4f6",
                    width: "25%",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentCompanies.map((company, idx) => {
                const id = company.CompanyID || company._id;
                const name = company.CompanyName || company.companyName || "N/A";
                const absoluteIndex = indexOfFirstItem + idx + 1;

                return (
                  <tr
                    key={id || idx}
                    style={{ borderBottom: idx === currentCompanies.length - 1 ? "none" : "1px solid #f9fafb" }}
                  >
                    {/* Index */}
                    <td style={{ padding: "16px 0", fontSize: "13.5px", color: "#6b7280", fontWeight: "500" }}>
                      {absoluteIndex}
                    </td>

                    {/* Company Name */}
                    <td style={{ padding: "16px 0", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                      {name}
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: "16px 0", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => handleOpenEditModal(company)}
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
                          title="Edit Company"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(id)}
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
                          title="Delete Company"
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
          totalItems={companies.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Modal: Add/Edit Company */}
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
              width: "420px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              boxSizing: "border-box",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#ef4444", margin: 0 }}>
                {editingCompany ? "Edit Company" : "Add New Company"}
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

            {/* Input: Company Name */}
            <div>
              <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                Company Name *
              </label>
              <input
                type="text"
                placeholder="Enter company name (e.g. Equinix, Microsoft)"
                value={companyName}
                onChange={(e) => {
                  setCompanyName(e.target.value);
                  if (errors.companyName) setErrors({ ...errors, companyName: null });
                }}
                style={{
                  width: "100%",
                  backgroundColor: errors.companyName ? "#fef2f2" : "#ffffff",
                  border: errors.companyName ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "13.5px",
                  color: "#1f2937",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                autoFocus
              />
              {errors.companyName && (
                <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                  {errors.companyName}
                </span>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "28px" }}>
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
                onClick={handleSaveCompany}
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
                {editingCompany ? "Update Company" : "Save Company"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
