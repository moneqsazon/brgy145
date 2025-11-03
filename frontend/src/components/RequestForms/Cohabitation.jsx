import React, { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import CaloocanLogo from "../../assets/CaloocanLogo.png";
import Logo145 from "../../assets/Logo145.png";
import BagongPilipinas from "../../assets/BagongPilipinas.png";

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
  Grid,
  createTheme,
  ThemeProvider,
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
} from "@mui/icons-material";

const theme = createTheme({
  palette: {
    primary: { main: "#41644A", light: "#A0B2A6", dark: "#0D4715" },
    success: { main: "#41644A" },
    background: { default: "#F1F0E9", paper: "#FFFFFF" },
    text: { primary: "#0D4715" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600, borderRadius: 8 },
      },
    },
  },
});

export default function Cohabitation() {
  // Change apiBase to include /api if your backend routes are under /api
  const apiBase = "http://localhost:5000";

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

  const [formData, setFormData] = useState({
    certificate_of_cohabitation_id: "",
    resident1_id: "",
    resident2_id: "",
    full_name1: "",
    dob1: "",
    full_name2: "",
    dob2: "",
    address: "",
    date_started: new Date().getFullYear(), // year
    date_issued: new Date().toISOString().split("T")[0],
    witness1_name: "",
    witness2_name: "",
    transaction_number: "",
    is_active: 1,
    date_created: "",
  });

  // Helpers
  function generateTransactionNumber() {
    const date = new Date();
    const yy = String(date.getFullYear()).slice(-2);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const rand = Math.floor(100000 + Math.random() * 900000);
    return `COH-${yy}${mm}${dd}-${rand}`;
  }

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

  function storeLocalDraft(cert) {
    if (!cert) return;
    const existing = JSON.parse(localStorage.getItem("certificates") || "{}");
    const key = cert.certificate_of_cohabitation_id || `draft-${cert.transaction_number || "no-txn"}`;
    existing[key] = cert;
    localStorage.setItem("certificates", JSON.stringify(existing));
  }

  function getVerifyUrl(cert) {
    const origin = window.location.origin;
    const id = (cert && cert.certificate_of_cohabitation_id) || `draft-${(cert && cert.transaction_number) || "no-txn"}`;
    return `${origin}/verify-cohabitation?id=${encodeURIComponent(id)}`;
  }

  // Fixed-length underline renderer with optional italics (no underscore placeholder)
  function UnderlinedValue({ value, width = 180, italic = false, align = "center" }) {
    const displayText = value && String(value).trim() ? String(value) : "\u00A0"; // non-breaking space to keep line height
    return (
      <span
        style={{
          display: "inline-block",
          minWidth: width,
          borderBottom: "1px solid #000",
          padding: "0 6px 2px 6px",
          fontStyle: italic ? "italic" : "normal",
          textAlign: align,
          lineHeight: 1.2,
        }}
      >
        {displayText}
      </span>
    );
  }

  // Load residents and records
  useEffect(() => {
    loadResidents();
    loadRecords();
  }, []);

  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`);
      const data = await res.json();
      setResidents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load residents", err);
    }
  }

  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/certificate-of-cohabitation`);
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              certificate_of_cohabitation_id: r.certificate_of_cohabitation_id,
              resident1_id: r.resident1_id,
              resident2_id: r.resident2_id,
              full_name1: r.full_name1,
              dob1: r.dob1 ? r.dob1.split("T")[0] : "",
              full_name2: r.full_name2,
              dob2: r.dob2 ? r.dob2.split("T")[0] : "",
              address: r.address,
              date_started: r.date_started,
              date_issued: r.date_issued ? r.date_issued.split("T")[0] : "",
              witness1_name: r.witness1_name,
              witness2_name: r.witness2_name,
              transaction_number: r.transaction_number || generateTransactionNumber(),
              is_active: r.is_active ?? 1,
              date_created: r.date_created,
            }))
          : []
      );
    } catch (e) {
      console.error("Failed to load certificate_of_cohabitation records", e);
    }
  }

  // display chooses between editing/form mode and view mode
  const display = useMemo(() => {
    if (editingId || isFormOpen) return formData;
    if (selectedRecord) return selectedRecord;
    return formData;
  }, [editingId, isFormOpen, selectedRecord, formData]);

  // QR generation: visible for drafts too when at least full_name1 exists
  useEffect(() => {
    const makeQr = async () => {
      if (!display || !display.full_name1) {
        setQrCodeUrl("");
        return;
      }
      const verifyUrl = getVerifyUrl(display);
      const content = `${verifyUrl}\nCertificate of Cohabitation\nTransaction: ${display.transaction_number || "N/A"}\nPartners: ${display.full_name1} / ${display.full_name2}\nStarted: ${display.date_started || ""}\nIssued: ${display.date_issued || ""}`;
      try {
        const url = await QRCode.toDataURL(content, { width: 140, margin: 1 });
        setQrCodeUrl(url);
        storeLocalDraft(display);
      } catch (err) {
        console.error("QR error", err);
      }
    };
    makeQr();
  }, [display.full_name1, display.full_name2, display.transaction_number, display.date_started, display.date_issued, display.certificate_of_cohabitation_id]);

  function toServerPayload(data) {
    return {
      resident1_id: data.resident1_id || null,
      resident2_id: data.resident2_id || null,
      full_name1: data.full_name1,
      dob1: data.dob1 || null,
      full_name2: data.full_name2,
      dob2: data.dob2 || null,
      address: data.address,
      date_started: data.date_started || null,
      date_issued: data.date_issued || null,
      witness1_name: data.witness1_name,
      witness2_name: data.witness2_name,
      transaction_number: data.transaction_number,
      is_active: data.is_active ?? 1,
    };
  }

  async function handleCreate() {
    try {
      const tx = generateTransactionNumber();
      const updated = { ...formData, transaction_number: tx, date_created: new Date().toISOString() };
      const res = await fetch(`${apiBase}/certificate-of-cohabitation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toServerPayload(updated)),
      });
      if (!res.ok) throw new Error("Create failed");
      const created = await res.json();
      const newRec = { ...updated, certificate_of_cohabitation_id: created.certificate_of_cohabitation_id };
      setRecords([newRec, ...records]);
      setSelectedRecord(newRec);
      storeLocalDraft(newRec);
      resetForm();
      setActiveTab("records");
    } catch (e) {
      console.error(e);
      alert("Failed to create record");
    }
  }

  async function handleUpdate() {
    try {
      const res = await fetch(`${apiBase}/certificate-of-cohabitation/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toServerPayload(formData)),
      });
      if (!res.ok) throw new Error("Update failed");
      const updated = { ...formData, certificate_of_cohabitation_id: editingId };
      setRecords(records.map((r) => (r.certificate_of_cohabitation_id === editingId ? updated : r)));
      setSelectedRecord(updated);
      storeLocalDraft(updated);
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
      date_issued: record.date_issued || record.dateIssued || "",
      dob1: record.dob1 || "",
      dob2: record.dob2 || "",
      date_started: record.date_started || record.dateStarted || new Date().getFullYear(),
    });
    setEditingId(record.certificate_of_cohabitation_id);
    setIsFormOpen(true);
    setActiveTab("form");
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this record?")) return;
    try {
      const res = await fetch(`${apiBase}/certificate-of-cohabitation/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setRecords(records.filter((r) => r.certificate_of_cohabitation_id !== id));
      if (selectedRecord?.certificate_of_cohabitation_id === id) setSelectedRecord(null);
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
    setEditingId(record.certificate_of_cohabitation_id);
    setIsFormOpen(true);
    setActiveTab("form");
  }

  function resetForm() {
    setFormData({
      certificate_of_cohabitation_id: "",
      resident1_id: "",
      resident2_id: "",
      full_name1: "",
      dob1: "",
      full_name2: "",
      dob2: "",
      address: "",
      date_started: new Date().getFullYear(),
      date_issued: new Date().toISOString().split("T")[0],
      witness1_name: "",
      witness2_name: "",
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
          (r.full_name1 || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.full_name2 || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.address || "").toLowerCase().includes(searchTerm.toLowerCase())
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
    if (!display.certificate_of_cohabitation_id) {
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

      const createdDate = display.date_created ? formatDateTimeDisplay(display.date_created) : new Date().toLocaleString();
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text("Cohabitation Certificate - Verification", 0.5, 0.6);
      pdf.setFontSize(12);
      const lines = [
        `Certificate ID: ${display.certificate_of_cohabitation_id}`,
        `Transaction: ${display.transaction_number}`,
        `Partners: ${display.full_name1} / ${display.full_name2}`,
        `Address: ${display.address}`,
        `Started: ${display.date_started}`,
        `Date Issued: ${formatDateDisplay(display.date_issued)}`,
        `Witnesses: ${display.witness1_name || "-"} , ${display.witness2_name || "-"}`,
        `Created: ${createdDate}`,
        `Verify URL: ${getVerifyUrl(display)}`,
      ];
      let y = 1.1;
      lines.forEach((ln) => {
        pdf.text(ln, 0.5, y);
        y += 0.25;
      });

      const filename = `Cohabitation_${display.certificate_of_cohabitation_id || "draft"}_${(display.full_name1||'').replace(/\s+/g,'_')}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    if (!display.certificate_of_cohabitation_id) { alert("Please save first"); return; }
    const certificateElement = document.getElementById("certificate-preview");
    const printWindow = window.open("", "_blank");
    const certificateHTML = certificateElement.outerHTML;
    printWindow.document.write(`<!doctype html><html><head><title>Print</title><style>body{margin:0}#certificate-preview{width:8.5in;height:11in}</style></head><body>${certificateHTML}<script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</script></body></html>`);
    printWindow.document.close();
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

  function openVerifyPage() {
    if (!display.certificate_of_cohabitation_id) {
      const key = `draft-${display.transaction_number || "no-txn"}`;
      storeLocalDraft({ ...display, certificate_of_cohabitation_id: key });
    }
    window.open(getVerifyUrl(display), "_blank");
  }

  // resident select autofill helpers
  function onResident1Select(option) {
    if (option) {
      setFormData((prev) => ({
        ...prev,
        resident1_id: option.resident_id,
        full_name1: option.full_name || prev.full_name1,
        dob1: option.dob ? option.dob.split("T")[0] : prev.dob1,
        address: option.address || prev.address,
      }));
    } else {
      setFormData((prev) => ({ ...prev, resident1_id: "", full_name1: "", dob1: "" }));
    }
  }
  function onResident2Select(option) {
    if (option) {
      setFormData((prev) => ({
        ...prev,
        resident2_id: option.resident_id,
        full_name2: option.full_name || prev.full_name2,
        dob2: option.dob ? option.dob.split("T")[0] : prev.dob2,
        address: option.address || prev.address,
      }));
    } else {
      setFormData((prev) => ({ ...prev, resident2_id: "", full_name2: "", dob2: "" }));
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* LEFT: Certificate preview (preserve layout) */}
        <Box sx={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1, p: 2, bgcolor: "background.paper", borderBottom: 1, borderColor: "grey.200" }}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <IconButton onClick={handleZoomOut} color="primary" sx={{ border: "1px solid", borderColor: "grey.300" }}><ZoomOutIcon /></IconButton>
              <Typography variant="body2" sx={{ minWidth: 60, textAlign: "center", fontWeight: 600 }}>{Math.round(zoomLevel * 100)}%</Typography>
              <IconButton onClick={handleZoomIn} color="primary" sx={{ border: "1px solid", borderColor: "grey.300" }}><ZoomInIcon /></IconButton>
              <IconButton onClick={handleResetZoom} color="primary" size="small" sx={{ border: "1px solid", borderColor: "grey.300" }}><ResetIcon fontSize="small" /></IconButton>
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button variant="outlined" color="primary" onClick={() => { if (display.certificate_of_cohabitation_id) window.open(getVerifyUrl(display), "_blank"); }} startIcon={<QrCodeIcon />} disabled={!display.certificate_of_cohabitation_id} sx={{ textTransform: "none", fontWeight: 600, px: 3 }}>View Certificate Details</Button>
              <Button variant="contained" color="success" onClick={generatePDF} disabled={!display.certificate_of_cohabitation_id || isGeneratingPDF} startIcon={<FileTextIcon />} sx={{ textTransform: "none", fontWeight: 600, px: 3 }}>{isGeneratingPDF ? "Generating..." : "Download PDF"}</Button>
            </Box>
          </Box>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", flex: 1, overflow: "auto", padding: "20px 0" }}>
            <div style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}>
              {/* ===== Certificate preview - KEPT EXACT LAYOUT (values live update) ===== */}
              <div id="certificate-preview" style={{ position: "relative", width: "8.5in", height: "11in", boxShadow: "0 0 8px rgba(0,0,0,0.2)", background: "#fff", overflow: "hidden" }}>
                {/* Logos */}
                <img style={{ position: "absolute", width: "100px", height: "100px", top: "60px", left: "60px" }} src={CaloocanLogo} alt="Logo 1" />
                <img style={{ position: "absolute", width: "100px", height: "100px", top: "60px", right: "40px" }} src={Logo145} alt="Logo 3" />
                <img style={{ position: "absolute", opacity: 0.2, width: "550px", left: "50%", top: "270px", transform: "translateX(-50%)" }} src={Logo145} alt="Watermark" />

                <div style={{ position: "absolute", whiteSpace: "pre", textAlign: "center", width: "100%", fontSize: "20px", fontWeight: "bold", fontFamily: '"Lucida Calligraphy", cursive', top: "50px" }}>
                  Republic of the Philippines
                </div>
                <div style={{ position: "absolute", whiteSpace: "pre", textAlign: "center", width: "100%", fontSize: "13pt", fontWeight: "bold", fontFamily: "Arial, sans-serif", top: "84px" }}>
                  CITY OF CALOOCAN
                </div>
                <div style={{ position: "absolute", whiteSpace: "pre", textAlign: "center", width: "100%", fontSize: "15pt", fontWeight: "bold", fontFamily: '"Arial Black", sans-serif', top: "110px" }}>
                  BARANGAY 145 ZONES 13 DIST. 1
                </div>
                <div style={{ position: "absolute", whiteSpace: "pre", textAlign: "center", width: "100%", fontSize: "15pt", fontWeight: "bold", fontFamily: '"Arial Black", sans-serif', top: "138px" }}>
                  Tel. No. 8711 - 7134
                </div>
                <div style={{ position: "absolute", whiteSpace: "pre", textAlign: "center", width: "100%", fontSize: "12pt", fontWeight: "bold", fontFamily: '"Arial Black", sans-serif', top: "166px" }}>
                  OFFICE OF THE BARANGAY CHAIRMAN
                </div>
                <div style={{ position: "absolute", top: "200px", width: "100%", textAlign: "center" }}>
                  <span style={{ fontFamily: 'Times New Roman', fontSize: "20pt", fontWeight: "bold", display: "inline-block", color: "#0b7030", padding: "4px 70px", fontStyle: "italic", textDecoration: "underline" }}>
                    CERTIFICATION
                  </span>
                </div>

                {/* Body - live data */}
                <div style={{ position: "absolute", whiteSpace: "pre-wrap", top: "280px", left: "80px", width: "640px", textAlign: "justify", fontFamily: '"Times New Roman", serif', fontSize: "12pt", fontWeight: "bold", color: "black" }}>
                  TO WHOM IT MAY CONCERN:

                  <p style={{ textIndent: "50px" }}>
                    This is to certify that <UnderlinedValue value={display.full_name1} italic width={220} />, born on <UnderlinedValue value={display.dob1 ? new Date(display.dob1).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : ""} width={160} /> and <UnderlinedValue value={display.full_name2} italic width={220} />, born on <UnderlinedValue value={display.dob2 ? new Date(display.dob2).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : ""} width={160} />, are cohabiting at <UnderlinedValue value={display.address} width={380} align="left" />, Barangay 145, Bagong Barrio, Caloocan City.
                  </p>

                  <p style={{ textIndent: "50px" }}>
                    Upon the request of the subject residents and to the best knowledge of the Barangay, we certify that they have been living together at the aforementioned address since <UnderlinedValue value={display.date_started} width={100} />.
                  </p>

                  <p style={{ textIndent: "50px" }}>
                    This shall serve as CERTIFICATE OF COHABITATION for whatever legal purpose it may serve.
                  </p>

                  <p style={{ textIndent: "50px" }}>
                    Issued this <UnderlinedValue value={display.date_issued ? (() => { const date = new Date(display.date_issued); const day = date.getDate(); const month = date.toLocaleString("default", { month: "short" }); const year = date.getFullYear(); const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th"; return `${day}${suffix} day of ${month}, ${year}`; })() : ""} width={260} /> at Barangay 145 office, Bagong Barrio, Caloocan City.
                  </p>

                  <div style={{ textAlign: "center", fontWeight: "bold", marginTop: "40px", textDecoration: "underline" }}>
                    WITNESS
                  </div>

                  <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between", paddingLeft: "60px", paddingRight: "60px", fontFamily: '"Times New Roman", serif', fontSize: "12pt", fontWeight: "bold" }}>
                    <UnderlinedValue value={display.witness1_name} width={220} />
                    <UnderlinedValue value={display.witness2_name} width={220} />
                  </div>
                </div>

                {/* signatures */}
                <div style={{ position: "absolute", top: "800px", left: "220px", width: "300px", textAlign: "left", fontFamily: '"Times New Roman", serif', fontWeight: "bold" }}>
                  <div style={{ color: "black", fontFamily: "inherit" }}>Certified Correct:</div> <br /><br />
                  <div style={{ color: "black", fontFamily: "inherit", fontSize: '16pt'}}>Roselyn Anore</div>
                  <div style={{ color: "black", fontFamily: "inherit", fontStyle: 'italic'}}>Barangay Secretary</div>
                </div>

                <div style={{ position: "absolute", top: "800px", right: "20px", width: "300px", textAlign: "left", fontFamily: '"Times New Roman", serif', fontWeight: "bold" }}>
                  <div style={{ color: "black", fontFamily: "inherit", fontSize: "12pt" }}>Attested: </div> <br /><br />
                  <div style={{ color: "black", fontFamily: "inherit", fontSize: "16pt", fontStyle: "italic" }}>ARNOLD DONDONAYOS</div>
                  <div style={{ color: "black", fontFamily: "inherit", fontSize: "12pt", fontStyle: "italic" }}>Barangay Chairman</div>
                </div>

                {/* QR bottom-right for draft & saved */}
                {qrCodeUrl && (
                  <div style={{ position: "absolute", bottom: 60, left: 80, textAlign: "center", fontFamily: '"Times New Roman", serif', fontSize: "10pt", fontWeight: "bold" }}>
                    <a href={getVerifyUrl(display)} target="_blank" rel="noreferrer" style={{ cursor: "pointer", display: "inline-block", textDecoration: "none" }} title="Click to verify this certificate">
                      <img src={qrCodeUrl} alt="QR" style={{ width: 120, height: 120, border: "2px solid #000", padding: 5, background: "#fff" }} />
                    </a>
                    <div style={{ fontSize: "8pt", color: "#666", marginTop: 6 }}>
                      {display.date_created ? formatDateTimeDisplay(display.date_created) : new Date().toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <style>{`@media print { body * { visibility: hidden; } #certificate-preview, #certificate-preview * { visibility: visible; } #certificate-preview { position: absolute; left: 0; top: 0; width: 8.5in; height: 11in; transform: none !important; } @page { size: portrait; margin: 0; } #certificate-preview * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; } }`}</style>
        </Box>

        {/* RIGHT: CRUD container */}
        <Container maxWidth="sm" disableGutters sx={{ height: "100vh" }}>
          <Paper sx={{ bgcolor: "grey.50", borderLeft: 1, borderColor: "grey.300", display: "flex", flexDirection: "column",  overflow: 'hidden' }}>
            <Paper elevation={0} sx={{ position: "sticky", paddingTop: 5, zIndex: 10, bgcolor: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", borderBottom: 1, borderColor: "grey.300" }}>
              <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>Certificate of Cohabitation</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={handlePrint} disabled={!display.certificate_of_cohabitation_id} sx={{ color: "primary.main", borderColor: "primary.main" }}>Print</Button>
                  <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => { resetForm(); setIsFormOpen(true); setActiveTab("form"); }} color="primary">New</Button>
                </Box>
              </Box>

              <Box sx={{ px: 1, pb: 1 }}>
                <Paper sx={{ p: 0.5, bgcolor: "background.default", borderRadius: 2 }}>
                  <Tabs value={activeTab} onChange={(e, nv) => setActiveTab(nv)} aria-label="cohab tabs" variant="fullWidth" sx={{ minHeight: "unset", "& .MuiTabs-flexContainer": { gap: 0.5 } }}>
                    <Tab value="form" label="Form" sx={{ py: 1 }} />
                    <Tab value="records" label={`Records (${records.length})`} sx={{ py: 1 }} />
                    <Tab value="transaction" label="Transaction" sx={{ py: 1 }} />
                  </Tabs>
                </Paper>
              </Box>
            </Paper>

            {/* Form Tab */}
            {activeTab === "form" && (
              <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
                <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                  <CardHeader title={<Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600, color: "grey.800" }}>{editingId ? "Edit Record" : "New Cohabitation Record"}</Typography>} subheader={selectedRecord && !editingId && (<Typography variant="caption" sx={{ color: "grey.500" }}>Viewing: {selectedRecord.full_name1} & {selectedRecord.full_name2}</Typography>)} sx={{ borderBottom: 1, borderColor: "grey.200" }} />
                  <CardContent>
                    <Stack spacing={2}>
                      <Autocomplete
                        options={residents}
                        getOptionLabel={(opt) => opt.full_name || ""}
                        value={residents.find((r) => r.resident_id === formData.resident1_id) || null}
                        onChange={(e, nv) => { onResident1Select(nv); }}
                        renderInput={(params) => <TextField {...params} label="Full name 1" variant="outlined" size="small" fullWidth />}
                      />
                    
                      <TextField label="Birthday (Full name 1) *" type="date" variant="outlined" size="small" fullWidth InputLabelProps={{ shrink: true }} value={formData.dob1} onChange={(e) => setFormData({ ...formData, dob1: e.target.value })} />

                      <Autocomplete
                        options={residents}
                        getOptionLabel={(opt) => opt.full_name || ""}
                        value={residents.find((r) => r.resident_id === formData.resident2_id) || null}
                        onChange={(e, nv) => { onResident2Select(nv); }}
                        renderInput={(params) => <TextField {...params} label="Full name 2" variant="outlined" size="small" fullWidth />}
                      />
                     
                      <TextField label="Birthday (Full name 2) *" type="date" variant="outlined" size="small" fullWidth InputLabelProps={{ shrink: true }} value={formData.dob2} onChange={(e) => setFormData({ ...formData, dob2: e.target.value })} />

                      <TextField label="Address *" variant="outlined" size="small" fullWidth multiline rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />

                      <TextField label="Date Started (Year) *" type="number" variant="outlined" size="small" fullWidth value={formData.date_started} onChange={(e) => setFormData({ ...formData, date_started: e.target.value })} placeholder="e.g. 2015" />

                      <TextField label="Date Issued *" type="date" variant="outlined" size="small" fullWidth InputLabelProps={{ shrink: true }} value={formData.date_issued} onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })} helperText={formData.date_issued ? (() => { const date = new Date(formData.date_issued); const day = date.getDate(); const month = date.toLocaleString("default", { month: "short" }); const year = date.getFullYear(); const suffix = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th"; return `Formatted: ${day}${suffix} day of ${month}, ${year}`; })() : "Select the date"} />

                      <Grid container spacing={1.5}>
                        <Grid item xs={6}>
                          <TextField label="Witness 1" variant="outlined" size="small" fullWidth value={formData.witness1_name} onChange={(e) => setFormData({ ...formData, witness1_name: e.target.value })} />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField label="Witness 2" variant="outlined" size="small" fullWidth value={formData.witness2_name} onChange={(e) => setFormData({ ...formData, witness2_name: e.target.value })} />
                        </Grid>
                      </Grid>

                      <Box sx={{ display: "flex", gap: 1, pt: 1 }}>
                        <Button onClick={handleSubmit} variant="contained" startIcon={<SaveIcon />} fullWidth color="primary" sx={{ py: 1.25 }}>{editingId ? "Update" : "Save"}</Button>
                        {(editingId || isFormOpen) && (<Button onClick={resetForm} variant="outlined" startIcon={<CloseIcon />} color="primary" sx={{ py: 1.25 }}>Cancel</Button>)}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Records Tab */}
            {activeTab === "records" && (
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Box sx={{ p: 1.5 }}>
                  <TextField fullWidth size="small" placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: "grey.400", fontSize: 20 }} /></InputAdornment>) }} />
                </Box>

                <Box sx={{ flex: 1, overflow: "auto", px: 1.5, pb: 1.5 }}>
                  {filteredRecords.length === 0 ? (
                    <Paper sx={{ p: 3, textAlign: "center", color: "grey.500" }}><Typography variant="body2">{searchTerm ? "No records found" : "No records yet"}</Typography></Paper>
                  ) : (
                    <Stack spacing={1}>
                      {filteredRecords.map((record) => (
                        <Card key={record.certificate_of_cohabitation_id} sx={{ boxShadow: 1, '&:hover': { boxShadow: 2 }, transition: "box-shadow 0.2s", borderLeft: "4px solid", borderColor: "primary.main" }}>
                          <CardContent sx={{ p: 1.5 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{record.full_name1} & {record.full_name2}</Typography>
                                <Typography variant="caption" sx={{ color: "grey.600", display: "block" }}>{record.address}</Typography>
                                <Typography variant="caption" sx={{ color: "grey.400", display: "block" }}>Started: {record.date_started}</Typography>
                                <Typography variant="caption" sx={{ color: "grey.400", display: "block" }}>Issued: {formatDateDisplay(record.date_issued)}</Typography>
                              </Box>
                              <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                                <IconButton size="small" onClick={() => handleView(record)} sx={{ color: "info.main" }} title="View"><EyeIcon sx={{ fontSize: 16 }} /></IconButton>
                                <IconButton size="small" onClick={() => handleEdit(record)} sx={{ color: "success.main" }} title="Edit"><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                                <IconButton size="small" onClick={() => handleDelete(record.certificate_of_cohabitation_id)} sx={{ color: "error.main" }} title="Delete"><DeleteIcon sx={{ fontSize: 16 }} /></IconButton>
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

            {/* Transaction Tab */}
            {activeTab === "transaction" && (
              <Box sx={{ flex: 1, p: 2, overflow: "auto" }}>
                <Card sx={{ borderRadius: 3, boxShadow: 1, mb: 2 }}>
                  <CardHeader title={<Typography variant="h6">Search by Transaction</Typography>} sx={{ borderBottom: 1, borderColor: "grey.200" }} />
                  <CardContent>
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                      <TextField fullWidth size="small" placeholder="Enter transaction number (e.g., COH-240101-123456)" value={transactionSearch} onChange={(e) => setTransactionSearch(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><FileTextIcon sx={{ color: "grey.400", fontSize: 20 }} /></InputAdornment>) }} />
                      <Button variant="contained" color="primary" onClick={handleTransactionSearch} startIcon={<SearchIcon />} sx={{ px: 3 }}>Search</Button>
                    </Box>
                    <Typography variant="caption" color="text.secondary">Transaction numbers are generated automatically at save. Format: COH-YYMMDD-######</Typography>
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                  <CardHeader title={<Typography variant="h6">Recent Transactions</Typography>} sx={{ borderBottom: 1, borderColor: "grey.200" }} />
                  <CardContent>
                    {transactionFilteredRecords.length === 0 ? (
                      <Box sx={{ p: 3, textAlign: "center", color: "grey.500" }}>No transactions found</Box>
                    ) : (
                      <Stack spacing={1}>
                        {transactionFilteredRecords.map((r) => (
                          <Card key={r.certificate_of_cohabitation_id} sx={{ boxShadow: 0, '&:hover': { boxShadow: 1 }, transition: "box-shadow 0.2s", borderLeft: 3, borderColor: "primary.main" }}>
                            <CardContent sx={{ p: 1.5 }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.full_name1} & {r.full_name2}</Typography>
                                  <Typography variant="caption" sx={{ color: "primary.main" }}>{r.transaction_number}</Typography>
                                  <Typography variant="caption" sx={{ display: "block", color: "grey.600" }}>{r.address}</Typography>
                                  <Typography variant="caption" sx={{ color: "grey.400" }}>Issued: {formatDateDisplay(r.date_issued)}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <IconButton size="small" onClick={() => handleView(r)} title="View"><EyeIcon sx={{ fontSize: 16 }} /></IconButton>
                                  <IconButton size="small" onClick={() => handleEdit(r)} title="Edit"><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}

          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
