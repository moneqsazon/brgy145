import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import CaloocanLogo from "../../assets/CaloocanLogo.png";
import Logo145 from "../../assets/Logo145.png";
import { useCertificateManager } from '../../hooks/useCertificateManager';

// MUI
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Card,
  CardContent,
  CardHeader,
  InputAdornment,
  IconButton,
  Stack,
  Autocomplete,
  Tabs,
  Tab,
  createTheme,
  ThemeProvider,
  Divider,
  Grid,
  Fab,
  AppBar,
  Toolbar,
  Chip,
  Avatar,
  useMediaQuery,
  Badge,
  Tooltip,
} from "@mui/material";

import {
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Visibility as EyeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as FileTextIcon,
  QrCodeScanner as QrCodeIcon,
  Print as PrintIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  Folder as FolderIcon,
  History as HistoryIcon,
  Receipt as ReceiptIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";

const theme = createTheme({
  palette: {
    primary: { main: "#41644A", light: "#A0B2A6", dark: "#0D4715" },
    secondary: { main: "#E9762B" },
    success: { main: "#41644A" },
    background: { default: "#F1F0E9", paper: "#FFFFFF" },
    text: { primary: "#000000", secondary: "#41644A" },
    error: { main: "#E9762B" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { 
          textTransform: "none", 
          fontWeight: 600, 
          borderRadius: 8,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
          }
        },
        containedPrimary: {
          background: "linear-gradient(45deg, #41644A 30%, #527D60 90%)",
        },
        containedSecondary: {
          background: "linear-gradient(45deg, #E9762B 30%, #F4944D 90%)",
        }
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none"
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          minHeight: 48,
          color: "#000000",
          "&.Mui-selected": {
            color: "#41644A"
          }
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: "#000000",
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#000000",
          "&.Mui-focused": {
            color: "#41644A"
          }
        }
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: "#000000"
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000000"
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#41644A"
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#41644A"
          }
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#000000"
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#41644A"
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#41644A"
            }
          }
        }
      }
    }
  },
});

