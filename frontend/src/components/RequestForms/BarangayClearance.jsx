import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router-dom';
import CaloocanLogo from '../../assets/CaloocanLogo.png';
import Logo145 from '../../assets/Logo145.png';
import BagongPilipinas from '../../assets/BagongPilipinas.png';
import WordName from '../../assets/WordName.png';

// Import Material UI components
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
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  createTheme,
  ThemeProvider,
  Avatar,
  Badge,
  Tooltip,
  Fab,
  AppBar,
  Toolbar,
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
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  Folder as FolderIcon,
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';

// Define the custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#41644A', // Darker green from palette
      light: '#A0B2A6', // Lighter shade for hover/focus
      dark: '#0D4715', // Even darker green for strong accents
    },
    secondary: {
      main: '#E9762B', // Orange from palette for highlighting
    },
    success: {
      main: '#41644A', // Darker green from palette
      light: '#A0B2A6',
      dark: '#0D4715',
    },
    background: {
      default: '#F1F0E9', // Off-white/light beige
      paper: '#FFFFFF',
    },
    text: {
      primary: '#000000', // Black for main text
      secondary: '#41644A', // Another shade for secondary text
    },
    error: {
      main: '#E9762B',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #41644A 30%, #527D60 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #E9762B 30%, #F4944D 90%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          minHeight: 48,
          color: '#000000',
          '&.Mui-selected': {
            color: '#41644A',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: '#000000',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#000000',
          '&.Mui-focused': {
            color: '#41644A',
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: '#000000',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#41644A',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#41644A',
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#000000',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#41644A',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#41644A',
            },
          },
        },
      },
    },
  },
});

