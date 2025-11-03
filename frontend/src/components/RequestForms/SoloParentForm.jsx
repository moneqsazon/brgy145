import React, { useEffect, useMemo, useState } from 'react';
import CaloocanLogo from '../../assets/CaloocanLogo.png';
import Logo145 from '../../assets/Logo145.png';
import BagongPilipinas from '../../assets/BagongPilipinas.png';
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
  Receipt as ReceiptIcon,
  Print as PrintIcon,
  PersonAdd as PersonAddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

export default function SoloParentForm() {
  const apiBase = 'http://localhost:5000';

  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');

  const [zoomLevel, setZoomLevel] = useState(0.75);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [residents, setResidents] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    address: '',
    residentsSinceYear: '',
    unwedSinceYear: '',
    employmentStatus: '',
    employmentRemarks: '',
    dateIssued: new Date().toISOString().split('T')[0],
  });

  const [children, setChildren] = useState([]);

  const employmentOptions = ['Employed', 'Unemployed', 'Self-Employed', 'Business Owner', 'Freelancer', 'Contract Worker', 'Others'];
  const educationOptions = ['Nursery', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'College 1st Year', 'College 2nd Year', 'College 3rd Year', 'College 4th Year', 'College 5th Year', 'Graduate School', 'Others'];
  const genderOptions = ['Male', 'Female', 'Others'];
  const relationshipOptions = ['Son', 'Daughter', 'Others'];

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
      const res = await fetch(`${apiBase}/solo-parent-records`);
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              id: r.solo_parent_id,
              name: r.full_name,
              address: r.address,
              birthday: r.dob?.slice(0, 10) || '',
              age: String(r.age ?? ''),
              contactNo: r.contact_no || '',
              residentsSinceYear: r.residents_since_year || '',
              unwedSinceYear: r.unwed_since_year || '',
              employmentStatus: r.employment_status || '',
              employmentRemarks: r.employment_remarks || '',
              dateIssued: r.date_issued?.slice(0, 10) || '',
              dateCreated: r.date_created,
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

  async function loadChildren(soloParentId) {
    try {
      const res = await fetch(`${apiBase}/solo-parent-children/${soloParentId}`);
      const data = await res.json();
      setChildren(
        Array.isArray(data)
          ? data.map((c) => ({
              id: c.child_id,
              name: c.child_name,
              age: c.child_age,
              birthday: c.child_birthday?.slice(0, 10) || '',
              level: c.child_level,
              levelRemarks: c.child_level_remarks || '',
              gender: c.child_gender || '',
              relationship: c.child_relationship || '',
              relationshipRemarks: c.child_relationship_remarks || '',
            }))
          : []
      );
    } catch (e) {
      console.error('loadChildren error', e);
    }
  }

  function toServerPayload(data) {
    return {
      resident_id: data.resident_id || null,
      full_name: data.name,
      age: data.age ? Number(data.age) : null,
      address: data.address || null,
      dob: data.birthday || null,
      contact_no: data.contactNo || null,
      residents_since_year: data.residentsSinceYear || null,
      unwed_since_year: data.unwedSinceYear || null,
      employment_status: data.employmentStatus || null,
      employment_remarks: data.employmentRemarks || null,
      date_issued: data.dateIssued,
    };
  }

  function childrenToServerPayload() {
    return children.map((child) => ({
      child_name: child.name,
      child_age: child.age,
      child_birthday: child.birthday || null,
      child_level: child.level,
      child_level_remarks: child.levelRemarks || null,
      child_gender: child.gender || null,
      child_relationship: child.relationship || null,
      child_relationship_remarks: child.relationshipRemarks || null,
    }));
  }

  async function handleCreate() {
    try {
      const res = await fetch(`${apiBase}/solo-parent-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toServerPayload(formData)),
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      const soloParentId = created.solo_parent_id;

      // Save children
      if (children.length > 0) {
        await fetch(`${apiBase}/solo-parent-children/${soloParentId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(childrenToServerPayload()),
        });
      }

      const newRec = {
        ...formData,
        id: soloParentId,
        dateCreated: new Date().toISOString(),
      };
      setRecords([newRec, ...records]);
      setSelectedRecord(newRec);
      resetForm();
      setActiveTab('records');
    } catch (e) {
      console.error('handleCreate error', e);
      alert('Failed to create record');
    }
  }

  async function handleUpdate() {
    try {
      const res = await fetch(`${apiBase}/solo-parent-records/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toServerPayload(formData)),
      });
      if (!res.ok) throw new Error('Update failed');

      // Update children
      await fetch(`${apiBase}/solo-parent-children/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(childrenToServerPayload()),
      });

      const updated = { ...formData, id: editingId };
      setRecords(records.map((r) => (r.id === editingId ? updated : r)));
      setSelectedRecord(updated);
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
      const res = await fetch(`${apiBase}/solo-parent-records/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.id !== id));
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (e) {
      console.error('handleDelete error', e);
      alert('Failed to delete record');
    }
  }

  async function handleView(record) {
    setSelectedRecord(record);
    setFormData({ 
      ...record,
      employmentStatus: record.employmentStatus || '',
      employmentRemarks: record.employmentRemarks || '',
    });
    setEditingId(record.id);
    setIsFormOpen(true);
    setActiveTab('form');
    
    // Load children data
    await loadChildren(record.id);
  }

  async function handleEdit(record) {
    setSelectedRecord(record);
    setFormData({
      ...record,
      employmentStatus: record.employmentStatus || '',
      employmentRemarks: record.employmentRemarks || '',
    });
    setEditingId(record.id);
    setIsFormOpen(true);
    setActiveTab('form');
    await loadChildren(record.id);
  }

  function resetForm() {
    setFormData({
      name: '',
      age: '',
      address: '',
      residentsSinceYear: '',
      unwedSinceYear: '',
      employmentStatus: '',
      employmentRemarks: '',
      dateIssued: new Date().toISOString().split('T')[0],
    });
    setChildren([]);
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedRecord(null);
  }

  function handleSubmit() {
    if (editingId) handleUpdate();
    else handleCreate();
  }

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
        `Certificate Type: Solo Parent Certification`,
        `Certificate ID: ${display.id || 'Draft'}`,
        `Full Name: ${display.name || ''}`,
        `Address: ${display.address || ''}`,
        `Date Issued: ${display.dateIssued || ''}`,
        `Date Created (E-Signature Applied): ${createdDate}`,
        ``,
        `VERIFICATION:`,
        `Visit: ${window.location.origin}/verify-solo-parent?id=${display.id || 'Draft'}`,
      ];
      let yPos = 1.2;
      const lineHeight = 0.25;
      details.forEach((line) => {
        pdf.text(line, 0.5, yPos);
        yPos += lineHeight;
      });
      const fileName = `SoloParent_${(display.name || 'record').replace(/\s+/g, '_')}.pdf`;
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

  // ---------- Children Management ----------
  const addChild = () => {
    setChildren([
      ...children,
      {
        id: `temp-${Date.now()}`,
        name: '',
        age: '',
        birthday: '',
        level: '',
        levelRemarks: '',
        gender: '',
        relationship: '',
        relationshipRemarks: '',
      },
    ]);
  };

  const removeChild = (index) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index, field, value) => {
    const updatedChildren = [...children];
    updatedChildren[index] = { ...updatedChildren[index], [field]: value };
    
    // If birthday is updated, calculate the age
    if (field === 'birthday' && value) {
      updatedChildren[index].age = calculateAge(value);
    }
    
    setChildren(updatedChildren);
  };

  // ---------- JSX (left certificate kept largely unchanged) ----------
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
              <img
                src={Logo145}
                alt="Watermark"
                style={{
                  position: 'absolute',
                  top: '200px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  opacity: 0.1,
                  width: '500px',
                  height: '500px',
                  border: '2px dashed #ccc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />

              {/* Header */}
              <div
                style={{
                  position: 'absolute',
                  top: '70px',
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '14pt',
                  fontWeight: 'bold',
                  lineHeight: 1.5,
                }}
              >
                <div
                  style={{
                    fontFamily: 'Lucida Calligraphy, "Times New Roman", serif',
                  }}
                >
                  Republic Of the Philippines
                </div>
                <div style={{ fontSize: '13pt' }}>City of Caloocan</div>
                <div
                  style={{
                    fontSize: '12pt',
                    marginTop: '4px',
                    fontFamily: 'Bodoni MT Black',
                  }}
                >
                  BARANGAY 145 ZONE 13 DISTRICT 1
                </div>
                <div
                  style={{
                    fontSize: '11pt',
                    marginTop: '8px',
                    fontFamily: 'Bodoni MT Black',
                  }}
                >
                  OFFICE OF THE BARANGAY CAPTAIN
                </div>
              </div>

              {/* Title */}
              <div
                style={{
                  position: 'absolute',
                  top: '190px',
                  width: '100%',
                  textAlign: 'center',
                  fontFamily: 'Bodoni MT Black, "Times New Roman", serif',
                  fontSize: '18pt',
                  fontWeight: 'bold',
                  textDecoration: 'underline',
                  letterSpacing: '1px',
                }}
              >
                BARANGAY CERTIFICATION
              </div>

              {/* Main Content */}
              <div
                style={{
                  position: 'absolute',
                  top: '270px',
                  left: '60px',
                  width: '680px',
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '12pt',
                  lineHeight: 1.8,
                  textAlign: 'justify',
                  zIndex: 1,
                }}
              >
                <p style={{ marginBottom: '20px' }}>
                  <strong>
                    This is to certify that,{' '}
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
                      {(selectedRecord || formData).name || 'Name'}
                    </span>
                    ,{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: '40px',
                        borderBottom: '1px solid black',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontStyle: 'italic',
                      }}
                    >
                      {(selectedRecord || formData).age || 'Age'}
                    </span>{' '}
                    y/o is a Bonafide resident of{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: '250px',
                        borderBottom: '1px solid black',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {(selectedRecord || formData).address || 'Address'}
                    </span>{' '}
                    Barangay 145 of this city, since{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: '80px',
                        borderBottom: '1px solid black',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {(selectedRecord || formData).residentsSinceYear || 'Year'}
                    </span>
                    .
                  </strong>
                </p>

                <p style={{ marginBottom: '20px' }}>
                  <strong>
                    Upon verification, she is currently not in any form of
                    relationship and is qualified to apply for a Solo Parent ID
                    based on the classification set forth by RA 8972, otherwise
                    known as the Solo Parents Welfare Act 2000.
                  </strong>
                </p>

                <p style={{ marginBottom: '20px' }}>
                  <strong>
                    Ms.{' '}
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
                      {(selectedRecord || formData).name || 'Name'}
                    </span>
                    , is UNWED, since,{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: '80px',
                        borderBottom: '1px solid black',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {(selectedRecord || formData).unwedSinceYear || 'Year'}
                    </span>
                    .
                  </strong>
                </p>

                <p style={{ marginBottom: '20px' }}>
                  <strong>
                    Moreover{' '}
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
                      {(selectedRecord || formData).name || 'Name'}
                    </span>{' '}
                    has{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: '30px',
                        borderBottom: '1px solid black',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {children.length || '___'}
                    </span>{' '}
                    qualified dependent living with her
                    {children.length > 0 && (
                      <>
                        :{' '}
                        {children.map((child, index) => (
                          <span key={child.id || index}>
                            {index > 0 && ', '}
                            her{' '}
                            <span
                              style={{
                                display: 'inline-block',
                                minWidth: '120px',
                                borderBottom: '1px solid black',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                fontStyle: 'italic',
                              }}
                            >
                              {child.name || 'Child Name'}
                            </span>
                            ,{' '}
                            <span
                              style={{
                                display: 'inline-block',
                                minWidth: '30px',
                                borderBottom: '1px solid black',
                                fontWeight: 'bold',
                                textAlign: 'center',
                              }}
                            >
                              {child.age || 'Age'}
                            </span>{' '}
                            y/o, birthday-
                            <span
                              style={{
                                display: 'inline-block',
                                minWidth: '100px',
                                borderBottom: '1px solid black',
                                fontWeight: 'bold',
                                textAlign: 'center',
                              }}
                            >
                              {child.birthday || 'Birthday'}
                            </span>
                            {child.level && (
                              <>
                                ,{' '}
                                <span
                                  style={{
                                    display: 'inline-block',
                                    minWidth: '100px',
                                    borderBottom: '1px solid black',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                  }}
                                >
                                  {child.level}
                                </span>
                              </>
                            )}
                          </span>
                        ))}
                      </>
                    )}
                    .
                  </strong>
                </p>

                <p style={{ marginBottom: '20px' }}>
                  <strong>
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
                      {(selectedRecord || formData).name || 'Name'}
                    </span>{' '}
                    is{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: '120px',
                        borderBottom: '1px solid black',
                        fontWeight: 'bold',
                        textAlign: 'center',
                      }}
                    >
                      {(selectedRecord || formData).employmentStatus === 'Others' 
                        ? (selectedRecord || formData).employmentRemarks || 'Employment Status'
                        : (selectedRecord || formData).employmentStatus || 'Employment Status'
                      }
                    </span>
                    .
                  </strong>
                </p>

                <p style={{ marginBottom: '30px' }}>
                  <strong>
                    This certification is issued solely for the purpose of
                    authentication of Ms.{' '}
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
                      {(selectedRecord || formData).name || 'Name'}
                    </span>
                    , qualification to apply for a Solo Parent ID and receive all
                    benefits that go with it.
                  </strong>
                </p>

                <p style={{ marginBottom: '40px' }}>
                  <strong>
                    Issued this{' '}
                    <span
                      style={{
                        display: 'inline-block',
                        minWidth: '150px',
                        borderBottom: '1px solid black',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        fontStyle: 'italic',
                      }}
                    >
                      {(selectedRecord || formData).dateIssued
                        ? formatDate((selectedRecord || formData).dateIssued)
                        : '__________________'}
                    </span>
                    .
                  </strong>
                </p>
              </div>

              {/* Bottom Section */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '80px',
                  left: '60px',
                  width: '680px',
                  fontFamily: '"Times New Roman", serif',
                  fontSize: '12pt',
                  fontWeight: 'bold',
                }}
              >
                <div style={{ marginBottom: '50px' }}>
                  Brgy. SOLO PARENT Focal Person/Barangay Officials
                </div>

                {/* Signatures */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '50px',
                  }}
                >
                  <div style={{ textAlign: 'center', width: '300px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                      ROSALINA P. ANORE
                    </div>
                    <div
                      style={{
                        borderTop: '1px solid #000',
                        width: '80%',
                        margin: '0 auto 8px auto',
                      }}
                    ></div>
                    <div style={{ fontWeight: 'bold' }}>Brgy. Secretary</div>
                  </div>

                  <div style={{ textAlign: 'center', width: '300px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                      ARNOLD DONDONAYOS
                    </div>
                    <div
                      style={{
                        borderTop: '1px solid #000',
                        width: '80%',
                        margin: '0 auto 8px auto',
                      }}
                    ></div>
                    <div style={{ fontWeight: 'bold' }}>Barangay Captain</div>
                  </div>
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
                sx={{ fontWeight: 800, color: '#445C3C' }}
              >
                Solo Parent Certification
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrintIcon />}
                  onClick={handlePrint}
                  disabled={!selectedRecord && !editingId}
                  sx={{
                    color: '#445C3C',
                    borderColor: '#445C3C',
                    '&:hover': {
                      bgcolor: '#445C3C',
                      color: '#fff',
                      borderColor: '#445C3C',
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
                    bgcolor: '#445C3C',
                    '&:hover': { bgcolor: '#2e3d2a' },
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
                      color: '#445C3C !important',
                      fontWeight: 600,
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#445C3C',
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
                      {editingId ? 'Edit Record' : 'New Solo Parent Record'}
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
                            resident_id: value.resident_id,
                            name: value.full_name,
                            address: value.address || '',
                            birthday: value.dob?.slice(0, 10) || '',
                            age: calculateAge(value.dob?.slice(0, 10)),
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
                                borderColor: '#445C3C',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#445C3C',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#445C3C',
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
                          '&:hover fieldset': { borderColor: '#445C3C' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#445C3C',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#445C3C',
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
                                borderColor: '#445C3C',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: '#445C3C',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#445C3C',
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
                      label="Resident Since Year"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={formData.residentsSinceYear}
                      onChange={(e) =>
                        setFormData({ ...formData, residentsSinceYear: e.target.value })
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#445C3C' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#445C3C',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#445C3C',
                        },
                      }}
                    />

                    <TextField
                      label="Unwed Since Year"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={formData.unwedSinceYear}
                      onChange={(e) =>
                        setFormData({ ...formData, unwedSinceYear: e.target.value })
                      }
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': { borderColor: '#445C3C' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#445C3C',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#445C3C',
                        },
                      }}
                    />

                    {/* Employment Section */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Employment Information
                      </Typography>
                      <FormControl fullWidth size="small" variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#445C3C' }, '&.Mui-focused fieldset': { borderColor: '#445C3C' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#445C3C' } }}
                      >
                        <InputLabel>Employment Status</InputLabel>
                        <Select
                          value={formData.employmentStatus}
                          label="Employment Status"
                          onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
                        >
                          {employmentOptions.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {formData.employmentStatus === 'Others' && (
                        <TextField
                          label="Employment Remarks"
                          variant="outlined"
                          size="small"
                          fullWidth
                          multiline
                          rows={2}
                          value={formData.employmentRemarks}
                          onChange={(e) => setFormData({ ...formData, employmentRemarks: e.target.value })}
                          sx={{
                            mt: 1,
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#445C3C' },
                              '&.Mui-focused fieldset': { borderColor: '#445C3C' },
                            },
                            '& .MuiInputLabel-root.Mui-focused': { color: '#445C3C' },
                          }}
                        />
                      )}
                    </Box>

                    {/* Children Section */}
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          Children Information
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PersonAddIcon />}
                          onClick={addChild}
                          sx={{
                            color: '#445C3C',
                            borderColor: '#445C3C',
                            '&:hover': {
                              bgcolor: '#445C3C',
                              color: '#fff',
                            },
                          }}
                        >
                          Add Child
                        </Button>
                      </Box>

                      {children.length === 0 ? (
                        <Typography variant="body2" sx={{ color: 'grey.500', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                          No children added yet
                        </Typography>
                      ) : (
                        <Stack spacing={2}>
                          {children.map((child, index) => (
                            <Card key={child.id || index} sx={{ p: 2, bgcolor: 'grey.50' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2">Child {index + 1}</Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => removeChild(index)}
                                  sx={{ color: 'error.main' }}
                                >
                                  <RemoveIcon />
                                </IconButton>
                              </Box>
                              <Grid container spacing={1.5}>
                                <Grid item xs={12}>
                                  <TextField
                                    label="Child Name"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={child.name}
                                    onChange={(e) => updateChild(index, 'name', e.target.value)}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': { borderColor: '#445C3C' },
                                        '&.Mui-focused fieldset': { borderColor: '#445C3C' },
                                      },
                                      '& .MuiInputLabel-root.Mui-focused': { color: '#445C3C' },
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField
                                    label="Birthday"
                                    type="date"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={child.birthday}
                                    onChange={(e) => updateChild(index, 'birthday', e.target.value)}
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': { borderColor: '#445C3C' },
                                        '&.Mui-focused fieldset': { borderColor: '#445C3C' },
                                      },
                                      '& .MuiInputLabel-root.Mui-focused': { color: '#445C3C' },
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={6}>
                                  <TextField
                                    label="Age"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={child.age}
                                    InputProps={{ readOnly: true }}
                                    sx={{
                                      '& .MuiOutlinedInput-root': { bgcolor: 'grey.100' },
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <FormControl fullWidth size="small" variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#445C3C' }, '&.Mui-focused fieldset': { borderColor: '#445C3C' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#445C3C' } }}
                                  >
                                    <InputLabel>Education Level</InputLabel>
                                    <Select
                                      value={child.level}
                                      label="Education Level"
                                      onChange={(e) => updateChild(index, 'level', e.target.value)}
                                    >
                                      {educationOptions.map((level) => (
                                        <MenuItem key={level} value={level}>{level}</MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                {child.level === 'Others' && (
                                  <Grid item xs={12}>
                                    <TextField
                                      label="Education Level Remarks"
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      value={child.levelRemarks}
                                      onChange={(e) => updateChild(index, 'levelRemarks', e.target.value)}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          '&:hover fieldset': { borderColor: '#445C3C' },
                                          '&.Mui-focused fieldset': { borderColor: '#445C3C' },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#445C3C' },
                                      }}
                                    />
                                  </Grid>
                                )}
                                <Grid item xs={6}>
                                  <FormControl fullWidth size="small" variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#445C3C' }, '&.Mui-focused fieldset': { borderColor: '#445C3C' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#445C3C' } }}
                                  >
                                    <InputLabel>Gender</InputLabel>
                                    <Select
                                      value={child.gender}
                                      label="Gender"
                                      onChange={(e) => updateChild(index, 'gender', e.target.value)}
                                    >
                                      {genderOptions.map((gender) => (
                                        <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                <Grid item xs={6}>
                                  <FormControl fullWidth size="small" variant="outlined"
                                    sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#445C3C' }, '&.Mui-focused fieldset': { borderColor: '#445C3C' } }, '& .MuiInputLabel-root.Mui-focused': { color: '#445C3C' } }}
                                  >
                                    <InputLabel>Relationship</InputLabel>
                                    <Select
                                      value={child.relationship}
                                      label="Relationship"
                                      onChange={(e) => updateChild(index, 'relationship', e.target.value)}
                                    >
                                      {relationshipOptions.map((relationship) => (
                                        <MenuItem key={relationship} value={relationship}>{relationship}</MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                                {child.relationship === 'Others' && (
                                  <Grid item xs={12}>
                                    <TextField
                                      label="Relationship Remarks"
                                      variant="outlined"
                                      size="small"
                                      fullWidth
                                      value={child.relationshipRemarks}
                                      onChange={(e) => updateChild(index, 'relationshipRemarks', e.target.value)}
                                      sx={{
                                        '& .MuiOutlinedInput-root': {
                                          '&:hover fieldset': { borderColor: '#445C3C' },
                                          '&.Mui-focused fieldset': { borderColor: '#445C3C' },
                                        },
                                        '& .MuiInputLabel-root.Mui-focused': { color: '#445C3C' },
                                      }}
                                    />
                                  </Grid>
                                )}
                              </Grid>
                            </Card>
                          ))}
                        </Stack>
                      )}
                    </Box>

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
                          '&:hover fieldset': { borderColor: '#445C3C' },
                          '&.Mui-focused fieldset': {
                            borderColor: '#445C3C',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#445C3C',
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
                          bgcolor: '#445C3C',
                          '&:hover': { bgcolor: '#2e3d2a' },
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
                            color: '#445C3C',
                            borderColor: '#445C3C',
                            '&:hover': {
                              bgcolor: '#e8f5e9',
                              borderColor: '#445C3C',
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
                      '&:hover fieldset': { borderColor: '#445C3C' },
                      '&.Mui-focused fieldset': { borderColor: '#445C3C' },
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
                              <Box
                                sx={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: 0.5,
                                  alignItems: 'center',
                                }}
                              >
                                {record.contactNo && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: 'grey.500',
                                      fontSize: '0.625rem',
                                    }}
                                  >
                                    {record.contactNo}
                                  </Typography>
                                )}
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
                            </Box>
                            <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleView(record)}
                                sx={{
                                  color: 'info.main',
                                  '&:hover': { bgcolor: 'info.lighter' },
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
                        bgcolor: '#445C3C',
                        '&:hover': { bgcolor: '#2e3d2a' },
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
                            borderColor: '#445C3C',
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
                                    color: '#445C3C',
                                    mb: 0.5,
                                  }}
                                >
                                  {record.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#445C3C',
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
                                    color: 'info.main',
                                    '&:hover': { bgcolor: 'info.lighter' },
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
    </Box>
  );
}

// ================= FULL VERIFICATION VIEW ==================
function SoloParentVerification() {
  const [record, setRecord] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [children, setChildren] = React.useState([]);
  const zoomLevel = 1;

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      setError('No certificate ID provided.');
      setLoading(false);
      return;
    }

    // Otherwise fetch from backend
    fetch(`http://localhost:5000/solo-parent-records/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.solo_parent_id) {
          setRecord({
            id: data.solo_parent_id,
            name: data.full_name,
            address: data.address,
            age: data.age,
            residentsSinceYear: data.residents_since_year,
            unwedSinceYear: data.unwed_since_year,
            employmentStatus: data.employment_status,
            employmentRemarks: data.employment_remarks,
            dateIssued: data.date_issued,
            dateCreated: data.date_created,
          });

          // Fetch children data
          fetch(`http://localhost:5000/solo-parent-children/${id}`)
            .then((res) => res.json())
            .then((childrenData) => {
              if (Array.isArray(childrenData)) {
                setChildren(
                  childrenData.map((c) => ({
                    id: c.child_id,
                    name: c.child_name,
                    age: c.child_age,
                    birthday: c.child_birthday?.slice(0, 10) || '',
                    level: c.child_level,
                    levelRemarks: c.child_level_remarks,
                    gender: c.child_gender,
                    relationship: c.child_relationship,
                    relationshipRemarks: c.child_relationship_remarks,
                  }))
                );
              }
            })
            .catch((err) => console.error('Failed to fetch children:', err));
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
              top: '200px',
              left: '50%',
              transform: 'translateX(-50%)',
              opacity: 0.1,
              width: '500px',
              height: '500px',
              border: '2px dashed #ccc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />

          {/* Header */}
          <div
            style={{
              position: 'absolute',
              top: '70px',
              width: '100%',
              textAlign: 'center',
              fontSize: '14pt',
              fontWeight: 'bold',
              lineHeight: 1.5,
            }}
          >
            <div
              style={{
                fontFamily: 'Lucida Calligraphy, "Times New Roman", serif',
              }}
            >
              Republic Of the Philippines
            </div>
            <div style={{ fontSize: '13pt' }}>City of Caloocan</div>
            <div
              style={{
                fontSize: '12pt',
                marginTop: '4px',
                fontFamily: 'Bodoni MT Black',
              }}
            >
              BARANGAY 145 ZONE 13 DISTRICT 1
            </div>
            <div
              style={{
                fontSize: '11pt',
                marginTop: '8px',
                fontFamily: 'Bodoni MT Black',
              }}
            >
              OFFICE OF THE BARANGAY CAPTAIN
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              position: 'absolute',
              top: '190px',
              width: '100%',
              textAlign: 'center',
              fontFamily: 'Bodoni MT Black, "Times New Roman", serif',
              fontSize: '18pt',
              fontWeight: 'bold',
              textDecoration: 'underline',
              letterSpacing: '1px',
            }}
          >
            BARANGAY CERTIFICATION
          </div>

          {/* Main Content */}
          <div
            style={{
              position: 'absolute',
              top: '270px',
              left: '60px',
              width: '680px',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
              lineHeight: 1.8,
              textAlign: 'justify',
              zIndex: 1,
            }}
          >
            <p style={{ marginBottom: '20px' }}>
              <strong>
                This is to certify that,{' '}
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
                  {record.name || 'Name'}
                </span>
                ,{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '40px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  {record.age || 'Age'}
                </span>{' '}
                y/o is a Bonafide resident of{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '250px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {record.address || 'Address'}
                </span>{' '}
                Barangay 145 of this city, since{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '80px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {record.residentsSinceYear || 'Year'}
                </span>
                .
              </strong>
            </p>

            <p style={{ marginBottom: '20px' }}>
              <strong>
                Upon verification, she is currently not in any form of
                relationship and is qualified to apply for a Solo Parent ID
                based on the classification set forth by RA 8972, otherwise
                known as the Solo Parents Welfare Act 2000.
              </strong>
            </p>

            <p style={{ marginBottom: '20px' }}>
              <strong>
                Ms.{' '}
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
                  {record.name || 'Name'}
                </span>
                , is UNWED, since,{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '80px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {record.unwedSinceYear || 'Year'}
                </span>
                .
              </strong>
            </p>

            <p style={{ marginBottom: '20px' }}>
              <strong>
                Moreover{' '}
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
                  {record.name || 'Name'}
                </span>{' '}
                has{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '30px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {children.length || '___'}
                </span>{' '}
                qualified dependent living with her
                {children.length > 0 && (
                  <>
                    :{' '}
                    {children.map((child, index) => (
                      <span key={child.id || index}>
                        {index > 0 && ', '}
                        her{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '120px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            fontStyle: 'italic',
                          }}
                        >
                          {child.name || 'Child Name'}
                        </span>
                        ,{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '30px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {child.age || 'Age'}
                        </span>{' '}
                        y/o, birthday-
                        <span
                          style={{
                            display: 'inline-block',
                            minWidth: '100px',
                            borderBottom: '1px solid black',
                            fontWeight: 'bold',
                            textAlign: 'center',
                          }}
                        >
                          {child.birthday || 'Birthday'}
                        </span>
                        {child.level && (
                          <>
                            ,{' '}
                            <span
                              style={{
                                display: 'inline-block',
                                minWidth: '100px',
                                borderBottom: '1px solid black',
                                fontWeight: 'bold',
                                textAlign: 'center',
                              }}
                            >
                              {child.level}
                            </span>
                          </>
                        )}
                      </span>
                    ))}
                  </>
                )}
                .
              </strong>
            </p>

            <p style={{ marginBottom: '20px' }}>
              <strong>
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
                  {record.name || 'Name'}
                </span>{' '}
                is{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '120px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {record.employmentStatus === 'Others' 
                    ? record.employmentRemarks || 'Employment Status'
                    : record.employmentStatus || 'Employment Status'
                  }
                </span>
                .
              </strong>
            </p>

            <p style={{ marginBottom: '30px' }}>
              <strong>
                This certification is issued solely for the purpose of
                authentication of Ms.{' '}
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
                  {record.name || 'Name'}
                </span>
                , qualification to apply for a Solo Parent ID and receive all
                benefits that go with it.
              </strong>
            </p>

            <p style={{ marginBottom: '40px' }}>
              <strong>
                Issued this{' '}
                <span
                  style={{
                    display: 'inline-block',
                    minWidth: '150px',
                    borderBottom: '1px solid black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontStyle: 'italic',
                  }}
                >
                  {record.dateIssued ? formatDate(record.dateIssued) : '__________________'}
                </span>
                .
              </strong>
            </p>
          </div>

          {/* Bottom Section */}
          <div
            style={{
              position: 'absolute',
              bottom: '80px',
              left: '60px',
              width: '680px',
              fontFamily: '"Times New Roman", serif',
              fontSize: '12pt',
              fontWeight: 'bold',
            }}
          >
            <div style={{ marginBottom: '50px' }}>
              Brgy. SOLO PARENT Focal Person/Barangay Officials
            </div>

            {/* Signatures */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '50px',
              }}
            >
              <div style={{ textAlign: 'center', width: '300px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                  ROSALINA P. ANORE
                </div>
                <div
                  style={{
                    borderTop: '1px solid #000',
                    width: '80%',
                    margin: '0 auto 8px auto',
                  }}
                ></div>
                <div style={{ fontWeight: 'bold' }}>Brgy. Secretary</div>
              </div>

              <div style={{ textAlign: 'center', width: '300px' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                  ARNOLD DONDONAYOS
                </div>
                <div
                  style={{
                    borderTop: '1px solid #000',
                    width: '80%',
                    margin: '0 auto 8px auto',
                  }}
                ></div>
                <div style={{ fontWeight: 'bold' }}>Barangay Captain</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { SoloParentVerification };