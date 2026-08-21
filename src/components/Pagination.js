import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) {
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers array
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "20px",
        marginTop: "16px",
        borderTop: "1px solid #f3f4f6",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Item count summary */}
      <div style={{ fontSize: "13px", color: "#6b7280", fontWeight: "500" }}>
        Showing <span style={{ color: "#1f2937", fontWeight: "600" }}>{startItem}</span> to{" "}
        <span style={{ color: "#1f2937", fontWeight: "600" }}>{endItem}</span> of{" "}
        <span style={{ color: "#1f2937", fontWeight: "600" }}>{totalItems}</span> entries
      </div>

      {/* Pagination Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            backgroundColor: currentPage === 1 ? "#f9fafb" : "#ffffff",
            color: currentPage === 1 ? "#d1d5db" : "#374151",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Numbers */}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "32px",
              height: "32px",
              padding: "0 8px",
              borderRadius: "8px",
              border: page === currentPage ? "none" : "1px solid #e5e7eb",
              backgroundColor: page === currentPage ? "#1f2937" : "#ffffff",
              color: page === currentPage ? "#ffffff" : "#374151",
              fontSize: "13px",
              fontWeight: page === currentPage ? "700" : "500",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {page}
          </button>
        ))}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            backgroundColor: currentPage === totalPages ? "#f9fafb" : "#ffffff",
            color: currentPage === totalPages ? "#d1d5db" : "#374151",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            transition: "all 0.15s ease",
          }}
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