export default function BarangayClearance() {
  const apiBase = 'http://localhost:5000';
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('form');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionSearch, setTransactionSearch] = useState('');
  const [residents, setResidents] = useState([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.75); // Default zoom level

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [formData, setFormData] = useState({
    resident_id: '',
    full_name: '',
    address: '',
    dob: '',
    age: '',
    provincial_address: '',
    contact_no: '',
    civil_status: 'Single',
    remarks:
      'Residence in this Barangay and certifies that he/she is a resident of good moral character.',
    request_reason: '',
    date_issued: new Date().toISOString().split('T')[0],
    transaction_number: '', // New field for transaction number
  });

  const civilStatusOptions = [
    'Single',
    'Married',
    'Widowed',
    'Divorced',
    'Separated',
  ];

  // Helper function to format date consistently without timezone issues
  function formatDateDisplay(dateString) {
    if (!dateString) return '';

    // Extract just the date part if it's a datetime string
    const dateOnly = dateString.includes('T')
      ? dateString.split('T')[0]
      : dateString;

    // Parse the date components
    const [year, month, day] = dateOnly.split('-');

    // Format as month name, day, year
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

  // Helper function to format date and time
  function formatDateTimeDisplay(dateString) {
    if (!dateString) return '';

    // Create a new Date object from the string
    const date = new Date(dateString);

    // Format as month name, day, year, time
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

    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    // Format time with AM/PM
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${month} ${day}, ${year} ${hours}:${minutes} ${ampm}`;
  }

  // Helper function to calculate age from date string
  function calculateAge(dateString) {
    if (!dateString) return '';

    const [year, month, day] = dateString.split('-');
    const birthDate = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age.toString();
  }

  // Generate a unique transaction number
  function generateTransactionNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random =
      Math.floor(Math.random() * 900) +
      (100) // 3-digit random number
        .toString()
        .padStart(3, '0');
    return `BC-${year}${month}${day}-${random}`;
  }

  // Store certificate data in localStorage for QR code verification
  function storeCertificateData(certificateData) {
    if (!certificateData.barangay_clearance_id) return;

    // Get existing certificates from localStorage
    const existingCertificates = JSON.parse(
      localStorage.getItem('certificates') || '{}'
    );

    // Add or update the certificate
    existingCertificates[certificateData.barangay_clearance_id] = certificateData;

    // Store back to localStorage
    localStorage.setItem('certificates', JSON.stringify(existingCertificates));
  }

  async function loadResidents() {
    try {
      const res = await fetch(`${apiBase}/residents`);
      const data = await res.json();
      // Format dates properly when loading residents - extract only YYYY-MM-DD
      const formattedResidents = data.map((resident) => ({
        ...resident,
        dob: resident.dob ? resident.dob.split('T')[0] : '',
      }));
      setResidents(formattedResidents);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadResidents();
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const res = await fetch(`${apiBase}/barangay-clearance`);
      const data = await res.json();
      setRecords(
        Array.isArray(data)
          ? data.map((r) => ({
              barangay_clearance_id: r.barangay_clearance_id,
              resident_id: r.resident_id,
              full_name: r.full_name,
              address: r.address,
              dob: r.dob?.split('T')[0] || '',
              age: String(r.age ?? ''),
              provincial_address: r.provincial_address || '',
              contact_no: r.contact_no || '',
              civil_status: r.civil_status,
              remarks: r.remarks,
              request_reason: r.request_reason,
              date_issued: r.date_issued?.split('T')[0] || '',
              date_created: r.date_created,
              transaction_number:
                r.transaction_number || generateTransactionNumber(), // Generate if missing
            }))
          : []
      );
    } catch (e) {
      console.error(e);
    }
  }

  function handleBirthdayChange(dob) {
    if (dob) {
      const age = calculateAge(dob);
      setFormData({ ...formData, dob, age });
    } else {
      setFormData({ ...formData, dob: '', age: '' });
    }
  }

  const display = useMemo(() => {
    if (editingId || isFormOpen) return formData;
    if (selectedRecord) return selectedRecord;
    return formData;
  }, [editingId, isFormOpen, selectedRecord, formData]);

  // Generate QR code with URL for PDF download
  useEffect(() => {
    const generateQRCode = async () => {
      if (display.barangay_clearance_id || display.full_name) {
        // Store the certificate data in localStorage
        storeCertificateData(display);

        // For QR: use LAN_DEV_BASE_URL if set, else window.location.origin
        const verificationOrigin = window.location.origin;
        const verificationUrl = `${verificationOrigin}/verify-certificate?id=${display.barangay_clearance_id || 'draft'}`;

        const qrContent = `Verification Link: ${verificationUrl}\nTransaction No: ${display.transaction_number || 'N/A'}\nName: ${display.full_name}`;

        try {
          const qrUrl = await QRCode.toDataURL(qrContent, {
            width: 140,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
            errorCorrectionLevel: 'L',
          });
          setQrCodeUrl(qrUrl);
        } catch (err) {
          console.error('Failed to generate QR code:', err);
        }
      } else {
        setQrCodeUrl('');
      }
    };

    generateQRCode();
  }, [display]);

  function toServerPayload(data) {
    return {
      resident_id: data.resident_id || null,
      full_name: data.full_name,
      address: data.address,
      dob: data.dob || null,
      age: data.age ? Number(data.age) : null,
      provincial_address: data.provincial_address || null,
      contact_no: data.contact_no || null,
      civil_status: data.civil_status,
      remarks: data.remarks,
      request_reason: data.request_reason,
      date_issued: data.date_issued,
      transaction_number: data.transaction_number, // Include transaction number
    };
  }

  async function handleCreate() {
    try {
      // Generate a transaction number for new certificates
      const transactionNumber = generateTransactionNumber();
      const updatedFormData = {
        ...formData,
        transaction_number: transactionNumber,
        date_created: new Date().toISOString(), // Add current timestamp
      };

      const res = await fetch(`${apiBase}/barangay-clearance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toServerPayload(updatedFormData)),
      });
      if (!res.ok) throw new Error('Create failed');
      const created = await res.json();
      const newRec = { ...updatedFormData, barangay_clearance_id: created.barangay_clearance_id };

      setRecords([newRec, ...records]);
      setSelectedRecord(newRec);

      // Store the new certificate data
      storeCertificateData(newRec);

      resetForm();
      setActiveTab('records');
    } catch (e) {
      console.error(e);
      alert('Failed to create record');
    }
  }

  async function handleUpdate() {
    try {
      const res = await fetch(`${apiBase}/barangay-clearance/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toServerPayload(formData)),
      });
      if (!res.ok) throw new Error('Update failed');
      const updated = { ...formData, barangay_clearance_id: editingId };
      setRecords(
        records.map((r) => (r.barangay_clearance_id === editingId ? updated : r))
      );
      setSelectedRecord(updated);

      // Store the updated certificate data
      storeCertificateData(updated);

      resetForm();
      setActiveTab('records');
    } catch (e) {
      console.error(e);
      alert('Failed to update record');
    }
  }

  function handleEdit(record) {
    setFormData({ ...record });
    setEditingId(record.barangay_clearance_id);
    setIsFormOpen(true);
    setActiveTab('form');
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this record?')) return;
    try {
      const res = await fetch(`${apiBase}/barangay-clearance/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Delete failed');
      setRecords(records.filter((r) => r.barangay_clearance_id !== id));
      if (selectedRecord?.barangay_clearance_id === id) setSelectedRecord(null);

      // Remove from localStorage
      const existingCertificates = JSON.parse(
        localStorage.getItem('certificates') || '{}'
      );
      delete existingCertificates[id];
      localStorage.setItem(
        'certificates',
        JSON.stringify(existingCertificates)
      );
    } catch (e) {
      console.error(e);
      alert('Failed to delete record');
    }
  }

  function handleView(record) {
    setSelectedRecord(record); // Set selected record for display
    setFormData({ ...record }); // Also populate form data for QR generation/dialog
    setEditingId(record.barangay_clearance_id); // To indicate viewing a specific record
    setIsFormOpen(true); // Keep the form open with the record details
    setActiveTab('form');
  }

  function resetForm() {
    setFormData({
      resident_id: '',
      full_name: '',
      address: '',
      dob: '',
      age: '',
      provincial_address: '',
      contact_no: '',
      civil_status: 'Single',
      remarks:
        'Residence in this Barangay and certifies that he/she is a resident of good moral character.',
      request_reason: '',
      date_issued: new Date().toISOString().split('T')[0],
      transaction_number: '',
    });
    setEditingId(null);
    setIsFormOpen(false);
    setSelectedRecord(null); // Clear selected record
  }

  function handleSubmit() {
    if (editingId) handleUpdate();
    else handleCreate();
  }

  const filteredRecords = useMemo(
    () =>
      records.filter(
        (r) =>
          r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (r.contact_no || '').includes(searchTerm)
      ),
    [records, searchTerm]
  );

  // Filter records by transaction number
  const transactionFilteredRecords = useMemo(
    () =>
      records.filter((r) =>
        r.transaction_number
          .toLowerCase()
          .includes(transactionSearch.toLowerCase())
      ),
    [records, transactionSearch]
  );

  // Generate PDF function
  async function generatePDF() {
    if (!display.barangay_clearance_id) {
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
        scale: 3, // High scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
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

      const fileName = `Barangay_Clearance_${display.barangay_clearance_id}_${display.full_name.replace(/\s+/g, '_')}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }

  function handlePrint() {
    if (!display.barangay_clearance_id) {
      alert('Please save the record first before printing');
      return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');

    // Get the certificate HTML
    const certificateElement = document.getElementById('certificate-preview');
    const certificateHTML = certificateElement.outerHTML;

    // Create the print document with proper styles
    printWindow.document.write(`
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
            font-family: Arial, sans-serif;
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
          
          /* Ensure all colors are preserved */
          #certificate-preview * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Remove any hover effects for printing */
          #certificate-preview *:hover {
            background-color: transparent !important;
            color: inherit !important;
          }
          
          /* Make sure images are properly sized */
          #certificate-preview img {
            max-width: 100%;
            height: auto;
          }
          
          /* Ensure text doesn't wrap unexpectedly */
          #certificate-preview span, #certificate-preview div {
            white-space: pre;
            overflow: visible;
          }
        </style>
      </head>
      <body>
        ${certificateHTML}
        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() {
              window.close();
            };
          };
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  }

  // Function to handle QR code click
  const handleQrCodeClick = () => {
    if (display.barangay_clearance_id) {
      const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.barangay_clearance_id}`;
      window.open(verificationUrl, '_blank');
    } else {
      // Show a dialog with the certificate details (for unsaved draft)
      setQrDialogOpen(true);
    }
  };

  // Function to handle transaction number search
  const handleTransactionSearch = () => {
    if (!transactionSearch) return;

    const foundRecord = records.find(
      (r) =>
        r.transaction_number.toLowerCase() === transactionSearch.toLowerCase()
    );

    if (foundRecord) {
      setSelectedRecord(foundRecord);
      setFormData({ ...foundRecord }); // Populate form data
      setEditingId(foundRecord.barangay_clearance_id); // Indicate viewing/editing
      setIsFormOpen(true); // Open form view
      setActiveTab('form'); // Switch to form tab
    } else {
      alert('No certificate found with this transaction number');
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2)); // Max zoom: 2x (200%)
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.3)); // Min zoom: 0.3x (30%)
  };

  const handleResetZoom = () => {
    setZoomLevel(0.75); // Reset to default
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      // Check if Ctrl/Cmd is pressed
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

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', bgcolor: 'background.default' }}>
        {/* TOP HEADER */}
        <Paper elevation={2} sx={{ zIndex: 10, borderRadius: 0 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            bgcolor: 'primary.main',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={Logo145} sx={{ width: 48, height: 48 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Barangay Clearance
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Manage all records of the Barangay Clearance
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
        <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* LEFT: Certificate preview */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            bgcolor: 'background.default',
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
                      onClick={handleQrCodeClick} 
                      startIcon={<QrCodeIcon />} 
                      disabled={!display.barangay_clearance_id}
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
                      disabled={!display.barangay_clearance_id || isGeneratingPDF} 
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
                      disabled={!display.barangay_clearance_id}
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
                <div
                  id="certificate-preview"
                  style={{
                    position: 'relative',
                    width: '8.5in',
                    height: '11in',
                    boxShadow: '0 0 8px rgba(0,0,0,0.2)',
                    background: '#fff',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                    colorAdjust: 'exact',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  {/* Certificate content remains the same */}
                  <img
                    style={{
                      position: 'absolute',
                      width: '80px',
                      height: '80px',
                      top: '60px',
                      left: '40px',
                    }}
                    src={CaloocanLogo}
                    alt="Logo 1"
                  />
                  <img
                    style={{
                      position: 'absolute',
                      width: '80px',
                      height: '80px',
                      top: '60px',
                      left: '130px',
                    }}
                    src={BagongPilipinas}
                    alt="Logo 2"
                  />
                  <img
                    style={{
                      position: 'absolute',
                      width: '100px',
                      height: '100px',
                      top: '50px',
                      right: '40px',
                    }}
                    src={Logo145}
                    alt="Logo 3"
                  />

                  {/* Watermark */}
                  <img
                    style={{
                      position: 'absolute',
                      opacity: 0.1,
                      width: '550px',
                      left: '50%',
                      top: '270px',
                      transform: 'translateX(-50%)',
                    }}
                    src={Logo145}
                    alt="Watermark"
                  />
                  {/* Header Text */}
                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      fontFamily: '"Lucida Calligraphy", cursive',
                      top: '50px',
                    }}
                  >
                    Republic of the Philippines
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '13pt',
                      fontWeight: 'bold',
                      fontFamily: 'Arial, sans-serif',
                      top: '84px',
                    }}
                  >
                    CITY OF CALOOCAN
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      fontFamily: '"Arial Black", sans-serif',
                      top: '110px',
                    }}
                  >
                    BARANGAY 145 ZONES 13 DIST. 1
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '18px',
                      fontWeight: 'bold',
                      fontFamily: '"Arial Black", sans-serif',
                      top: '138px',
                    }}
                  >
                    Tel. No. 8711 - 7134
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      textAlign: 'center',
                      width: '100%',
                      fontSize: '19px',
                      fontWeight: 'bold',
                      fontFamily: '"Arial Black", sans-serif',
                      top: '166px',
                    }}
                  >
                    OFFICE OF THE BARANGAY CHAIRMAN
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: '220px',
                      width: '100%',
                      textAlign: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: '"Brush Script MT", cursive',
                        fontSize: '28pt',
                        fontWeight: 'normal',
                        display: 'inline-block',
                        background: theme.palette.success.main, // Using theme color
                        color: '#fff',
                        padding: '4px 70px',
                        borderRadius: '8px',
                        position: 'relative',
                        boxShadow: '5px 5px 0 #d8d5d5ff', // white diagonal bottom shadow
                        WebkitPrintColorAdjust: 'exact',
                        printColorAdjust: 'exact',
                        colorAdjust: 'exact',
                      }}
                    >
                      Barangay Clearance
                    </span>
                  </div>

                  {/* Date */}
                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      top: '320px',
                      right: '80px',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: 'red', // Using theme orange
                    }}
                  >
                    Date:{' '}
                    {display.date_issued
                      ? formatDateDisplay(display.date_issued)
                      : ''}
                  </div>

                  {/* Body */}
                  <div
                    style={{
                      width: '640px',
                      textAlign: 'justify',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      color: 'black',
                      whiteSpace: 'normal',
                      marginBottom: '50px',
                      paddingTop: '330px',
                      float: 'right',
                      marginRight: '80px',
                      lineHeight: '1.5',
                    }}
                  >
                    <p style={{ margin: 0, marginBottom: '1em' }}>
                      To whom it may concern:
                    </p>
                    <p style={{ margin: 0, textIndent: '50px' }}>
                      This is to certify that the person whose name and thumb
                      print appear hereon has requested a{' '}
                      <i> Barangay Clearance</i> from this office and the result/s
                      is/are listed below and valid for six (6) months only.
                    </p>
                  </div>

                  {/* Info */}
                  <div
                    style={{
                      position: 'absolute',
                      whiteSpace: 'pre',
                      top: '470px',
                      left: '95px',
                      width: '640px',
                      lineHeight: '1.8',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        Name:
                      </span>{' '}
                      <span style={{ color: 'black', marginLeft: '10px' }}>
                        {display.full_name || ''}
                      </span>
                      <br />
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        Address:
                      </span>{' '}
                      <span style={{ color: 'black', marginLeft: '10px' }}>
                        {display.address || ''}
                      </span>
                      <br />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          width: '640px',
                        }}
                      >
                        <div style={{ width: '420px' }}>
                          <span
                            style={{
                              color: 'red', // Using theme orange
                              fontWeight: 'bold',
                              fontFamily: '"Times New Roman", serif',
                            }}
                          >
                            Birthday:
                          </span>{' '}
                          <span style={{ color: 'black', marginLeft: '10px' }}>
                            {display.dob ? formatDateDisplay(display.dob) : ''}
                          </span>
                        </div>
                        <div style={{ width: '500px', textAlign: 'left' }}>
                          <span
                            style={{
                              color: 'red', // Using theme orange
                              fontWeight: 'bold',
                              fontFamily: '"Times New Roman", serif',
                            }}
                          >
                            Age:
                          </span>{' '}
                          <span style={{ color: 'black', marginLeft: '10px' }}>
                            {display.age || ''}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          width: '640px',
                        }}
                      >
                        {/* Left side: Provincial Address */}
                        <div
                          style={{
                            width: '420px', // fixed width for stable layout
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                          }}
                        >
                          <span
                            style={{
                              color: 'red', // Using theme orange
                              fontWeight: 'bold',
                              fontFamily: '"Times New Roman", serif',
                            }}
                          >
                            Provincial Address:
                          </span>{' '}
                          <span
                            style={{
                              color: 'black',
                              marginLeft: '10px',
                            }}
                          >
                            {display.provincial_address || ''}
                          </span>
                        </div>

                        {/* Right side: Contact No. */}
                        <div
                          style={{
                            width: '400px', // fixed width so it won't move
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginRight: '95px',
                          }}
                        >
                          <span
                            style={{
                              color: 'red', // Using theme orange
                              fontWeight: 'bold',
                              fontFamily: '"Times New Roman", serif',
                            }}
                          >
                            Contact No.
                          </span>{' '}
                          <span style={{ color: 'black', marginLeft: '10px' }}>
                            {display.contact_no || ''}
                          </span>
                        </div>
                      </div>
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        Civil Status:
                      </span>{' '}
                      <span style={{ color: 'black', marginLeft: '10px' }}>
                        {display.civil_status || ''}
                      </span>
                      <br />
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        Remarks:
                      </span>{' '}
                      <span
                        style={{
                          color: 'black',
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        {display.remarks || ''}
                      </span>{' '}
                      <br />
                      <span
                        style={{
                          color: 'red', // Using theme orange
                          fontWeight: 'bold',
                          fontFamily: '"Times New Roman", serif',
                        }}
                      >
                        This certification is being issued upon request for
                      </span>{' '}
                      <span style={{ color: 'black' }}>
                        {display.request_reason || ''}
                      </span>
                    </div>
                  </div>

                  {/* Applicant Signature with QR Code */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '730px',
                      left: '50px',
                      width: '250px',
                      textAlign: 'center',
                      fontFamily: '"Times New Roman", serif',
                      fontSize: '12pt',
                      fontWeight: 'bold',
                    }}
                  >
                    <div
                      style={{
                        borderTop: '2px solid #000',
                        width: '65%',
                        margin: 'auto',
                      }}
                    ></div>
                    <div style={{ color: 'black', fontFamily: 'inherit' }}>
                      Applicant's Signature
                    </div>
                    <div
                      style={{
                        margin: '15px auto 0 auto',
                        width: '150px',
                        height: '75px',
                        border: '1px solid #000',
                      }}
                    ></div>

                    {/* QR Code */}
                    {qrCodeUrl && (
                      <div style={{ marginTop: '15px' }}>
                        <div
                          onClick={handleQrCodeClick}
                          style={{
                            cursor: 'pointer',
                            position: 'relative',
                            display: 'inline-block',
                          }}
                          title="Click to view certificate details"
                        >
                          <img
                            src={qrCodeUrl}
                            alt="Verification QR Code"
                            style={{
                              width: '150px',
                              height: '150px',
                              border: '2px solid #000',
                              padding: '5px',
                              background: '#fff',
                            }}
                          />
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(255,255,255,0)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: 0,
                              transition: 'opacity 0.3s',
                              borderRadius: '4px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.7';
                              e.currentTarget.style.backgroundColor =
                                'rgba(255,255,255,0.8)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '0';
                              e.currentTarget.style.backgroundColor =
                                'rgba(255,255,255,0)';
                            }}
                          >
                            <QrCodeIcon
                              sx={{
                                fontSize: 40,
                                color: theme.palette.success.main,
                              }}
                            />
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: '8pt',
                            color: '#666',
                            marginTop: '5px',
                            fontWeight: 'normal',
                          }}
                        >
                          {display.date_created
                            ? formatDateTimeDisplay(display.date_created)
                            : new Date().toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Punong Barangay */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '900px',
                      right: '100px',
                      width: '300px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        borderTop: '2.5px solid #000',
                        width: '90%',
                        margin: 'auto',
                      }}
                    ></div>
                    <img
                      src={WordName}
                      alt="Arnold Dondonayos"
                      style={{
                        position: 'absolute',
                        right: '20px',
                        width: '250px',
                        bottom: '33px',
                      }}
                    />

                    <div
                      style={{
                        fontFamily: '"Brush Script MT", cursive',
                        fontSize: '20pt',
                        color: '#000',
                        marginTop: '-2px',
                      }}
                    >
                      Punong Barangay
                    </div>
                  </div>
                </div>
              </Box>
            </Box>

            <style>
              {`
      @media print {
        body * {
          visibility: hidden;
        }
        #certificate-preview, #certificate-preview * {
          visibility: visible;
        }
        #certificate-preview {
          position: absolute;
          left: 0;
          top: 0;
          width: 8.5in;
          height: 11in;
          transform: none !important; /* Remove any transforms */
        }
        @page {
          size: portrait;
          margin: 0;
        }
        /* Ensure colors are preserved when printing */
        #certificate-preview * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    `}
            </style>
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
                    {editingId ? "Edit Certificate" : "New Barangay Clearance"}
                  </Typography>
                  {selectedRecord && !editingId && (
                    <Typography variant="body2" color="text.secondary">
                      Viewing: {selectedRecord.full_name}
                    </Typography>
                  )}
                </Paper>

                <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
                  <Stack spacing={3}>
                    <Autocomplete
                      options={residents}
                      getOptionLabel={(option) => option.full_name || ""}
                      value={residents.find((r) => r.full_name === formData.full_name) || null}
                      onChange={(e, nv) => {
                        if (nv) {
                          // Ensure date is properly formatted without timezone issues
                          const dobFormatted = nv.dob ? nv.dob.slice(0, 10) : '';
                          setFormData({
                            ...formData,
                            resident_id: nv.resident_id,
                            full_name: nv.full_name,
                            address: nv.address || '',
                            provincial_address: nv.provincial_address || '',
                            dob: dobFormatted,
                            age: nv.age ? String(nv.age) : '',
                            civil_status: nv.civil_status || 'Single',
                            contact_no: nv.contact_no || '',
                          });
                        } else {
                          setFormData({ ...formData, full_name: '' });
                        }
                      }}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          label="Full Name" 
                          variant="outlined" 
                          fullWidth 
                          size="small"
                          required
                        />
                      )}
                    />

                    <TextField 
                      label="Address" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      multiline 
                      rows={2}
                      value={formData.address} 
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                      required
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          label="Birthday" 
                          type="date" 
                          variant="outlined" 
                          fullWidth 
                          size="small"
                          InputLabelProps={{ shrink: true }} 
                          value={formData.dob} 
                          onChange={(e) => handleBirthdayChange(e.target.value)} 
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField 
                          label="Age" 
                          variant="outlined" 
                          fullWidth 
                          size="small"
                          value={formData.age} 
                          InputProps={{ readOnly: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              bgcolor: 'grey.100',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    <TextField 
                      label="Provincial Address" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      value={formData.provincial_address} 
                      onChange={(e) => setFormData({ ...formData, provincial_address: e.target.value })} 
                    />

                    <TextField 
                      label="Contact Number" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      placeholder="09XXXXXXXXX"
                      value={formData.contact_no} 
                      onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })} 
                    />

                    <FormControl fullWidth size="small">
                      <InputLabel>Civil Status</InputLabel>
                      <Select
                        value={formData.civil_status}
                        label="Civil Status"
                        onChange={(e) => setFormData({ ...formData, civil_status: e.target.value })}
                      >
                        {civilStatusOptions.map((status) => (
                          <MenuItem key={status} value={status}>
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField 
                      label="Remarks" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      multiline 
                      rows={2}
                      value={formData.remarks} 
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} 
                      required
                    />

                    <TextField 
                      label="Request Reason" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      multiline 
                      rows={2}
                      placeholder="Job application, School enrollment, etc."
                      value={formData.request_reason} 
                      onChange={(e) => setFormData({ ...formData, request_reason: e.target.value })} 
                      required
                    />

                    <TextField 
                      label="Date Issued" 
                      type="date" 
                      variant="outlined" 
                      fullWidth 
                      size="small"
                      InputLabelProps={{ shrink: true }} 
                      value={formData.date_issued} 
                      onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })} 
                      required
                    />

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
                    placeholder="Search by name, address, or contact no." 
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
                        <Card key={record.barangay_clearance_id} sx={{ 
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          borderLeft: 4,
                          borderColor: "primary.main",
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: "#000000" }}>
                                  {record.full_name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {record.address}
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
                                  <Chip 
                                    label={record.civil_status} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined" 
                                  />
                                  {record.contact_no && (
                                    <Typography variant="caption" color="text.secondary">
                                      {record.contact_no}
                                    </Typography>
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    Issued: {formatDateDisplay(record.date_issued)}
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
                                    onClick={() => handleDelete(record.barangay_clearance_id)} 
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
                    Format: BC-YYMMDD-XXX
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
                        <Card key={r.barangay_clearance_id} sx={{ 
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          borderLeft: 4,
                          borderColor: "secondary.main",
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, color: "#000000" }}>
                                  {r.full_name}
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
                                  {r.address}
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

      {/* QR Code Details Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={() => setQrDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          Certificate Details
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Certificate ID:
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {display.barangay_clearance_id || 'Draft (Not yet saved)'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Transaction Number:
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {display.transaction_number || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Full Name:
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                {display.full_name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Address:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.address}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Date of Birth:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.dob ? formatDateDisplay(display.dob) : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Age:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.age}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Civil Status:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.civil_status}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Remarks:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.remarks}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Request Reason:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.request_reason}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Date Issued:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {formatDateDisplay(display.date_issued)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Date Created:
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {display.date_created
                  ? formatDateTimeDisplay(display.date_created)
                  : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQrDialogOpen(false)} color="primary">
            Close
          </Button>
          {display.barangay_clearance_id && (
            <Button
              onClick={() => {
                const verificationUrl = `${window.location.origin}/verify-certificate?id=${display.barangay_clearance_id}`;
                window.open(verificationUrl, '_blank');
                setQrDialogOpen(false);
              }}
              variant="contained"
              color="primary"
            >
              Go to Verification Page
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
} 