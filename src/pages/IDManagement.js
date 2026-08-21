import React, { useState, useEffect, useCallback } from "react";
import { NotificationManager } from "react-notifications";
import idManagementService from "../services/idManagement.service";
import Pagination from "../components/Pagination";
import { Tag, Edit2, Trash2, X, CheckCircle2, Clock } from "lucide-react";

export default function IDManagementPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({
    idNumber: "",
    nickname: "",
  });
  const [errors, setErrors] = useState({});

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true);
      const response = await idManagementService.getAllTags();
      if (response && response.success) {
        setTags(response.tags || []);
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error("Fetch tags error:", error);
      setTags([]);
      NotificationManager.error(error.message || "Failed to load ID tags", "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = "ID Name / Code is required";
    } else if (formData.idNumber.trim().length < 1) {
      newErrors.idNumber = "ID Name must not be empty";
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = "Nickname is required";
    } else if (formData.nickname.trim().length < 2) {
      newErrors.nickname = "Nickname must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingTag(null);
    setFormData({
      idNumber: `Tag${tags.length + 1}`,
      nickname: "",
    });
    setErrors({});
    setShowModal(true);
  };

  const handleOpenEdit = (tag) => {
    setEditingTag(tag);
    setFormData({
      idNumber: tag.idNumber || "",
      nickname: tag.nickname || "",
    });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTag(null);
    setFormData({ idNumber: "", nickname: "" });
    setErrors({});
  };

  const handleSaveTag = async () => {
    if (!validateForm()) {
      NotificationManager.warning("Please correct the form errors before saving", "Validation Failed");
      return;
    }

    try {
      const payload = {
        idNumber: formData.idNumber.trim(),
        nickname: formData.nickname.trim(),
      };

      if (editingTag) {
        const id = editingTag.tagId || editingTag.TagID;
        const response = await idManagementService.updateTag(id, payload);
        if (response && response.success) {
          NotificationManager.success("ID Tag updated successfully", "Success");
          fetchTags();
          handleCloseModal();
        }
      } else {
        const response = await idManagementService.createTag(payload);
        if (response && response.success) {
          NotificationManager.success("ID Tag created successfully", "Success");
          fetchTags();
          handleCloseModal();
        }
      }
    } catch (error) {
      NotificationManager.error(error.message || "Operation failed", "Error");
    }
  };

  const handleDeleteTag = async (id) => {
    if (window.confirm("Are you sure you want to delete this ID tag?")) {
      try {
        const response = await idManagementService.deleteTag(id);
        if (response && response.success) {
          NotificationManager.success("ID Tag deleted successfully", "Success");
          fetchTags();
        }
      } catch (error) {
        NotificationManager.error(error.message || "Delete failed", "Error");
      }
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const totalPages = Math.ceil(tags.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTags = tags.slice(indexOfFirstItem, indexOfLastItem);

  if (loading && tags.length === 0) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="animate-spin-custom" style={{ width: "40px", height: "40px", border: "4px solid #dc2626", borderTopColor: "transparent", borderRadius: "50%" }}></div>
      </div>
    );
  }

  const availableCount = tags.filter((t) => t.isAvailable).length;
  const inUseCount = tags.length - availableCount;

  return (
    <div style={{ padding: "28px 32px", fontFamily: "Inter, sans-serif" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          maxWidth: "760px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#1f2937", margin: 0, letterSpacing: "-0.01em" }}>
            ID Management
          </h1>
          <p style={{ fontSize: "13px", color: "#6b7280", margin: "4px 0 0" }}>
            Configure visitor RFID tags and badge nicknames for check-in
          </p>
        </div>

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
            padding: "9px 18px",
            fontSize: "13.5px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#111827")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1f2937")}
        >
          Add ID Tag +
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "28px", maxWidth: "760px" }}>
        {/* Total Tags */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            padding: "20px 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid #e9eaec",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#e0f2fe", display: "flex", alignItems: "center", justifyContent: "center", color: "#0284c7" }}>
              <Tag size={16} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#4b5563" }}>Total ID Tags</span>
          </div>
          <span style={{ fontSize: "32px", fontWeight: "800", color: "#1f2937" }}>{tags.length}</span>
        </div>

        {/* Available Tags */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            padding: "20px 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid #e9eaec",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", color: "#10b981" }}>
              <CheckCircle2 size={16} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#4b5563" }}>Available (Free)</span>
          </div>
          <span style={{ fontSize: "32px", fontWeight: "800", color: "#10b981" }}>{availableCount}</span>
        </div>

        {/* In Use Tags */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#ffffff",
            borderRadius: "18px",
            padding: "20px 24px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            border: "1px solid #e9eaec",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
              <Clock size={16} />
            </div>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#4b5563" }}>In Use (Until 12 AM)</span>
          </div>
          <span style={{ fontSize: "32px", fontWeight: "800", color: "#ef4444" }}>{inUseCount}</span>
        </div>
      </div>

      {/* ID Management Table Card */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "24px 28px 20px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          border: "1px solid #e9eaec",
          maxWidth: "760px",
        }}
      >
        {tags.length === 0 ? (
          <div style={{ padding: "36px 24px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
            No ID tags found in database. Click <strong>Add ID Tag +</strong> to create your first tag.
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
                    width: "25%",
                  }}
                >
                  ID Name
                </th>
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
                  Nickname (In Dropdown)
                </th>
                <th
                  style={{
                    textAlign: "left",
                    paddingBottom: "16px",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#dc2626",
                    borderBottom: "1px solid #f3f4f6",
                    width: "25%",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    textAlign: "right",
                    paddingBottom: "16px",
                    borderBottom: "1px solid #f3f4f6",
                    width: "15%",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {currentTags.map((tag, idx) => {
                const id = tag.tagId || tag.TagID || idx + 1;
                const idNum = tag.idNumber || tag.IdNumber || `Tag${idx + 1}`;
                const nickname = tag.nickname || tag.Nickname || "N/A";
                const isAvailable = tag.isAvailable !== false;
                const assignedVis = tag.assignedVisitorName;

                return (
                  <tr key={id} style={{ borderBottom: idx === currentTags.length - 1 ? "none" : "1px solid #f9fafb" }}>
                    {/* ID Name Column */}
                    <td style={{ padding: "16px 0", fontSize: "14px", color: "#1f2937", fontWeight: "600" }}>
                      {idNum}
                    </td>

                    {/* Nickname Column */}
                    <td style={{ padding: "16px 0", fontSize: "13.5px", color: "#4b5563" }}>
                      {nickname}
                    </td>

                    {/* Status Column */}
                    <td style={{ padding: "16px 0", fontSize: "12.5px" }}>
                      {isAvailable ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            backgroundColor: "#ecfdf5",
                            color: "#059669",
                            fontWeight: "600",
                          }}
                        >
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#10b981" }} />
                          Available
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            backgroundColor: "#fef2f2",
                            color: "#dc2626",
                            fontWeight: "600",
                          }}
                          title={`Assigned to ${assignedVis || "Visitor"} (Expires at 12 AM midnight)`}
                        >
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#ef4444" }} />
                          In Use {assignedVis ? `(${assignedVis})` : ""}
                        </span>
                      )}
                    </td>

                    {/* Actions Column (Edit & Delete Button) */}
                    <td style={{ padding: "16px 0", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                        <button
                          onClick={() => handleOpenEdit(tag)}
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
                          title="Edit Tag"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteTag(id)}
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
                          title="Delete Tag"
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
          totalItems={tags.length}
          itemsPerPage={itemsPerPage}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Modal: Add/Edit ID Tag */}
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
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "19px", fontWeight: "700", color: "#ef4444", margin: 0 }}>
                {editingTag ? "Edit ID Tag" : "Add ID Tag"}
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
              {/* ID Name */}
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                  ID Name / Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. V001, Tag 1, 30395DFA"
                  value={formData.idNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, idNumber: e.target.value });
                    if (errors.idNumber) setErrors({ ...errors, idNumber: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.idNumber ? "#fef2f2" : "#ffffff",
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

              {/* Nickname */}
              <div>
                <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#4b5563", display: "block", marginBottom: "6px" }}>
                  Nickname (Shown in Visitor Dropdown) *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Visitor Badge 1, VIP Tag"
                  value={formData.nickname}
                  onChange={(e) => {
                    setFormData({ ...formData, nickname: e.target.value });
                    if (errors.nickname) setErrors({ ...errors, nickname: null });
                  }}
                  style={{
                    width: "100%",
                    backgroundColor: errors.nickname ? "#fef2f2" : "#ffffff",
                    border: errors.nickname ? "1.5px solid #ef4444" : "1px solid #e5e7eb",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    fontSize: "13.5px",
                    color: "#1f2937",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.nickname && (
                  <span style={{ fontSize: "11.5px", color: "#ef4444", fontWeight: "500", marginTop: "4px", display: "block" }}>
                    {errors.nickname}
                  </span>
                )}
              </div>
            </div>

            {/* Modal Actions */}
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
                onClick={handleSaveTag}
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
                {editingTag ? "Update Tag" : "Save Tag"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
