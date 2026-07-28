import React, { useState, useEffect } from "react";
import { NotificationManager } from "react-notifications";
import idManagementService from "../services/idManagement.service";
import { Edit2, X, ChevronRight } from "lucide-react";

export default function IDManagementPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    idNumber: "",
    visitorName: "",
    phoneNumber: "",
    company: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await idManagementService.getAll();
      if (response && response.success) {
        setRecords(response.records || []);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Fetch records error:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const validateIDForm = () => {
    const newErrors = {};

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "ID Number is required";
    } else if (formData.idNumber.trim().length < 2) {
      newErrors.idNumber = "ID Number must be at least 2 characters";
    }

    if (formData.visitorName && formData.visitorName.trim() !== "") {
      if (formData.visitorName.trim().length < 2) {
        newErrors.visitorName = "Visitor name must be at least 2 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      idNumber: `Tag${records.length + 1}`,
      visitorName: "",
      phoneNumber: "",
      company: "",
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    setFormData({
      idNumber: record.IdNumber || record.idNumber || "",
      visitorName: record.VisitorName || record.visitorName || "",
      phoneNumber: record.PhoneNumber || record.phoneNumber || "",
      company: record.Company || record.company || "",
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleSubmit = async () => {
    if (!validateIDForm()) {
      NotificationManager.warning("Please correct the form errors before saving", "Validation Failed");
      return;
    }

    try {
      const payload = {
        idNumber: formData.idNumber.trim(),
        visitorName: formData.visitorName ? formData.visitorName.trim() : "Guest",
        phoneNumber: formData.phoneNumber ? formData.phoneNumber.trim() : null,
        company: formData.company ? formData.company.trim() : null,
      };

      if (editingRecord) {
        const id = editingRecord.IdManagementID || editingRecord._id;
        const response = await idManagementService.update(id, payload);
        if (response && response.success) {
          NotificationManager.success("Record updated in database successfully", "Success");
          fetchRecords();
          setShowAddModal(false);
        }
      } else {
        const response = await idManagementService.create(payload);
        if (response && response.success) {
          NotificationManager.success("Record saved to database successfully", "Success");
          fetchRecords();
          setShowAddModal(false);
        }
      }
    } catch (error) {
      NotificationManager.error(error.message || "Operation failed", "Error");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this ID record from database?")) {
      try {
        const response = await idManagementService.delete(id);
        if (response && response.success) {
          NotificationManager.success("Record deleted successfully", "Success");
          fetchRecords();
        }
      } catch (error) {
        NotificationManager.error(error.message || "Delete failed", "Error");
      }
    }
  };

  if (loading && records.length === 0) {
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
          maxWidth: "600px",
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: 0, letterSpacing: "-0.01em" }}>
          ID Management
        </h1>

        <button
          onClick={handleOpenAdd}
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

      {/* ID Management Table Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "24px 28px 20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid #e9eaec",
          maxWidth: "600px",
        }}
      >
        {records.length === 0 ? (
          <div style={{ padding: "36px 24px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
            No ID records found in database. Click <strong>Add +</strong> to create your first record.
          </div>
        ) : (
          <>
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
                      width: "35%",
                    }}
                  >
                    Uniq Number
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
                    ID Number
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      paddingBottom: "16px",
                      borderBottom: "1px solid #f3f4f6",
                      width: "25%",
                    }}
                  />
                </tr>
              </thead>

              <tbody>
                {records.map((record, idx) => {
                  const id = record.IdManagementID || record._id || idx + 1;
                  const idNum = record.IdNumber || record.idNumber || `Tag${idx + 1}`;

                  return (
                    <tr key={id} style={{ borderBottom: idx === records.length - 1 ? "none" : "1px solid #f9fafb" }}>
                      {/* Uniq Number Column with Green Active Dot */}
                      <td style={{ padding: "18px 0", fontSize: "13.5px", color: "#1f2937", fontWeight: "500" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              backgroundColor: "#10b981",
                            }}
                          />
                          {idx + 1}
                        </span>
                      </td>

                      {/* ID Number Column */}
                      <td style={{ padding: "18px 0", fontSize: "13.5px", color: "#4b5563" }}>
                        {idNum}
                      </td>

                      {/* Actions Column (Edit & Delete Button) */}
                      <td style={{ padding: "18px 0", textAlign: "right" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(record)}
                            style={{
                              backgroundColor: "#dc2626",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "8px",
                              padding: "6px 14px",
                              fontSize: "13px",
                              fontWeight: "500",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              boxShadow: "0 2px 6px rgba(220, 38, 38, 0.2)",
                            }}
                          >
                            Edit
                            <Edit2 size={12} />
                          </button>

                          {/* Delete X Button */}
                          <button
                            onClick={() => handleDelete(id)}
                            style={{
                              backgroundColor: "#f3f4f6",
                              color: "#6b7280",
                              border: "none",
                              borderRadius: "8px",
                              width: "32px",
                              height: "32px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              transition: "background-color 0.15s, color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#fee2e2";
                              e.currentTarget.style.color = "#dc2626";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f3f4f6";
                              e.currentTarget.style.color = "#6b7280";
                            }}
                            title="Delete"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Bottom Pagination Bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" }}>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    border: "none",
                    backgroundColor: currentPage === page ? "#fee2e2" : "transparent",
                    color: currentPage === page ? "#dc2626" : "#4b5563",
                    fontSize: "13px",
                    fontWeight: currentPage === page ? "700" : "500",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {page}
                </button>
              ))}
              <span style={{ color: "#9ca3af", fontSize: "12px" }}>.........</span>
              <button
                onClick={() => setCurrentPage(6)}
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: currentPage === 6 ? "#fee2e2" : "transparent",
                  color: currentPage === 6 ? "#dc2626" : "#4b5563",
                  fontSize: "13px",
                  fontWeight: currentPage === 6 ? "700" : "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                6
              </button>

              <button
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#ffffff",
                  color: "#4b5563",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal: Add/Edit ID Record */}
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
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "20px",
              padding: "28px",
              width: "400px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#ef4444", margin: "0 0 20px" }}>
              {editingRecord ? "Edit ID Record" : "Add ID Record"}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                  ID Number *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tag1, ID001"
                  value={formData.idNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, idNumber: e.target.value });
                    if (errors.idNumber) setErrors({ ...errors, idNumber: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.idNumber ? "#fef2f2" : "#f9fafb",
                    border: errors.idNumber ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
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

              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                  Visitor Name
                </label>
                <input
                  type="text"
                  placeholder="Visitor Name"
                  value={formData.visitorName}
                  onChange={(e) => {
                    setFormData({ ...formData, visitorName: e.target.value });
                    if (errors.visitorName) setErrors({ ...errors, visitorName: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.visitorName ? "#fef2f2" : "#f9fafb",
                    border: errors.visitorName ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.visitorName && (
                  <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                    {errors.visitorName}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
              <button
                onClick={() => setShowAddModal(false)}
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
                onClick={handleSubmit}
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