export default function CertificateOfAction() {
  const apiBase = "http://localhost:5000"; // change to include /api if needed

  const [records, setRecords] = useState([]);
  const [residents, setResidents] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
  saveCertificate,
  getValidityPeriod,
  calculateExpirationDate
} = useCertificateManager('Certificate of Action');

  

  

  const [formData, setFormData] = useState({
    certificate_of_action_id: "",
    resident_id: "",
    complainant_name: "",
    respondent_name: "",
    barangay_case_no: "",
    request_reason: "",
    filed_date: new Date().toISOString().split("T")[0],
    date_issued: new Date().toISOString().split("T")[0],
    transaction_number: "",
    is_active: 1,
    date_created: "",
  });

  // formatting helpers
  function formatDateDisplay(dateString) {
    if (!dateString) return "";
    const dateOnly = dateString.includes("T") ? dateString.split("T")[0] : dateString;
    const [year, month, day] = dateOnly.split("-");
    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    return `${monthNames[parseInt(month,10)-1]} ${parseInt(day,10)}, ${year}`;
  }
  function formatDateTimeDisplay(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const monthNames = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  }

  function generateTransactionNumber() {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `COA-${yy}${mm}${dd}-${rand}`;
  }

  function storeCertificateData(cert) {
    if (!cert) return;
    const existing = JSON.parse(localStorage.getItem("certificates") || "{}");
    const key = cert.certificate_of_action_id || `draft-${cert.transaction_number || "no-txn"}`;
    existing[key] = cert;
    localStorage.setItem("certificates", JSON.stringify(existing));
  }

  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`);
      const data = await res.json();
      setResidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Could not load residents:", err);
    }
  }

  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/certificate-of-action`);
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              certificate_of_action_id: r.certificate_of_action_id,
              resident_id: r.resident_id,
              complainant_name: r.complainant_name,
              respondent_name: r.respondent_name,
              barangay_case_no: r.barangay_case_no,
              request_reason: r.request_reason,
              filed_date: r.filed_date ? r.filed_date.split("T")[0] : "",
              date_issued: r.date_issued ? r.date_issued.split("T")[0] : "",
              transaction_number: r.transaction_number || generateTransactionNumber(),
              is_active: r.is_active ?? 1,
              date_created: r.date_created,
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load certificate_of_action records", e);
    }
  }

  useEffect(() => {
    loadResidents();
    loadRecords();
  }, []);

  const display = useMemo(() => {
    if (editingId || isFormOpen) return formData;
    if (selectedRecord) return selectedRecord;
    return formData;
  }, [editingId, isFormOpen, selectedRecord, formData]);

  // QR generation: visible for drafts too — once complainant_name exists
  useEffect(() => {
    const make = async () => {
      if (!display || !display.complainant_name) {
        setQrCodeUrl("");
        return;
      }
      const content = `Certificate of Action\nTransaction: ${display.transaction_number || "N/A"}\nComplainant: ${display.complainant_name}\nCase: ${display.barangay_case_no || ""}\nIssued: ${display.date_issued || ""}`;
      try {
        const url = await QRCode.toDataURL(content, { width: 140, margin: 1 });
        setQrCodeUrl(url);
        storeCertificateData(display);
      } catch (err) {
        console.error("QR error", err);
      }
    };
    make();
  }, [display.complainant_name, display.transaction_number, display.barangay_case_no, display.date_issued, display.certificate_of_action_id]);

  function toServerPayload(data) {
    return {
      resident_id: data.resident_id || null,
      complainant_name: data.complainant_name,
      respondent_name: data.respondent_name,
      barangay_case_no: data.barangay_case_no,
      request_reason: data.request_reason,
      filed_date: data.filed_date || null,
      date_issued: data.date_issued || null,
      transaction_number: data.transaction_number,
      is_active: data.is_active ?? 1,
    };
  }

    async function handleCreate() {
    try {
      const tx = generateTransactionNumber();
      const validityPeriod = getValidityPeriod('Certificate of Action');
      const updated = { 
        ...formData, 
        transaction_number: tx, 
        date_created: new Date().toISOString(),
        validity_period: validityPeriod, // Add validity period
      };
      const res = await fetch(`${apiBase}/certificate-of-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toServerPayload(updated)),
      });
      if (!res.ok) throw new Error("Create failed");
      const created = await res.json();
      const newRec = { ...updated, certificate_of_action_id: created.certificate_of_action_id };
      setRecords([newRec, ...records]);
      setSelectedRecord(newRec);
      
      // Save to certificates table, mapping complainant_name to full_name
      await saveCertificate({
        ...newRec,
        full_name: newRec.complainant_name, // Map complainant_name to full_name for the central table
      }, true);
      
      storeCertificateData(newRec);
      resetForm();
      setActiveTab("records");
    } catch (e) {
      console.error(e);
      alert("Failed to create record");
    }
  }

    async function handleUpdate() {
    try {
      const validityPeriod = getValidityPeriod('Certificate of Action');
      const updated = { 
        ...formData, 
        validity_period: validityPeriod, // Add validity period
      };
      const res = await fetch(`${apiBase}/certificate-of-action/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toServerPayload(updated)),
      });
      if (!res.ok) throw new Error("Update failed");
      const updatedRec = { ...updated, certificate_of_action_id: editingId };
      setRecords(records.map((r) => (r.certificate_of_action_id === editingId ? updatedRec : r)));
      setSelectedRecord(updatedRec);
      
      // Save to certificates table, mapping complainant_name to full_name
      await saveCertificate({
        ...updatedRec,
        full_name: updatedRec.complainant_name, // Map complainant_name to full_name for the central table
      }, false);
      
      storeCertificateData(updatedRec);
      resetForm();
      setActiveTab("records");
    } catch (e) {
      console.error(e);
      alert("Failed to update record");
    }
  }

  function handleEdit(record) {
    setFormData({
      ...record,
      filed_date: record.filed_date || record.filedDate || "",
      date_issued: record.date_issued || record.dateIssued || "",
    });
    setEditingId(record.certificate_of_action_id);
    setIsFormOpen(true);
    setActiveTab("form");
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this record?")) return;
    try {
      const res = await fetch(`${apiBase}/certificate-of-action/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setRecords(records.filter((r) => r.certificate_of_action_id !== id));
      if (selectedRecord?.certificate_of_action_id === id) setSelectedRecord(null);
      const existing = JSON.parse(localStorage.getItem("certificates") || "{}");
      delete existing[id];
      localStorage.setItem("certificates", JSON.stringify(existing));
    } catch (e) {
      console.error(e);
      alert("Failed to delete record");
    }
  }

  function handleView(record) {
    setSelectedRecord(record);
    setFormData({ ...record });
    setEditingId(record.certificate_of_action_id);
    setIsFormOpen(true);
    setActiveTab("form");
  }

  function resetForm() {
    setFormData({
      certificate_of_action_id: "",
      resident_id: "",
      complainant_name: "",
      respondent_name: "",
      barangay_case_no: "",
      request_reason: "",
      filed_date: new Date().toISOString().split("T")[0],
      date_issued: new Date().toISOString().split("T")[0],
      transaction_number: "",
      is_active: 1,
      date_created: "",
    });
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedRecord(null);
  }

  function handleSubmit() {
    if (editingId) handleUpdate();
    else handleCreate();
  }

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          (r.complainant_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.respondent_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.barangay_case_no || "").toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [records, searchTerm]
  );

  const transactionFilteredRecords = useMemo(
    () => records.filter((r) => (r.transaction_number || "").toLowerCase().includes(transactionSearch.toLowerCase())),
    [records, transactionSearch]
  );

  function handleTransactionSearch() {
    if (!transactionSearch) return;
    const found = records.find((r) => (r.transaction_number || "").toLowerCase() === transactionSearch.toLowerCase());
    if (found) handleView(found);
    else alert("No certificate found with this transaction number");
  }

  async function generatePDF() {
    if (!display.certificate_of_action_id) {
      alert("Please save the record first before downloading PDF");
      return;
    }
    setIsGeneratingPDF(true);
    try {
      const el = document.getElementById("certificate-preview");
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: [8.5, 11] });
      pdf.addImage(imgData, "PNG", 0, 0, 8.5, 11);

      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont(undefined, "bold");
      pdf.text("Certificate Verification Information", 0.5, 0.75);
      pdf.setLineWidth(0.02);
      pdf.line(0.5, 0.85, 8, 0.85);
      pdf.setFontSize(12);
      pdf.setFont(undefined, "normal");

      const createdDate = display.date_created ? formatDateTimeDisplay(display.date_created) : new Date().toLocaleString();
      let yPos = 1.2;
      const lineHeight = 0.25;
      const details = [
        `Certificate Type: Certificate of Action`,
        `Certificate ID: ${display.certificate_of_action_id}`,
        `Transaction Number: ${display.transaction_number}`,
        ``,
        `Complainant: ${display.complainant_name}`,
        `Respondent: ${display.respondent_name}`,
        `Case No: ${display.barangay_case_no}`,
        `Request Reason: ${display.request_reason}`,
        ``,
        `Filed Date: ${formatDateDisplay(display.filed_date)}`,
        `Date Issued: ${formatDateDisplay(display.date_issued)}`,
        `Date Created (E-Signature Applied): ${createdDate}`,
        ``,
        `Issued by: Barangay 145 Zone 13 Dist. 1, Caloocan City`,
        `Verification URL: ${window.location.origin}/verify-certificate?id=${display.certificate_of_action_id}`,
      ];
      details.forEach((line) => {
        pdf.text(line, 0.5, yPos);
        yPos += lineHeight;
      });

      const filename = `CertificateOfAction_${display.certificate_of_action_id}_${(display.complainant_name||'').replace(/\s+/g,'_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  }
function handlePrint() {
    // Check if there's a certificate to print
    if (!display.certificate_of_action_id) {
      alert('Please save the record first before printing');
      return;
    }

    // 1. Get the certificate element
    const certificateElement = document.getElementById('certificate-preview');
    if (!certificateElement) {
      alert('Certificate not found for printing.');
      return;
    }

    // 2. Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px'; // Move it way off-screen
    iframe.style.top = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    document.body.appendChild(iframe);

    // 3. Write the certificate content and styles into the iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Certificate</title>
          <style>
            @page {
              size: 8.5in 11in;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            #certificate-preview {
              width: 8.5in;
              height: 11in;
              position: relative;
              overflow: hidden;
              background: white;
              box-sizing: border-box;
            }
            #certificate-preview * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          ${certificateElement.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    // 4. Trigger the print dialog once the iframe content is loaded
    setTimeout(() => {
      const iframeWindow = iframe.contentWindow || iframe;
      iframeWindow.focus(); // Required for some browsers
      iframeWindow.print();

      // 5. Clean up by removing the iframe after the print dialog
      window.onafterprint = () => {
        document.body.removeChild(iframe);
      };
      // Fallback cleanup in case onafterprint doesn't fire
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 250); // A short delay to render
  }

  const handleZoomIn = () => setZoomLevel((p) => Math.min(p + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((p) => Math.max(p - 0.1, 0.3));
  const handleResetZoom = () => setZoomLevel(0.75);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "+" || e.key === "=") { e.preventDefault(); handleZoomIn(); }
        if (e.key === "-") { e.preventDefault(); handleZoomOut(); }
        if (e.key === "0") { e.preventDefault(); handleResetZoom(); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // open verify page
  function openVerifyPage() {
    const id = display.certificate_of_action_id;
    if (id) {
      window.open(`${window.location.origin}/verify-certificate?id=${id}`, "_blank");
    } else {
      const key = `draft-${display.transaction_number || "no-txn"}`;
      storeCertificateData({ ...display, certificate_of_action_id: key });
      window.open(`${window.location.origin}/verify-certificate?id=${encodeURIComponent(key)}`, "_blank");
    }
  }

  // if resident selected -> autofill complainant_name
  function onResidentSelect(option) {
    if (option) {
      setFormData((prev) => ({
        ...prev,
        resident_id: option.resident_id,
        complainant_name: option.full_name || prev.complainant_name,
      }));
    } else {
      setFormData((prev) => ({ ...prev, resident_id: "", complainant_name: "" }));
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", bgcolor: "background.default" }}>
        {/* TOP HEADER */}
        <Paper elevation={2} sx={{ zIndex: 10, borderRadius: 0 }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            p: 2,
            bgcolor: "primary.main",
            color: "white"
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar src={Logo145} sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Certificate of Action 
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all records of the Certificate of Action
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Badge badgeContent={records.length} color="secondary">
                <Chip 
                  icon={<FolderIcon />}
                  label="Total Records" 
                  sx={{ 
                    bgcolor: "rgba(255,255,255,0.2)", 
                    color: "white",
                    fontWeight: 600
                  }} 
                />
              </Badge>
              
              <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<AddIcon />} 
                onClick={() => { resetForm(); setIsFormOpen(true); setActiveTab("form"); }}
                sx={{ borderRadius: 20, px: 3 }}
              >
                New Certificate
              </Button>
            </Box>
          </Box>

          {/* NAVIGATION TABS */}
          <Box sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
            <Box sx={{ maxWidth: 1200, mx: "auto" }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, nv) => setActiveTab(nv)} 
                variant="fullWidth"
                sx={{ 
                  "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
                  minHeight: 48
                }}
              >
                <Tab 
                  icon={<ArticleIcon />} 
                  label="Form" 
                  value="form"
                  iconPosition="start"
                />
                <Tab 
                  icon={<FolderIcon />} 
                  label={`Records (${records.length})`} 
                  value="records"
                  iconPosition="start"
                />
                <Tab 
                  icon={<ReceiptIcon />} 
                  label="Transaction" 
                  value="transaction"
                  iconPosition="start"
                />
              </Tabs>
            </Box>
          </Box>
        </Paper>

        {/* MAIN CONTENT AREA */}
        <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* LEFT: Certificate preview */}
          <Box sx={{ 
            flex: 1, 
            overflow: "auto", 
            display: "flex", 
            flexDirection: "column", 
            bgcolor: "background.default",
            p: 2,
            [theme.breakpoints.down('lg')]: { display: activeTab === "form" ? 'none' : 'flex' }
          }}>
            {/* ZOOM CONTROLS */}
            <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
              <Box sx={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1
              }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Tooltip title="Zoom Out">
                    <IconButton onClick={handleZoomOut} color="primary" size="small">
                      <ZoomOutIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="body2" sx={{ 
                    minWidth: 60, 
                    textAlign: "center", 
                    fontWeight: 600,
                    px: 1,
                    py: 0.5,
                    bgcolor: "background.paper",
                    borderRadius: 1,
                    color: "#000000"
                  }}>
                    {Math.round(zoomLevel * 100)}%
                  </Typography>
                  <Tooltip title="Zoom In">
                    <IconButton onClick={handleZoomIn} color="primary" size="small">
                      <ZoomInIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reset Zoom">
                    <IconButton onClick={handleResetZoom} color="primary" size="small">
                      <ResetIcon />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title="Verify Certificate">
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={() => { 
                        if (display.certificate_of_action_id) 
                          window.open(window.location.origin + `/verify-certificate?id=${display.certificate_of_action_id}`, "_blank"); 
                      }} 
                      startIcon={<QrCodeIcon />} 
                      disabled={!display.certificate_of_action_id}
                      size="small"
                    >
                      Verify
                    </Button>
                  </Tooltip>
                  <Tooltip title="Download PDF">
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      onClick={generatePDF} 
                      disabled={!display.certificate_of_action_id || isGeneratingPDF} 
                      startIcon={<FileTextIcon />}
                      size="small"
                    >
                      {isGeneratingPDF ? "Generating..." : "Download"}
                    </Button>
                  </Tooltip>
                  <Tooltip title="Print">
                    <Button 
                      variant="outlined" 
                      onClick={handlePrint} 
                      disabled={!display.certificate_of_action_id}
                      startIcon={<PrintIcon />}
                      size="small"
                    >
                      Print
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            </Paper>

            {/* CERTIFICATE PREVIEW */}
            <Box sx={{ 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "flex-start", 
              flex: 1, 
              overflow: "auto",
              p: 1
            }}>
              <Box sx={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}>
                <Box id="certificate-preview" sx={{ ...certificateStyles.page }}>
                  {/* Logos */}
                  <img src={CaloocanLogo} alt="City Logo" style={{ width: "100px", position: "absolute", top: "20px", left: "20px" }} />
                  <img src={Logo145} alt="Barangay Logo" style={{ width: "120px", position: "absolute", top: "20px", right: "20px" }} />
                  <img src={Logo145} alt="Watermark" style={certificateStyles.watermarkImg} />

                  {/* Header texts */}
                  <div style={{ fontFamily: '"Lucida Calligraphy", cursive', fontSize: "20px", textAlign: "center" }}>Republic of the Philippines</div>
                  <div style={{ fontFamily: "Arial, sans-serif", fontSize: "20px", textAlign: "center" }}>CITY OF CALOOCAN</div>
                  <div style={{ fontFamily: "Arial Black, Gadget, sans-serif", fontSize: "15px", textAlign: "center" }}>
                    BARANGAY 145 ZONES 13 DIST. 1 <br />
                    Tel. No. 8711-7134
                  </div>
                  <div style={{ fontFamily: "Arial Black, Gadget, sans-serif", fontSize: "20px", textAlign: "center", marginBottom: "20px" }}>OFFICE OF THE BARANGAY CHAIRMAN</div>
                  <div style={certificateStyles.lupon}>OFFICE OF THE LUPONG TAGAPAMAYAPA</div>

                  {/* date */}
                  <div style={certificateStyles.date}>
                    {display.date_issued ? formatDateDisplay(display.date_issued) : ""}
                  </div>

                  {/* case info */}
                  <div style={certificateStyles.caseInfo}>
                    {display.barangay_case_no ? `BARANGAY CASE NO. ${display.barangay_case_no}` : "BARANGAY CASE NO. ________"} <br />
                    FOR: {display.request_reason ? display.request_reason : "________________"}
                  </div>

                  {/* Parties */}
                  <div style={certificateStyles.content}>
                    <p>
                      <b>{display.complainant_name || "________________"}</b>
                      <br />
                      <b>COMPLAINANT</b>
                    </p>
                    <p style={{ textAlign: "left" }}>-against-</p>
                    <p>
                      <b>{display.respondent_name || "________________"}</b>
                      <br />
                      <b>RESPONDENT</b>
                    </p>
                  </div>

                  {/* Title */}
                  <div style={{ fontFamily: "Calibri", fontSize: "20px", textAlign: "center", fontStyle: "italic" }}>CERTIFICATION TO FILE ACTION</div>

                  {/* Body */}
                  <div style={certificateStyles.content}>
                    <b style={{ paddingBottom: "150px" }}>This is to certify that:</b>
                    <ol style={{ paddingLeft: "7.5em", paddingBottom: "30px" }}>
                      <li style={{ marginBottom: "15px" }}>
                        <b>This complaint was filed on {display.filed_date ? formatDateDisplay(display.filed_date) : "__________"}.</b>
                      </li>
                      <li style={{ marginBottom: "15px" }}>
                        <b>
                          There has no personal confrontation between the parties before the Punong Barangay because the respondent was absent and that mediation failed.
                        </b>
                      </li>
                      <li style={{ marginBottom: "15px" }}>
                        <b>
                          The Pangkat Tagapagkasundo was constituted but there has been no personal confrontation before the Pangkat likewise did not result into a settlement because the respondent was absent.
                        </b>
                      </li>
                      <li>
                        <b>
                          Therefore, the corresponding complaint for the dispute may now be filed in the court/government office.
                        </b>
                      </li>
                    </ol>
                  </div>

                  <div style={certificateStyles.content}>
                    <b>Issued this {display.date_issued ? (() => {
                      const date = new Date(display.date_issued);
                      const day = date.getDate();
                      const month = date.toLocaleString("default", { month: "long" });
                      const year = date.getFullYear();
                      const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
                      return `${day}${suffix} day of ${month}, ${year}`;
                    })() : "__________"}, at Barangay 145 office.</b>
                  </div>

                  {/* Signatures */}
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", width: "100%", fontStyle: "italic" }}>
                    <div>
                      <div style={{ fontFamily: "Calibri, sans-serif", fontSize: "15px", textAlign: "center" }}>
                        <b>Prepared by:</b> <br /><br /><br />
                        <b style={{ fontSize: "20px" }}>Rosalina P. Anore</b>
                        <br />
                        <b style={{ display: "block", textAlign: "center", fontSize: "15px" }}>Secretary</b>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", fontFamily: "Calibri, sans-serif", fontSize: "22px" }}>
                      <br /><br /><br /><br /><br /><br />
                      <b>ARNOLD L. DONDONAYOS</b>
                      <br />
                      <b>Barangay 145 Chairperson</b>
                    </div>
                  </div>

                  {/* QR Code */}
                  {qrCodeUrl && (
                    <div style={{ position: "absolute", bottom: 60, left: 60, textAlign: "center", fontFamily: '"Times New Roman", serif', fontSize: "10pt", fontWeight: "bold" }}>
                      <div onClick={openVerifyPage} style={{ cursor: "pointer", display: "inline-block" }} title="Click to verify this certificate">
                        <img src={qrCodeUrl} alt="QR" style={{ width: 120, height: 120, border: "2px solid #000", padding: 5, background: "#fff" }} />
                      </div>
                      <div style={{ fontSize: "8pt", color: "#666", marginTop: 6 }}>
                        {display.date_created ? formatDateTimeDisplay(display.date_created) : new Date().toLocaleString()}
                      </div>
                    </div>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* RIGHT: FORM/RECORDS PANEL */}
          <Box sx={{ 
            width: { xs: '100%', md: '50%', lg: '40%' }, 
            bgcolor: "background.paper", 
            borderLeft: { xs: 0, md: 1 }, 
            borderColor: "divider",
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* FORM */}
            {activeTab === "form" && (
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Paper elevation={0} sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
                    <ArticleIcon color="primary" />
                    {editingId ? "Edit Certificate" : "New Certificate of Action"}
                  </Typography>
                  {selectedRecord && !editingId && (
                    <Typography variant="body2" color="text.secondary">
                      Viewing: {selectedRecord.complainant_name}
                    </Typography>
                  )}
                </Paper>

                <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
                  <Stack spacing={3}>
                    <Autocomplete
                      options={residents}
                      getOptionLabel={(opt) => opt.full_name || ""}
                      value={residents.find((r) => r.resident_id === formData.resident_id) || null}
                      onChange={(e, nv) => { onResidentSelect(nv); }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Complainant Name" 
                          variant="outlined" 
                          fullWidth 
                          size="small"
                          required
                        />
                      )}
                    />

                    <TextField 
                      label="Respondent Name" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      value={formData.respondent_name} 
                      onChange={(e) => setFormData({ ...formData, respondent_name: e.target.value })} 
                      required
                    />

                    <TextField 
                      label="Barangay Case No." 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      value={formData.barangay_case_no} 
                      onChange={(e) => setFormData({ ...formData, barangay_case_no: e.target.value })} 
                      required
                    />

                    <TextField 
                      label="Request Reason" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      multiline 
                      rows={3}
                      value={formData.request_reason} 
                      onChange={(e) => setFormData({ ...formData, request_reason: e.target.value })} 
                      placeholder="Reason for certification"
                      required
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          label="Filed Date" 
                          type="date" 
                          variant="outlined" 
                          fullWidth 
                          size="small"
                          InputLabelProps={{ shrink: true }} 
                          value={formData.filed_date} 
                          onChange={(e) => setFormData({ ...formData, filed_date: e.target.value })} 
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          label="Date Issued" 
                          type="date" 
                          variant="outlined" 
                          fullWidth 
                          size="small"
                          InputLabelProps={{ shrink: true }} 
                          value={formData.date_issued} 
                          onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })} 
                          helperText={formData.date_issued ? (() => { 
                            const date = new Date(formData.date_issued); 
                            const day = date.getDate(); 
                            const month = date.toLocaleString("default", { month: "short" }); 
                            const year = date.getFullYear(); 
                            const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th"; 
                            return `Formatted: ${day}${suffix} day of ${month}, ${year}`; 
                          })() : "Select the date"}
                          required
                        />
                      </Grid>
                    </Grid>

                    <Box sx={{ display: "flex", gap: 2, pt: 2 }}>
                      <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        startIcon={<SaveIcon />} 
                        fullWidth 
                        color="primary"
                        size="large"
                      >
                        {editingId ? "Update" : "Save"}
                      </Button>
                      {(editingId || isFormOpen) && (
                        <Button 
                          onClick={resetForm} 
                          variant="outlined" 
                          startIcon={<CloseIcon />} 
                          color="primary"
                          size="large"
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </Box>
              </Box>
            )}

            {/* RECORDS */}
            {activeTab === "records" && (
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Paper elevation={0} sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <FolderIcon color="primary" />
                    Certificate Records
                  </Typography>
                  <TextField 
                    fullWidth 
                    size="small" 
                    placeholder="Search by name, case number..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    InputProps={{ 
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ) 
                    }} 
                  />
                </Paper>

                <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                  {filteredRecords.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                      <FolderIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                      <Typography variant="h6" gutterBottom>
                        {searchTerm ? "No records found" : "No records yet"}
                      </Typography>
                      <Typography variant="body2">
                        {searchTerm ? "Try a different search term" : "Create your first certificate to get started"}
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {filteredRecords.map((record) => (
                        <Card key={record.certificate_of_action_id} sx={{ 
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          borderLeft: 4,
                          borderColor: "primary.main",
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: "#000000" }}>
                                  {record.complainant_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  vs. {record.respondent_name}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
                                  <Chip 
                                    label={record.barangay_case_no} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined" 
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    Filed: {formatDateDisplay(record.filed_date)}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Tooltip title="View">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleView(record)} 
                                    color="primary"
                                  >
                                    <EyeIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEdit(record)} 
                                    color="success"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleDelete(record.certificate_of_action_id)} 
                                    color="error"
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            )}

            {/* TRANSACTION */}
            {activeTab === "transaction" && (
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Paper elevation={0} sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                    <ReceiptIcon color="primary" />
                    Transaction Search
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField 
                      fullWidth 
                      size="small" 
                      placeholder="Enter transaction number" 
                      value={transactionSearch} 
                      onChange={(e) => setTransactionSearch(e.target.value)} 
                      InputProps={{ 
                        startAdornment: (
                          <InputAdornment position="start">
                            <ReceiptIcon />
                          </InputAdornment>
                        ) 
                      }} 
                    />
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleTransactionSearch} 
                      startIcon={<SearchIcon />}
                    >
                      Search
                    </Button>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Format: COA-YYMMDD-######
                  </Typography>
                </Paper>

                <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
                  {transactionFilteredRecords.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: "center", color: "text.secondary" }}>
                      <ReceiptIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                      <Typography variant="h6" gutterBottom>
                        No transactions found
                      </Typography>
                      <Typography variant="body2">
                        Enter a transaction number to search
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {transactionFilteredRecords.map((r) => (
                        <Card key={r.certificate_of_action_id} sx={{ 
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          borderLeft: 4,
                          borderColor: "secondary.main",
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: "#000000" }}>
                                  {r.complainant_name}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
                                  <Chip 
                                    label={r.transaction_number} 
                                    size="small" 
                                    color="secondary" 
                                    variant="outlined" 
                                  />
                                </Box>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  {r.barangay_case_no}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Issued: {formatDateDisplay(r.date_issued)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: "flex", gap: 0.5 }}>
                                <Tooltip title="View">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleView(r)} 
                                    color="primary"
                                  >
                                    <EyeIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleEdit(r)} 
                                    color="success"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* FLOATING ACTION BUTTON FOR MOBILE */}
        {isMobile && activeTab !== "form" && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
            }}
            onClick={() => { resetForm(); setIsFormOpen(true); setActiveTab("form"); }}
          >
            <AddIcon />
          </Fab>
        )}
      </Box>
    </ThemeProvider>
  );
}

// Reuse your original certificate styles (kept intact)
const certificateStyles = {
  page: {
    width: "8.5in",
    minHeight: "11in",
    margin: "20px auto",
    padding: "40px",
    position: "relative",
    backgroundColor: "#fff",
    boxSizing: "border-box",
    fontWeight: "bold",
    maxWidth: "100%",
    overflow: "auto",
  },
  watermarkImg: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    opacity: 0.2,
    width: "60%",
    pointerEvents: "none",
    zIndex: 0,
  },
  lupon: {
    textAlign: "center",
    fontFamily: "Calibri, sans-serif",
    fontStyle: "italic",
    fontSize: "16px",
    marginBottom: "2px",
    fontWeight: "bold",
  },
  date: {
    textAlign: "right",
    fontFamily: "Calibri, sans-serif",
    fontSize: "14px",
    marginBottom: "20px",
    fontStyle: "italic",
  },
  caseInfo: {
    textAlign: "right",
    fontFamily: "Calibri, sans-serif",
    fontSize: "14px",
    marginBottom: "20px",
    fontStyle: "italic",
  },
  content: {
    margin: "5px 0",
    fontFamily: "Calibri, sans-serif",
    fontSize: "14px",
    position: "relative",
    zIndex: 1,
    fontStyle: "italic",
  },
};