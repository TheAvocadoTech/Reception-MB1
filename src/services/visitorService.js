import QRCode from "qrcode";
import idManagementService from "./idManagement.service";

export const qrUtils = {
  generateQRDataURL: async (text) => {
    try {
      return await QRCode.toDataURL(text, { width: 300, margin: 2 });
    } catch (err) {
      console.error("Error generating QR data URL:", err);
      return null;
    }
  },

  downloadQR: (qrCodeData, visitorName = "visitor") => {
    try {
      const link = document.createElement("a");
      link.href = qrCodeData;
      link.download = `qr-${visitorName.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (error) {
      console.error("Error downloading QR code:", error);
      return false;
    }
  },

  printQR: (qrCodeData, visitorData = {}) => {
    try {
      const printWindow = window.open("", "_blank", "width=600,height=700");
      if (!printWindow) {
        alert("Please allow popups for printing");
        return false;
      }

      const date = new Date().toLocaleString();
      const visitorName = visitorData.name || visitorData.VisitorName || "Visitor";
      const phoneNumber = visitorData.phone || visitorData.PhoneNumber || "N/A";
      const company = visitorData.company || visitorData.Company || "N/A";
      const idNumber = visitorData.idNumber || visitorData.IdNumber || "N/A";

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${visitorName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: 'Inter', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #f5f5f5;
                padding: 20px;
              }
              .qr-container {
                background: white;
                padding: 40px;
                border-radius: 16px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                max-width: 500px;
                width: 100%;
                text-align: center;
              }
              .header {
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
              }
              .header h1 {
                color: #ef4444;
                font-size: 24px;
                margin-bottom: 5px;
              }
              .visitor-info {
                margin: 20px 0;
                text-align: left;
                background: #f9fafb;
                padding: 15px;
                border-radius: 8px;
              }
              .visitor-info .info-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .visitor-info .label { color: #6b7280; font-weight: 500; }
              .visitor-info .value { color: #1f2937; font-weight: 600; }
              .qr-image img { max-width: 250px; height: auto; }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="header">
                <h1>🏢 Visitor Pass</h1>
                <p>Generated on ${date}</p>
              </div>
              <div class="visitor-info">
                <div class="info-row"><span class="label">Name</span><span class="value">${visitorName}</span></div>
                <div class="info-row"><span class="label">Phone</span><span class="value">${phoneNumber}</span></div>
                <div class="info-row"><span class="label">Company</span><span class="value">${company}</span></div>
                <div class="info-row"><span class="label">ID Number</span><span class="value">${idNumber}</span></div>
              </div>
              <div class="qr-image"><img src="${qrCodeData}" alt="QR Code" /></div>
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() { window.print(); }, 400);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      return true;
    } catch (error) {
      console.error("Error printing QR code:", error);
      return false;
    }
  },

  copyToken: async (token) => {
    try {
      await navigator.clipboard.writeText(token);
      return true;
    } catch (error) {
      console.error("Error copying token:", error);
      return false;
    }
  },

  shareQR: async (qrCodeData, visitorName = "Visitor") => {
    try {
      const response = await fetch(qrCodeData);
      const blob = await response.blob();
      const file = new File([blob], `qr-${visitorName}.png`, { type: "image/png" });
      if (navigator.share) {
        await navigator.share({
          title: `QR Code for ${visitorName}`,
          text: `Visitor Pass for ${visitorName}`,
          files: [file],
        });
        return true;
      } else {
        await navigator.clipboard.writeText(qrCodeData);
        alert("QR image URL copied to clipboard!");
        return true;
      }
    } catch (error) {
      console.error("Error sharing QR code:", error);
      return false;
    }
  },
};

export const visitorService = {
  getAllVisitors: async (params = {}) => {
    const res = await idManagementService.getAll(params);
    const records = res.records || [];
    return {
      success: true,
      count: res.total || records.length,
      data: records,
    };
  },

  createVisitor: async (visitorData) => {
    const payload = {
      visitorName: visitorData.visitorName || visitorData.name,
      phoneNumber: visitorData.phoneNumber || visitorData.contact,
      email: visitorData.email,
      company: visitorData.company,
      purpose: visitorData.purpose || "Meeting",
      idType: visitorData.idType || "Visitor",
      idNumber: visitorData.idNumber,
      status: "Active",
    };
    const res = await idManagementService.create(payload);
    return {
      success: true,
      data: {
        id: res.data?.IdManagementID || res.data?._id,
        ...res.data,
      },
    };
  },

  deleteVisitor: async (id) => {
    return await idManagementService.delete(id);
  },

  assignTag: async (id, idNumber, company) => {
    return await idManagementService.assignTag(id, idNumber, company);
  },

  endVisit: async (id) => {
    return await idManagementService.endVisit(id);
  },

  exportVisitorsCSV: (visitors) => {
    try {
      const headers = ["Name", "Phone", "Email", "Company", "ID Number", "Status", "Created At"];
      const rows = visitors.map((v) => [
        v.name || v.visitorName || "",
        v.phone || v.phoneNumber || "",
        v.email || "",
        v.company || "",
        v.idNumber || "",
        v.status || "Active",
        v.createdAt ? new Date(v.createdAt).toLocaleString() : "",
      ]);
      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `visitors-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Error exporting CSV:", error);
      return false;
    }
  },
};

export default visitorService;
