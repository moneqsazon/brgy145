import React, { useEffect, useMemo, useState } from 'react';
import CaloocanLogo from '../../assets/CaloocanLogo.png';
import Logo145 from '../../assets/Logo145.png';
import BagongPilipinas from '../../assets/BagongPilipinas.png';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import Material UI components at the top of your file
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Box,
  Card,
  CardContent,
  CardHeader,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Autocomplete,
} from '@mui/material';
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
  Receipt as ReceiptIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export default function OathJobSeeker() {
  const apiBase = 'http://localhost:5000';

  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [residents, setResidents] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    birthday: '',
    age: '',
    dateIssued: new Date().toISOString().split('T')[0],
  });

  // ---------- HELPERS ----------
  function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    const getOrdinal = (n) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };
    return `${day}${getOrdinal(day)} day of ${month}, ${year}`;
  }

  function formatDateDisplay(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  }

  function calculateAge(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age.toString();
  }

  function numberToWords(num) {
    if (!num) return '';
    const ones = [
      '',
      'One',
      'Two',
      'Three',
      'Four',
      'Five',
      'Six',
      'Seven',
      'Eight',
      'Nine',
      'Ten',
      'Eleven',
      'Twelve',
      'Thirteen',
      'Fourteen',
      'Fifteen',
      'Sixteen',
      'Seventeen',
      'Eighteen',
      'Nineteen',
    ];
    const tens = [
      '',
      '',
      'Twenty',
      'Thirty',
      'Forty',
      'Fifty',
      'Sixty',
      'Seventy',
      'Eighty',
      'Ninety',
    ];

    if (num < 20) return ones[num];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? ` ${ones[num % 10]}` : '')
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        ' Hundred' +
        (num % 100 ? ` ${numberToWords(num % 100)}` : '')
      );
    return num.toString();
  }

  // ---------- API / CRUD ----------
  // ---------- LOAD RESIDENT RECORDS ----------
  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setResidents(data);
      } else {
        setResidents([]);
      }
    } catch (err) {
      console.error('Failed to fetch residents:', err);
    }
  }

  useEffect(() => {
    loadResidents();
  }, []);
  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/oath-job`);
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              id: r.id,
              name: r.full_name,
              address: r.address,
              birthday: r.birthday?.slice(0, 10) || '',
              age: String(r.age ?? ''),
              dateIssued: r.date_issued?.slice(0, 10) || '',
              dateCreated: r.date_created || null,
            }))
          : []
      );
    } catch (e) {
      console.error('loadRecords error', e);
    }
  }

  useEffect(() => {
    loadRecords();
  }, []);

  function toServerPayload(data) {
    return {
      resident_id: data.resident_id || null,
      full_name: data.name,
      age: data.age ? Number(data.age) : null,
      address: data.address || null,
      date_issued: data.dateIssued,
    };
  }

  async function handleCreate() {
    try {
      const res = await fetch(`${apiBase}/oath-job`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toServerPayload(formData)),
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      const newRec = {
        ...formData,
        id: created.id,
        dateCreated: new Date().toISOString(),
      };
      setRecords([newRec, ...records]);
      setSelectedRecord(newRec);
      storeCertificateData(newRec);
      resetForm();
      setActiveTab('records');
    } catch (e) {
      console.error('handleCreate error', e);
      alert('Failed to create record');
    }
  }

  async function handleUpdate() {
    try {
      const res = await fetch(`${apiBase}/oath-job/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toServerPayload(formData)),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = { ...formData, id: editingId };
      setRecords(records.map((r) => (r.id === editingId ? updated : r)));
      setSelectedRecord(updated);
      storeCertificateData(updated);
      resetForm();
      setActiveTab('records');
    } catch (e) {
      console.error('handleUpdate error', e);
      alert('Failed to update record');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${apiBase}/oath-job/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
      const existingCertificates = JSON.parse(
        localStorage.getItem('certificates') || '{}'
      );
      delete existingCertificates[id];
      localStorage.setItem(
        'certificates',
        JSON.stringify(existingCertificates)
      );
    } catch (e) {
      console.error('handleDelete error', e);
      alert('Failed to delete record');
    }
  }

  function handleView(record) {
    setSelectedRecord(record);
    setFormData({ ...record });
    setEditingId(record.id);
    setIsFormOpen(true);
    setActiveTab('form');
  }

  function resetForm() {
    setFormData({
      name: '',
      address: '',
      birthday: '',
      age: '',
      dateIssued: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedRecord(null);
  }

  function handleSubmit() {
    if (editingId) handleUpdate();
    else handleCreate();
  }

  // ---------- QR STORAGE & GENERATION ----------
  function storeCertificateData(certificateData) {
    if (!certificateData.id) return;
    const existingCertificates = JSON.parse(
      localStorage.getItem('certificates') || '{}'
    );
    existingCertificates[certificateData.id] = certificateData;
    localStorage.setItem('certificates', JSON.stringify(existingCertificates));
  }

  useEffect(() => {
    const generateQRCode = async () => {
      // choose display: if editing or open, use formData, else selectedRecord
      const display =
        editingId || isFormOpen ? formData : selectedRecord || formData;
      if (!display || !display.name) {
        setQrCodeUrl(null);
        return;
      }

      // store for offline verification
      storeCertificateData(display);

      const verificationUrl = `${
        window.location.origin
      }/verify-oath-job-seeker?id=${display.id || 'draft'}`;

      const qrContent = `CERTIFICATE VERIFICATION:
      Transaction: ${display.id || 'Draft'}
      Name: ${display.name}
      Date Issued: ${
        display.dateIssued || new Date().toISOString().split('T')[0]
      }
      Document Type: Oath Job Seeker
      Verification URL: ${verificationUrl}
      © BARANGAY 145 CALOOCAN CITY`;

      try {
        const qrUrl = await QRCode.toDataURL(qrContent, {
          width: 150,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' },
          errorCorrectionLevel: 'L',
        });
        setQrCodeUrl(qrUrl);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        setQrCodeUrl(null);
      }
    };

    generateQRCode();
    // regenerate when formData/selectedRecord/editing changes
  }, [formData, selectedRecord, editingId, isFormOpen]);

  const handleQrCodeClick = () => {
    if (selectedRecord?.id || editingId) {
      const id = selectedRecord?.id || editingId;
      const verificationUrl = `${window.location.origin}/verify-oath-job-seeker?id=${id}`;
      window.open(verificationUrl, '_blank');
    } else {
      setQrDialogOpen(true);
    }
  };

  // ---------- PDF + Print ----------
  async function generatePDF() {
    // Must save record first before exporting ideally
    if (!selectedRecord?.id && !editingId) {
      alert('Please save the record first before downloading PDF');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const certificateElement = document.getElementById('certificate-preview');
      // --- 1. Remove the zoom (scale) from the preview's parent while exporting ---
      const parentOfPreview = certificateElement.parentNode;
      const prevTransform = parentOfPreview.style.transform;
      const prevTransformOrigin = parentOfPreview.style.transformOrigin;
      parentOfPreview.style.transform = 'scale(1)';
      parentOfPreview.style.transformOrigin = 'top center';
      // --- 2. Wait a short moment for layout to apply ---
      await new Promise((resolve) => setTimeout(resolve, 150));
      // --- 3. Capture crisp certificate at high scale ---
      const canvas = await html2canvas(certificateElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      // --- 4. Restore zoom to preview ---
      parentOfPreview.style.transform = prevTransform;
      parentOfPreview.style.transformOrigin = prevTransformOrigin;
      // --- 5. Output the PDF at 8.5x11 inches (US Letter) ---
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: [8.5, 11],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, 8.5, 11);
      // Metadata / verification page
      pdf.addPage();
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'bold');
      pdf.text('Certificate Verification Information', 0.5, 0.75);
      pdf.setLineWidth(0.02);
      pdf.line(0.5, 0.85, 8, 0.85);
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      const display = selectedRecord || formData;
      const createdDate = display.dateCreated
        ? new Date(display.dateCreated).toLocaleString()
        : new Date().toLocaleString();
      const details = [
        `Certificate Type: Oath of Undertaking`,
        `Certificate ID: ${display.id || 'Draft'}`,
        `Full Name: ${display.name || ''}`,
        `Address: ${display.address || ''}`,
        `Birthday: ${display.birthday ? formatDateDisplay(display.birthday) : 'N/A'}`,
        `Age: ${display.age || ''}`,
        `Date Issued: ${display.dateIssued || ''}`,
        `Date Created (E-Signature Applied): ${createdDate}`,
        ``,
        `VERIFICATION:`,
        `Scan the QR code on the certificate or visit: ${window.location.origin}/verify-certificate?id=${display.id || 'Draft'}`,
      ];
      let yPos = 1.2;
      const lineHeight = 0.25;
      details.forEach((line) => {
        pdf.text(line, 0.5, yPos);
        yPos += lineHeight;
      });
      const fileName = `OathUndertaking_${(display.name || 'record').replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('generatePDF error', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    if (!selectedRecord?.id && !editingId) {
      alert('Please save the record first before printing');
      return;
    }

    const certificateElement = document.getElementById('certificate-preview');
    const certificateHTML = certificateElement.outerHTML;
    const printWindow = window.open('', '_blank');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Certificate</title>
          <style>
            @page { size: 8.5in 11in; margin: 0; }
            body { margin: 0; padding: 0; font-family: Times, serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; }
            #certificate-preview { width: 8.5in; height: 11in; }
            #certificate-preview * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          </style>
        </head>
        <body>
          ${certificateHTML}
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); }
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  // ---------- Zoom Controls ----------
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.3));
  const handleResetZoom = () => setZoomLevel(0.75);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          handleZoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          handleZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          handleResetZoom();
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [zoomLevel]);

  // ---------- Filters ----------
  const filteredRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.contactNo || '').includes(searchTerm)
      ),
    [records, searchTerm]
  );

  const transactionFilteredRecords = useMemo(
    () =>
      records.filter((r) =>
        (r.id || '')
          .toString()
          .toLowerCase()
          .includes(transactionSearch.toLowerCase())
      ),
    [records, transactionSearch]
  );

  const handleTransactionSearch = () => {
    if (!transactionSearch) return;
    const found = records.find(
      (r) =>
        (r.id || '').toString().toLowerCase() ===
        transactionSearch.toLowerCase()
    );
    if (found) {
      handleView(found);
      setActiveTab('form');
    } else {
      alert('No certificate found with this transaction number');
    }
  };

  // ---------- JSX (left certificate kept largely unchanged, QR added) ----------
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', display: 'flex' }}>
      {/* LEFT: Certificate preview */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        {/* Toolbar */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            gap: 1,
            p: 2,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'grey.200',
          }}
        >
          {/* Zoom Controls */}
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <IconButton
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.3}
              color="primary"
              sx={{
                border: '1px solid',
                borderColor: 'grey.300',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              <ZoomOutIcon />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                minWidth: '60px',
                textAlign: 'center',
                fontWeight: 600,
                color: 'grey.700',
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </Typography>
            <IconButton
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2}
              color="primary"
              sx={{
                border: '1px solid',
                borderColor: 'grey.300',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              <ZoomInIcon />
            </IconButton>
            <IconButton
              onClick={handleResetZoom}
              color="primary"
              size="small"
              sx={{
                border: '1px solid',
                borderColor: 'grey.300',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
              title="Reset Zoom"
            >
              <RestartAltIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Right-side buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="success"
              onClick={handleQrCodeClick}
              startIcon={<QrCodeIcon />}
              disabled={!selectedRecord && !editingId}
            >
              View Certificate Details
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={generatePDF}
              startIcon={<FileTextIcon />}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
            </Button>
            <Button
              variant="outlined"
              color="success"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={!selectedRecord && !editingId}
            >
              Print
            </Button>
          </Box>
        </Box>

        {/* Certificate Preview */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            flex: 1,
            overflow: 'auto',
            padding: '20px 0',
          }}
        >
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
            }}
          >
            <div
              id="certificate-preview"
              style={{
                position: 'relative',
                width: '8.5in',
                height: '11in',
                boxShadow: '0 0 8px rgba(0,0,0,0.2)',
                background: '#fff',
                overflow: 'hidden',
              }}
            >
              {/* Logos */}
              <img
                src={CaloocanLogo}
                alt="City Logo"
                style={{
                  position: 'absolute',
                  width: '90px',
                  top: '28px',
                  left: '32px',
                }}
              />
              <img
                src={Logo145}
                alt="Barangay Logo"
                style={{
                  position: 'absolute',
                  width: '110px',
                  top: '26px',
                  right: '32px',
                }}
              />

              {/* Watermark */}
              <img src={Logo145} alt="Watermark" style={styles.watermarkImg} />

              {/* Title */}
              <div
                style={{
                  position: 'absolute',
                  top: '50px',
                  width: '100%',
                  textAlign: 'center',
                  fontFamily: '"Times New Roman", sans-serif',
                  fontSize: '15pt',
                  letterSpacing: '2px',
                  fontWeight: 'bold',
                }}
              >
                OATH OF
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: '80px',
                  width: '100%',
                  textAlign: 'center',
                  fontFamily: '"Times New Roman", sans-serif',
                  fontSize: '19pt',
                  letterSpacing: '2px',
                  fontWeight: 'bold',
                }}
              >
                UNDERTAKING
              </div>

              {/* Body Intro */}
              <div
                style={{
                  position: 'absolute',
                  top: '160px',
                  left: '80px',
                  width: '640px',
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '12pt',
                  lineHeight: 1.6,
                  textAlign: 'justify',
                }}
              >
                I,{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '180px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  {(selectedRecord || formData).name || '\u00A0'}
                </span>
                ,{' '}
                <b>
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: '180px',
                      borderBottom: '1px solid black',
                      textAlign: 'center',
                      fontStyle: 'italic',
                    }}
                  >
                    {(selectedRecord || formData).age
                      ? `${numberToWords((selectedRecord || formData).age)} (${
                          (selectedRecord || formData).age
                        }) yrs old`
                      : '\u00A0'}
                  </span>
                </b>
                , is Bonafide resident of{' '}
                <b>
                  <span
                    style={{
                      display: 'inline-block',
                      minWidth: '250px',
                      borderBottom: '1px solid black',
                      textAlign: 'center',
                    }}
                  >
                    {(selectedRecord || formData).address || '\u00A0'}
                  </span>
                </b>{' '}
                <b> Brgy. 145, Zone 13, </b>
                District 1, Bagong Barrio Caloocan City for One year, availing
                the benefits of{' '}
                <b>
                  <i> Republic Act 11261,</i>
                </b>{' '}
                otherwise known as the{' '}
                <b>
                  <i> First Time Jobseeker Act of 2019, </i>
                </b>{' '}
                do hereby declare, agree and undertake to abide and be bound by
                the following:
              </div>

              {/* List */}
              <div
                style={{
                  position: 'absolute',
                  top: '300px',
                  left: '100px',
                  width: '610px',
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '12pt',
                  lineHeight: 1.2,
                  textAlign: 'justify',
                }}
              >
                {/* ... (list items unchanged) */}
                <p>
                  1. That this is the first time that I will actively look for a
                  job, and therefore requesting that a Barangay Certification be
                  issued in my favor to avail the benefits of the law;
                </p>
                <p>
                  2. That I am aware that the benefit and privilege/s under the
                  said law shall be valid only for one (1) year from the date
                  that the Barangay Certificate is issued;
                </p>
                <p>3. That I can avail the benefits of the law only once;</p>
                <p>
                  4. That I understand that my personal information shall be
                  included in the Roster/List of First Time Jobseekers and will
                  not be used for any unlawful purposes;
                </p>
                <p>
                  5. That I will inform and/or report to the Barangay
                  personally, through text or other means, or through my
                  family/relatives once I get employed; and
                </p>
                <p>
                  6. That I am not a beneficiary of the Job Start Program under
                  R.A. No. 10869 and other laws that give similar exemption for
                  the documents of transaction exempted under R.A. No. 11261.
                </p>
                <p>
                  7. That if issued the requested Certification, I will not use
                  the same in any fraud, neither falsify nor help and/or assist
                  in the fabrication of the said certification.
                </p>
                <p>
                  8. That this undertaking is made solely for the purpose of
                  obtaining a Barangay Certification consistent with the
                  objective of R.A. No. 11261 and not for any other purpose.
                </p>
                <p>
                  9. That I consent to the use of my personal information
                  pursuant to the Data Privacy Act and other applicable laws,
                  rules, and regulations.
                </p>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '200px',
                  left: '95px',
                  width: '610px',
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '12pt',
                  lineHeight: 1.5,
                  textAlign: 'justify',
                }}
              >
                <p>
                  Signed this{' '}
                  <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                    {(selectedRecord || formData).dateIssued
                      ? formatDate((selectedRecord || formData).dateIssued)
                      : '__________________'}
                  </span>{' '}
                  in Barangay 145 Zone 13 District 1 at the City of Caloocan.
                </p>
              </div>

              {/* Bottom Signatures and QR */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '130px',
                  left: '50px',
                  width: '260px',
                  textAlign: 'center',
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '12pt',
                }}
              >
                {/* QR Code */}
                {qrCodeUrl && (
                  <div style={{ marginBottom: '-100px' }}>
                    <div
                      onClick={handleQrCodeClick}
                      style={{
                        cursor: 'pointer',
                        display: 'inline-block',
                        position: 'relative',
                      }}
                      title="Click to verify certificate"
                    >
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        style={{
                          width: '140px',
                          height: '140px',
                          border: '2px solid #000',
                          padding: '6px',
                          background: '#fff',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '8pt',
                        color: '#666',
                        marginTop: '6px',
                        fontWeight: 'normal',
                      }}
                    >
                      {(selectedRecord?.dateCreated &&
                        new Date(
                          selectedRecord.dateCreated
                        ).toLocaleString()) ||
                        new Date().toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '130px',
                  right: '30px',
                  width: '320px',
                  textAlign: 'center',
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '12pt',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    marginBottom: '3px',
                  }}
                >
                  {(selectedRecord || formData).name || ''}
                </div>
                <div
                  style={{
                    borderTop: '1px solid #000',
                    width: '80%',
                    margin: '0 auto 6px auto',
                  }}
                />
                <div>First Time Job Seeker</div>
              </div>

              <div
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  right: '28px',
                  width: '320px',
                  textAlign: 'center',
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '12pt',
                  fontWeight: 'bold',
                }}
              >
                <div
                  style={{
                    fontWeight: 'bold',
                    fontStyle: 'italic',
                    marginBottom: '3px',
                  }}
                >
                  Roselyn Pestilos Anore
                </div>
                <div
                  style={{
                    borderTop: '1px solid #000',
                    width: '80%',
                    margin: '0 auto 6px auto',
                  }}
                />
                <div
                  style={{
                    marginTop: '-4px',
                    textAlign: 'center',
                    fontFamily: '"Times New Roman", serif',
                    fontSize: '12pt',
                  }}
                >
                  <div>Barangay Secretary</div>
                  <div>(Barangay Official/Designation/Position)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>
          {`
      @media print {
        body * { visibility: hidden; }
        #certificate-preview, #certificate-preview * { visibility: visible; }
        #certificate-preview { position: absolute; left: 0; top: 0; width: 8.5in; height: 11in; transform: none !important; }
        @page { size: portrait; margin: 0; }
        #certificate-preview * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
      }
    `}
        </style>
      </Box>

      <Container
        maxWidth={false}
        sx={{
          flexGrow: 1,
          minWidth: '400px',
          maxWidth: '600px',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          borderLeft: 1,
          borderColor: 'grey.300',
          p: 0,
        }}
        disableGutters
      >
        <Paper
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            borderRadius: 0,
          }}
        >
          {/* Sticky Header */}
          <Paper
            elevation={0}
            sx={{
              position: 'sticky',
              paddingTop: 5,
              zIndex: 10,
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
              borderBottom: 1,
              borderColor: 'grey.200',
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: 'success.main' }}
              >
                Oath Job Seeker
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  disabled={!selectedRecord && !editingId}
                  sx={{
                    color: 'success.main',
                    borderColor: 'success.main',
                    '&:hover': {
                      bgcolor: 'success.main',
                      color: '#fff',
                      borderColor: 'success.main',
                    },
                  }}
                >
                  Print
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    resetForm();
                    setIsFormOpen(true);
                    setActiveTab('form');
                  }}
                  sx={{
                    bgcolor: 'success.main',
                    '&:hover': { bgcolor: '#1b5e20' },
                  }}
                >
                  New
                </Button>
              </Box>
            </Box>

            <Box sx={{ px: 1, pb: 1 }}>
              <Paper
                sx={{ p: 0.5, bgcolor: 'background.default', borderRadius: 2 }}
              >
                <Tabs
                  value={activeTab}
                  onChange={(e, v) => setActiveTab(v)}
                  variant="fullWidth"
                  sx={{
                    minHeight: 'unset',
                    '& .MuiTabs-flexContainer': { gap: 0.5 },
                    '& .Mui-selected': {
                      color: 'success.main !important',
                      fontWeight: 600,
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'success.main',
                    },
                  }}
                >
                  <Tab
                    value="form"
                    label="Form"
                    sx={{ minHeight: 'unset', py: 1 }}
                  />
                  <Tab
                    value="records"
                    label={`Records (${records.length})`}
                    sx={{ minHeight: 'unset', py: 1 }}
                  />
                  <Tab
                    value="transaction"
                    label="Transaction"
                    sx={{ minHeight: 'unset', py: 1 }}
                  />
                </Tabs>
              </Paper>
            </Box>
          </Paper>

          {/* Form Tab */}
          {activeTab === 'form' && (
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'grey.800',
                      }}
                    >
                      {editingId ? 'Edit Record' : 'New Oath Record'}
                    </Typography>
                  }
                  subheader={
                    selectedRecord &&
                    !editingId && (
                      <Typography variant="caption" sx={{ color: 'grey.500' }}>
                        Viewing: {selectedRecord.name}
                      </Typography>
                    )
                  }
                  sx={{ borderBottom: 1, borderColor: 'grey.200' }}
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Autocomplete
                      options={residents}
                      getOptionLabel={(option) => option.full_name || ''}
                      value={
                        residents.find((r) => r.full_name === formData.name) ||
                        null
                      }
                      onChange={(e, value) => {
                        if (value) {
                          setFormData({
                            ...formData,
                            resident_id: value.id,
                            name: value.full_name,
                            address: value.address || '',
                            birthday: value.birthday?.slice(0, 10) || '',
                            age: calculateAge(value.birthday?.slice(0, 10)),
                          });
                        } else {
                          setFormData({
                            ...formData,
                            resident_id: null,
                            name: '',
                            address: '',
                            birthday: '',
                            age: '',
                          });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Full Name *"
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'success.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'success.main',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: 'success.main',
                            },
                          }}
                        />
                      )}
                    />

                    <TextField
                      label="Address *"
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: 'success.main' },
                          '&.Mui-focused fieldset': {
                            borderColor: 'success.main',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'success.main',
                        },
                      }}
                    />

                    <Grid container spacing={1.5}>
                      <Grid item xs={6}>
                        <TextField
                          label="Birthday *"
                          type="date"
                          variant="outlined"
                          size="small"
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          value={formData.birthday}
                          onChange={(e) => {
                            const dob = e.target.value;
                            const age = calculateAge(dob);
                            setFormData({ ...formData, birthday: dob, age });
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'success.main',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: 'success.main',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: 'success.main',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Age"
                          variant="outlined"
                          size="small"
                          fullWidth
                          value={formData.age}
                          InputProps={{ readOnly: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': { bgcolor: 'grey.100' },
                          }}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      label="Date Issued *"
                      type="date"
                      variant="outlined"
                      size="small"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={formData.dateIssued}
                      onChange={(e) =>
                        setFormData({ ...formData, dateIssued: e.target.value })
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: 'success.main' },
                          '&.Mui-focused fieldset': {
                            borderColor: 'success.main',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'success.main',
                        },
                      }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, pt: 1 }}>
                      <Button
                        onClick={handleSubmit}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        fullWidth
                        sx={{
                          bgcolor: 'success.main',
                          '&:hover': { bgcolor: '#1b5e20' },
                          fontWeight: 500,
                          py: 1.25,
                          textTransform: 'none',
                        }}
                      >
                        {editingId ? 'Update' : 'Save'}
                      </Button>
                      {(editingId || isFormOpen) && (
                        <Button
                          onClick={resetForm}
                          variant="outlined"
                          startIcon={<CloseIcon />}
                          sx={{
                            color: 'success.main',
                            borderColor: 'success.main',
                            '&:hover': {
                              bgcolor: '#e8f5e9',
                              borderColor: 'success.main',
                            },
                            py: 1.25,
                            px: 2,
                            textTransform: 'none',
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Records Tab */}
          {activeTab === 'records' && (
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ p: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'grey.400', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: 'success.main' },
                      '&.Mui-focused fieldset': { borderColor: 'success.main' },
                    },
                  }}
                />
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto', px: 1.5, pb: 1.5 }}>
                {filteredRecords.length === 0 ? (
                  <Paper sx={{ p: 3, textAlign: 'center', color: 'grey.500' }}>
                    <Typography variant="body2">
                      {searchTerm ? 'No records found' : 'No records yet'}
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={1}>
                    {filteredRecords.map((record) => (
                      <Card
                        key={record.id}
                        sx={{
                          boxShadow: 1,
                          '&:hover': { boxShadow: 2 },
                          transition: 'box-shadow 0.2s',
                        }}
                      >
                        <CardContent
                          sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                            }}
                          >
                            <Box sx={{ flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: 'grey.900',
                                  mb: 0.5,
                                }}
                              >
                                {record.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'grey.600',
                                  display: 'block',
                                  mb: 0.5,
                                }}
                              >
                                {record.address}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'grey.400',
                                  fontSize: '0.625rem',
                                }}
                              >
                                Issued: {formatDate(record.dateIssued)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleView(record)}
                                sx={{
                                  color: 'success.main',
                                  '&:hover': { bgcolor: 'success.lighter' },
                                  p: 0.75,
                                }}
                                title="View"
                              >
                                <EyeIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(record)}
                                sx={{
                                  color: 'success.main',
                                  '&:hover': { bgcolor: 'success.lighter' },
                                  p: 0.75,
                                }}
                                title="Edit"
                              >
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(record.id)}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': { bgcolor: 'error.lighter' },
                                  p: 0.75,
                                }}
                                title="Delete"
                              >
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
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
          {activeTab === 'transaction' && (
            <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
              <Card sx={{ borderRadius: 3, boxShadow: 1, mb: 2 }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'grey.800',
                      }}
                    >
                      Search by Transaction Number
                    </Typography>
                  }
                  sx={{ borderBottom: 1, borderColor: 'grey.200' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Enter transaction ID"
                      value={transactionSearch}
                      onChange={(e) => setTransactionSearch(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ReceiptIcon
                              sx={{ color: 'grey.400', fontSize: 20 }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleTransactionSearch}
                      startIcon={<SearchIcon />}
                      sx={{
                        bgcolor: 'success.main',
                        '&:hover': { bgcolor: '#1b5e20' },
                        px: 3,
                      }}
                    >
                      Search
                    </Button>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'grey.500' }}>
                    Use the transaction ID (record id) to quickly find
                    certificates.
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
                <CardHeader
                  title={
                    <Typography
                      variant="h6"
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: 'grey.800',
                      }}
                    >
                      Recent Transactions
                    </Typography>
                  }
                  sx={{ borderBottom: 1, borderColor: 'grey.200' }}
                />
                <CardContent sx={{ p: 0 }}>
                  {transactionFilteredRecords.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center', color: 'grey.500' }}>
                      <Typography variant="body2">
                        {transactionSearch
                          ? 'No transactions found'
                          : 'Enter a transaction number to search'}
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      {transactionFilteredRecords.map((record) => (
                        <Card
                          key={record.id}
                          sx={{
                            boxShadow: 0,
                            '&:hover': { boxShadow: 1 },
                            transition: 'box-shadow 0.2s',
                            borderLeft: 3,
                            borderColor: 'success.main',
                          }}
                        >
                          <CardContent
                            sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    color: 'success.main',
                                    mb: 0.5,
                                  }}
                                >
                                  {record.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'success.main',
                                    display: 'block',
                                    mb: 0.5,
                                    fontWeight: 600,
                                  }}
                                >
                                  {record.id}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'grey.600',
                                    display: 'block',
                                    mb: 0.5,
                                  }}
                                >
                                  {record.address}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'grey.400',
                                    fontSize: '0.625rem',
                                  }}
                                >
                                  Issued: {formatDate(record.dateIssued)}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleView(record)}
                                  sx={{
                                    color: 'success.main',
                                    '&:hover': { bgcolor: 'success.lighter' },
                                    p: 0.75,
                                  }}
                                  title="View"
                                >
                                  <EyeIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEdit(record)}
                                  sx={{
                                    color: 'success.main',
                                    '&:hover': { bgcolor: 'success.lighter' },
                                    p: 0.75,
                                  }}
                                  title="Edit"
                                >
                                  <EditIcon sx={{ fontSize: 16 }} />
                                </IconButton>
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

      {/* QR Dialog (for unsaved drafts) */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Certificate Details (Draft)</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            <strong>Name: </strong>
            {formData.name || 'Draft'}
          </Typography>
          <Typography variant="body2">
            <strong>Date Issued: </strong>
            {formData.dateIssued}
          </Typography>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="QR Preview"
                style={{ width: 160, height: 160 }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const styles = {
  watermarkImg: {
    position: 'absolute',
    top: '200px',
    left: '50%',
    transform: 'translateX(-50%)',
    opacity: 0.12,
    width: '650px',
    pointerEvents: 'none',
    zIndex: 0,
  },
};

// ================= FULL VERIFICATION VIEW ==================
function OathJobVerification() {
  const [record, setRecord] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [qrCodeUrl, setQrCodeUrl] = React.useState(null);
  const zoomLevel = 1;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      setError('No certificate ID provided.');
      setLoading(false);
      return;
    }

    // Retrieve from localStorage first
    const certificates = JSON.parse(
      localStorage.getItem('certificates') || '{}'
    );
    const cert = certificates[id];
    if (cert) {
      setRecord(cert);
      setLoading(false);
      return;
    }

    // Otherwise fetch from backend
    fetch(`http://localhost:5000/oath-job/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setRecord({
            id: data.id,
            name: data.full_name,
            address: data.address,
            age: data.age,
            dateIssued: data.date_issued,
            dateCreated: data.date_created,
          });
        } else {
          setError('Certificate not found.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch certificate data.');
        setLoading(false);
      });
  }, []);

  React.useEffect(() => {
    if (record) {
      const verificationUrl = `${window.location.origin}/verify-oath-job-seeker?id=${record.id}`;
      const qrData = `OATH JOB SEEKER CERTIFICATE\nName: ${record.name}\nDate Issued: ${record.dateIssued}\nURL: ${verificationUrl}`;
      import('qrcode').then((QR) => {
        QR.toDataURL(qrData).then(setQrCodeUrl);
      });
    }
  }, [record]);

  if (loading)
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        Loading certificate...
      </div>
    );
  if (error)
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', color: 'red' }}>
        {error}
      </div>
    );

  const numberToWords = (n) =>
    new Intl.NumberFormat('en-US', { style: 'decimal' }).format(n);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleQrCodeClick = () => {
    if (record?.id) {
      const url = `${window.location.origin}/verify-oath-job-seeker?id=${record.id}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flex: 1,
        overflow: 'auto',
        padding: '20px 0',
        background: '#f0f0f0',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: 'top center',
        }}
      >
        <div
          id="certificate-preview"
          style={{
            position: 'relative',
            width: '8.5in',
            height: '11in',
            boxShadow: '0 0 8px rgba(0,0,0,0.2)',
            background: '#fff',
            overflow: 'hidden',
          }}
        >
          {/* Logos */}
          <img
            src={CaloocanLogo}
            alt="City-Logo"
            style={{
              position: 'absolute',
              width: '90px',
              top: '28px',
              left: '32px',
            }}
          />
          <img
            src={Logo145}
            alt="Barangay Logo"
            style={{
              position: 'absolute',
              width: '110px',
              top: '26px',
              right: '32px',
            }}
          />

          {/* Watermark */}
          <img
            src={Logo145}
            alt="Watermark"
            style={{
              position: 'absolute',
              opacity: 0.1,
              width: '550px',
              left: '50%',
              top: '250px',
              transform: 'translateX(-50%)',
            }}
          />

          {/* Title */}
          <div
            style={{
              position: 'absolute',
              top: '50px',
              width: '100%',
              textAlign: 'center',
              fontFamily: '"Times New Roman", sans-serif',
              fontSize: '15pt',
              letterSpacing: '2px',
              fontWeight: 'bold',
            }}
          >
            OATH OF
          </div>
          <div
            style={{
              position: 'absolute',
              top: '80px',
              width: '100%',
              textAlign: 'center',
              fontFamily: '"Times New Roman", sans-serif',
              fontSize: '19pt',
              letterSpacing: '2px',
              fontWeight: 'bold',
            }}
          >
            UNDERTAKING
          </div>

          {/* Body Intro */}
          <div
            style={{
              position: 'absolute',
              top: '160px',
              left: '80px',
              width: '640px',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
              lineHeight: 1.6,
              textAlign: 'justify',
            }}
          >
            I,{' '}
            <span
              style={{
                display: 'inline-block',
                minWidth: '180px',
                borderBottom: '1px solid black',
                fontWeight: 'bold',
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              {record.name}
            </span>
            ,{' '}
            <b>
              <span
                style={{
                  display: 'inline-block',
                  minWidth: '180px',
                  borderBottom: '1px solid black',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                {record.age ? `${record.age} yrs old` : '\u00A0'}
              </span>
            </b>
            , is Bonafide resident of{' '}
            <b>
              <span
                style={{
                  display: 'inline-block',
                  minWidth: '250px',
                  borderBottom: '1px solid black',
                  textAlign: 'center',
                }}
              >
                {record.address}
              </span>
            </b>{' '}
            <b> Brgy. 145, Zone 13, </b>
            District 1, Bagong Barrio Caloocan City for One year, availing the
            benefits of{' '}
            <b>
              <i>Republic Act 11261</i>
            </b>
            , otherwise known as the{' '}
            <b>
              <i>First Time Jobseeker Act of 2019</i>
            </b>
            , do hereby declare, agree and undertake to abide and be bound by
            the following:
          </div>

          {/* List */}
          <div
            style={{
              position: 'absolute',
              top: '300px',
              left: '100px',
              width: '610px',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
              lineHeight: 1.2,
              textAlign: 'justify',
            }}
          >
            <p>
              1. That this is the first time that I will actively look for a
              job, and therefore requesting that a Barangay Certification be
              issued in my favor to avail the benefits of the law;
            </p>
            <p>
              2. That I am aware that the benefit and privilege/s under the said
              law shall be valid only for one (1) year from the date that the
              Barangay Certificate is issued;
            </p>
            <p>3. That I can avail the benefits of the law only once;</p>
            <p>
              4. That I understand that my personal information shall be
              included in the Roster/List of First Time Jobseekers and will not
              be used for any unlawful purposes;
            </p>
            <p>
              5. That I will inform and/or report to the Barangay personally,
              through text or other means, or through my family/relatives once I
              get employed; and
            </p>
            <p>
              6. That I am not a beneficiary of the Job Start Program under R.A.
              No. 10869 and other laws that give similar exemption for the
              documents of transaction exempted under R.A. No. 11261.
            </p>
            <p>
              7. That if issued the requested Certification, I will not use the
              same in any fraud, neither falsify nor help and/or assist in the
              fabrication of the said certification.
            </p>
            <p>
              8. That this undertaking is made solely for the purpose of
              obtaining a Barangay Certification consistent with the objective
              of R.A. No. 11261 and not for any other purpose.
            </p>
            <p>
              9. That I consent to the use of my personal information pursuant
              to the Data Privacy Act and other applicable laws, rules, and
              regulations.
            </p>
          </div>

          {/* Footer section */}
          <div
            style={{
              position: 'absolute',
              bottom: '200px',
              left: '95px',
              width: '610px',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
              lineHeight: 1.5,
              textAlign: 'justify',
            }}
          >
            <p>
              Signed this{' '}
              <span style={{ fontWeight: 'bold', fontStyle: 'italic' }}>
                {record.dateIssued
                  ? formatDate(record.dateIssued)
                  : '__________________'}
              </span>{' '}
              in Barangay 145 Zone 13 District 1 at the City of Caloocan.
            </p>
          </div>

          {/* QR and signatures */}
          <div
            style={{
              position: 'absolute',
              bottom: '130px',
              left: '50px',
              width: '260px',
              textAlign: 'center',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
            }}
          >
            {qrCodeUrl && (
              <div style={{ marginBottom: '-100px' }}>
                <div
                  onClick={handleQrCodeClick}
                  style={{
                    cursor: 'pointer',
                    display: 'inline-block',
                    position: 'relative',
                  }}
                  title="Click to verify certificate"
                >
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    style={{
                      width: '140px',
                      height: '140px',
                      border: '2px solid #000',
                      padding: '6px',
                      background: '#fff',
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: '8pt',
                    color: '#666',
                    marginTop: '6px',
                    fontWeight: 'normal',
                  }}
                >
                  {record.dateCreated
                    ? new Date(record.dateCreated).toLocaleString()
                    : new Date().toLocaleString()}
                </div>
              </div>
            )}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '130px',
              right: '30px',
              width: '320px',
              textAlign: 'center',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                fontStyle: 'italic',
                marginBottom: '3px',
              }}
            >
              {record.name}
            </div>
            <div
              style={{
                borderTop: '1px solid #000',
                width: '80%',
                margin: '0 auto 6px auto',
              }}
            />
            <div>First Time Job Seeker</div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '28px',
              width: '320px',
              textAlign: 'center',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
              fontWeight: 'bold',
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                fontStyle: 'italic',
                marginBottom: '3px',
              }}
            >
              Roselyn Pestilos Anore
            </div>
            <div
              style={{
                borderTop: '1px solid #000',
                width: '80%',
                margin: '0 auto 6px auto',
              }}
            />
            <div>Barangay Secretary</div>
            <div>(Barangay Official/Designation/Position)</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { OathJobVerification };
