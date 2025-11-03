import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  LinearProgress,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Badge,
  Alert,
  Stack,
  Tooltip,
  Fab,
  useTheme,
  alpha,
  Container
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Event as EventIcon,
  Notifications as NotificationsIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  LocalHospital as HealthIcon,
  School as EducationIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  Home as HomeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  FamilyRestroom as FamilyIcon,
  Elderly as ElderlyIcon,
  ChildCare as ChildIcon,
  Accessibility as AccessibilityIcon,
  BusinessCenter as BusinessIcon,
  MedicalServices as MedicalIcon,
  Gavel as GavelIcon,
  Campaign as CampaignIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  Visibility
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { School } from 'lucide-react';

const Home = () => {
  const { user, hasPermission } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const theme = useTheme();
  
  // Placeholder data that can be replaced with API calls
  const stats = {
    residents: 1250,
    households: 320,
    certificates: 485,
    activeCases: 12,
    healthCheckups: 78,
    jobSeekers: 45,
    seniorCitizens: 156,
    soloParents: 34,
    personsWithDisability: 23
  };

  // Calendar events data
  const calendarEvents = [
    { date: 5, title: 'Health Checkup', type: 'health' },
    { date: 8, title: 'Barangay Meeting', type: 'meeting' },
    { date: 12, title: 'Vaccination Drive', type: 'health' },
    { date: 15, title: 'Job Fair', type: 'work' },
    { date: 18, title: 'Senior Citizens Day', type: 'community' },
    { date: 22, title: 'Clean-up Drive', type: 'community' },
    { date: 25, title: 'Medical Mission', type: 'health' },
    { date: 28, title: 'Youth Sports Fest', type: 'community' }
  ];

  // Certificate data by age group
  const certificateByAge = [
    { age: '18-25', count: 85, percentage: 17.5 },
    { age: '26-35', count: 142, percentage: 29.3 },
    { age: '36-45', count: 108, percentage: 22.3 },
    { age: '46-55', count: 76, percentage: 15.7 },
    { age: '56-65', count: 48, percentage: 9.9 },
    { age: '65+', count: 26, percentage: 5.4 }
  ];

  // Certificate data by type
  const certificateByType = [
    { type: 'Barangay Clearance', count: 145, percentage: 29.9, icon: <GavelIcon /> },
    { type: 'Certificate of Residency', count: 98, percentage: 20.2, icon: <HomeIcon /> },
    { type: 'Certificate of Indigency', count: 76, percentage: 15.7, icon: <AssignmentIcon /> },
    { type: 'Business Clearance', count: 65, percentage: 13.4, icon: <BusinessIcon /> },
    { type: 'Job Seeker Certificate', count: 54, percentage: 11.1, icon: <WorkIcon /> },
    { type: 'Solo Parent Certificate', count: 32, percentage: 6.6, icon: <FamilyIcon /> }
  ];

  // Certificate data by purpose
  const certificateByPurpose = [
    { purpose: 'Employment', count: 168, percentage: 34.6, icon: <WorkIcon /> },
    { purpose: 'Business Permit', count: 92, percentage: 19.0, icon: <BusinessIcon /> },
    { purpose: 'School Requirements', count: 87, percentage: 17.9, icon: <School /> },
    { purpose: 'Government Services', count: 65, percentage: 13.4, icon: <GavelIcon /> },
    { purpose: 'Financial Assistance', count: 43, percentage: 8.9, icon: <AssessmentIcon /> },
    { purpose: 'Medical Services', count: 30, percentage: 6.2, icon: <MedicalIcon /> }
  ];

  const recentActivity = [
    { type: 'certificate', message: 'Barangay Clearance issued to Juan Dela Cruz', time: '2 hours ago', status: 'completed' },
    { type: 'resident', message: 'New resident registered: Maria Santos', time: '4 hours ago', status: 'completed' },
    { type: 'health', message: 'Health checkup conducted for 15 residents', time: '1 day ago', status: 'completed' },
    { type: 'announcement', message: 'Community meeting scheduled for next week', time: '2 days ago', status: 'upcoming' },
    { type: 'alert', message: 'Water interruption notice for Zone 3', time: '3 days ago', status: 'alert' }
  ];

  const upcomingEvents = [
    { title: 'Barangay Assembly', date: 'June 15, 2023', time: '9:00 AM', location: 'Barangay Hall', type: 'meeting', attendees: 120 },
    { title: 'Medical Mission', date: 'June 20, 2023', time: '8:00 AM', location: 'Health Center', type: 'health', attendees: 85 },
    { title: 'Job Fair', date: 'June 25, 2023', time: '10:00 AM', location: 'Community Center', type: 'work', attendees: 150 },
    { title: 'Senior Citizens Day', date: 'July 5, 2023', time: '1:00 PM', location: 'Multi-purpose Hall', type: 'community', attendees: 95 }
  ];

  const announcements = [
    { id: 1, title: 'Schedule of Water Supply', content: 'Water supply will be interrupted on June 10 from 9 AM to 5 PM for maintenance.', priority: 'high', date: 'June 5, 2023', views: 245 },
    { id: 2, title: 'New Barangay Ordinance', content: 'Implementation of waste segregation policy starting next month.', priority: 'medium', date: 'June 3, 2023', views: 189 },
    { id: 3, title: 'Community Clean-up Drive', content: 'Join us for our monthly clean-up drive this Saturday.', priority: 'low', date: 'June 1, 2023', views: 156 }
  ];

  const barangayOfficials = [
    { name: 'Juan Dela Cruz', position: 'Barangay Captain', avatar: 'JD', contact: '0912-345-6789', status: 'available' },
    { name: 'Maria Santos', position: 'Barangay Secretary', avatar: 'MS', contact: '0912-345-6790', status: 'available' },
    { name: 'Jose Reyes', position: 'Barangay Treasurer', avatar: 'JR', contact: '0912-345-6791', status: 'busy' },
    { name: 'Ana Garcia', position: 'SK Chairman', avatar: 'AG', contact: '0912-345-6792', status: 'available' }
  ];

  const services = [
    { name: 'Barangay Clearance', icon: <GavelIcon />, requests: 45, processing: 3, avgTime: 'Same Day' },
    { name: 'Certificate of Residency', icon: <HomeIcon />, requests: 32, processing: 2, avgTime: '1-2 Days' },
    { name: 'Business Permit', icon: <BusinessIcon />, requests: 18, processing: 1, avgTime: '3-5 Days' },
    { name: 'Health Services', icon: <MedicalIcon />, requests: 67, processing: 5, avgTime: 'By Appointment' }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'chairman': return 'primary';
      case 'staff': return 'success';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminIcon />;
      case 'chairman': return <PersonIcon />;
      case 'staff': return <PersonIcon />;
      default: return <PersonIcon />;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'certificate': return <AssignmentIcon color="primary" />;
      case 'resident': return <PeopleIcon color="success" />;
      case 'health': return <HealthIcon color="error" />;
      case 'announcement': return <NotificationsIcon color="info" />;
      case 'alert': return <WarningIcon color="warning" />;
      default: return <InfoIcon />;
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'meeting': return <PeopleIcon />;
      case 'health': return <HealthIcon />;
      case 'work': return <WorkIcon />;
      case 'community': return <HomeIcon />;
      default: return <EventIcon />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'health': return '#E9762B';
      case 'meeting': return '#41644A';
      case 'work': return '#0D4715';
      case 'community': return '#41644A';
      default: return '#41644A';
    }
  };

  const quickActions = [
    {
      title: 'Add Resident',
      description: 'Register a new resident',
      icon: <AddIcon />,
      permission: 'manage_residents',
      action: () => window.location.href = '/residents?action=add'
    },
    {
      title: 'Issue Certificate',
      description: 'Create a new certificate',
      icon: <AssignmentIcon />,
      permission: 'manage_certificates',
      action: () => window.location.href = '/certificates?action=new'
    },
    {
      title: 'Schedule Event',
      description: 'Create a new event',
      icon: <CalendarIcon />,
      permission: 'manage_events',
      action: () => window.location.href = '/events?action=new'
    },
    {
      title: 'Send Announcement',
      description: 'Create an announcement',
      icon: <CampaignIcon />,
      permission: 'manage_announcements',
      action: () => window.location.href = '/announcements?action=new'
    }
  ].filter(action => hasPermission(action.permission));

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Calendar functions
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<Box key={`empty-${i}`} sx={{ height: 32 }} />);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const hasEvent = calendarEvents.some(event => event.date === day);
      const event = calendarEvents.find(event => event.date === day);
      const isToday = new Date().getDate() === day && 
                     new Date().getMonth() === currentMonth.getMonth() && 
                     new Date().getFullYear() === currentMonth.getFullYear();
      
      days.push(
        <Box
          key={day}
          sx={{
            height: 32,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            backgroundColor: isToday ? alpha('#E9762B', 0.2) : 'transparent',
            border: isToday ? `1px solid #E9762B` : '1px solid transparent',
            cursor: 'pointer',
            position: 'relative',
            '&:hover': {
              backgroundColor: alpha('#41644A', 0.1)
            }
          }}
        >
          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
            {day}
          </Typography>
          {hasEvent && (
            <Box
              sx={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                backgroundColor: getEventColor(event.type),
                position: 'absolute',
                bottom: 4
              }}
            />
          )}
        </Box>
      );
    }
    
    return days;
  };

  // Custom Stat Card Component
  const StatCard = ({ title, value, icon, color, trend, subtitle }) => (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        background: color === 'primary' 
          ? 'linear-gradient(135deg, rgba(65, 100, 74, 0.9) 0%, rgba(13, 71, 21, 0.9) 100%)'
          : 'linear-gradient(135deg, rgba(233, 118, 43, 0.9) 0%, rgba(212, 104, 31, 0.9) 100%)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.12)'
        }
      }}
    >
      <CardContent sx={{ pb: 1.5, pt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: '#F1F0E9' }}>
              {value}
            </Typography>
            <Typography variant="body2" color="#F1F0E9" sx={{ mb: 0.5, opacity: 0.9 }}>
              {title}
            </Typography>
            <Typography variant="caption" color="#F1F0E9" sx={{ opacity: 0.8 }}>
              {subtitle}
            </Typography>
          </Box>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 48, 
            height: 48, 
            borderRadius: '50%',
            backgroundColor: 'rgba(241, 240, 233, 0.2)',
            color: '#F1F0E9'
          }}>
            {icon}
          </Box>
        </Box>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1.5 }}>
            <TrendingUpIcon sx={{ fontSize: '0.9rem', mr: 0.5, color: '#F1F0E9' }} />
            <Typography variant="caption" color="#F1F0E9" sx={{ opacity: 0.9 }}>
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // Custom Certificate Type Card
  const CertificateTypeCard = ({ type, count, percentage, icon }) => (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 2,
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardContent sx={{ pb: 1.5, pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 36, 
            height: 36, 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
            color: '#F1F0E9',
            mr: 1.5
          }}>
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="caption" color="#0D4715">
              {type}
            </Typography>
            <Typography variant="h6" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
              {count}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#E9762B', fontWeight: 'bold' }}>
            {percentage}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          sx={{ 
            height: 5, 
            borderRadius: 3,
            backgroundColor: alpha('#41644A', 0.2),
            '& .MuiLinearProgress-bar': { 
              background: 'linear-gradient(90deg, #41644A 0%, #0D4715 100%)',
              borderRadius: 3
            }
          }} 
        />
      </CardContent>
    </Card>
  );

  // Custom Purpose Card
  const PurposeCard = ({ purpose, count, percentage, icon }) => (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 2,
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardContent sx={{ pb: 1.5, pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 36, 
            height: 36, 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E9762B 0%, #d4681f 100%)',
            color: '#F1F0E9',
            mr: 1.5
          }}>
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="caption" color="#0D4715">
              {purpose}
            </Typography>
            <Typography variant="h6" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
              {count}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#E9762B', fontWeight: 'bold' }}>
            {percentage}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={percentage} 
          sx={{ 
            height: 5, 
            borderRadius: 3,
            backgroundColor: alpha('#E9762B', 0.2),
            '& .MuiLinearProgress-bar': { 
              background: 'linear-gradient(90deg, #E9762B 0%, #d4681f 100%)',
              borderRadius: 3
            }
          }} 
        />
      </CardContent>
    </Card>
  );

  // Custom Event Card
  const EventCard = ({ event }) => (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 2,
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.08)'
        }
      }}
    >
      <Box sx={{ 
        height: 6, 
        background: event.type === 'meeting' 
          ? 'linear-gradient(90deg, #41644A 0%, #0D4715 100%)'
          : event.type === 'health'
          ? 'linear-gradient(90deg, #E9762B 0%, #d4681f 100%)'
          : 'linear-gradient(90deg, #41644A 0%, #0D4715 100%)'
      }} />
      <CardContent sx={{ pb: 1.5, pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 36, 
            height: 36, 
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
            color: '#F1F0E9',
            mr: 1.5
          }}>
            {getEventIcon(event.type)}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body1" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
              {event.title}
            </Typography>
            <Typography variant="caption" color="#0D4715">
              {event.date} at {event.time}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <LocationIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: '#41644A' }} />
          <Typography variant="caption" color="#0D4715">
            {event.location}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ fontSize: '0.8rem', mr: 0.5, color: '#41644A' }} />
            <Typography variant="caption" color="#0D4715">
              {event.attendees} attending
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            size="small" 
            sx={{ 
              borderColor: '#41644A', 
              color: '#41644A',
              fontSize: '0.7rem',
              py: 0.3,
              '&:hover': { 
                borderColor: '#0D4715', 
                backgroundColor: alpha('#41644A', 0.05) 
              } 
            }}
          >
            View
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Custom Official Card
  const OfficialCard = ({ official }) => (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 2,
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', pb: 1.5, pt: 2 }}>
        <Badge 
          overlap="circular" 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Box sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: official.status === 'available' ? '#4CAF50' : '#FF9800',
              border: '2px solid white'
            }} />
          }
        >
          <Avatar sx={{ 
            width: 56, 
            height: 56, 
            mx: 'auto', 
            mb: 1,
            background: 'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
            color: '#F1F0E9'
          }}>
            {official.avatar}
          </Avatar>
        </Badge>
        <Typography variant="body1" sx={{ color: '#0D4715', mb: 0.5 }}>
          {official.name}
        </Typography>
        <Typography variant="caption" color="#41644A" sx={{ mb: 1, display: 'block' }}>
          {official.position}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
          <IconButton size="small" sx={{ color: '#41644A', p: 0.5 }}>
            <PhoneIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" sx={{ color: '#41644A', p: 0.5 }}>
            <EmailIcon fontSize="small" />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  // Custom Announcement Card
  const AnnouncementCard = ({ announcement }) => (
    <Card 
      sx={{ 
        height: '100%', 
        borderRadius: 2,
        transition: 'all 0.3s ease',
        background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 12px rgba(0,0,0,0.08)'
        }
      }}
    >
      <CardContent sx={{ pb: 1.5, pt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Chip 
            label={announcement.priority.toUpperCase()} 
            color={getPriorityColor(announcement.priority)}
            size="small"
            sx={{ fontSize: '0.6rem', height: 20 }}
          />
          <Typography variant="caption" color="#0D4715">
            {announcement.date}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ color: '#0D4715', mb: 1 }}>
          {announcement.title}
        </Typography>
        <Typography variant="caption" color="#0D4715" sx={{ mb: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {announcement.content}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Visibility sx={{ fontSize: '0.8rem', mr: 0.5, color: '#41644A' }} />
            <Typography variant="caption" color="#0D4715">
              {announcement.views} views
            </Typography>
          </Box>
          <Button 
            variant="text" 
            size="small" 
            sx={{ 
              color: '#41644A',
              fontSize: '0.7rem',
              p: 0,
              minWidth: 'auto',
              '&:hover': { 
                backgroundColor: alpha('#41644A', 0.05) 
              } 
            }}
          >
            Read More
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  // Calendar Component
  const CalendarWidget = () => (
    <Paper sx={{ 
      p: 2, 
      borderRadius: 2, 
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
      height: '100%',
      background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Typography>
        <Box sx={{ display: 'flex' }}>
          <IconButton size="small" onClick={handlePrevMonth} sx={{ color: '#41644A' }}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleNextMonth} sx={{ color: '#41644A' }}>
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Typography key={day} variant="caption" sx={{ color: '#41644A', fontWeight: 'bold', fontSize: '0.7rem' }}>
            {day}
          </Typography>
        ))}
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {renderCalendarDays()}
      </Box>
      
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ color: '#0D4715', fontWeight: 'bold', mb: 1 }}>
          Upcoming Events
        </Typography>
        <List sx={{ p: 0 }}>
          {calendarEvents.slice(0, 3).map((event, index) => (
            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: getEventColor(event.type),
                mr: 1
              }} />
              <ListItemText 
                primary={`${event.date} - ${event.title}`}
                primaryTypographyProps={{ variant: 'caption', color: '#0D4715' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ 
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #F1F0E9 0%, #E8E7E0 100%)',
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid rgba(65, 100, 74, 0.1)',
        background: 'linear-gradient(90deg, rgba(65, 100, 74, 0.05) 0%, rgba(13, 71, 21, 0.1) 100%)'
      }}>
        <Box>
          <Typography variant="h5" component="h1" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
            Welcome back, {user?.name}!
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              icon={getRoleIcon(user?.role)}
              label={user?.role?.toUpperCase()}
              color={getRoleColor(user?.role)}
              variant="outlined"
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            <Typography variant="caption" color="#0D4715">
              Barangay 145 Management System
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<NotificationsIcon />}
            size="small"
            sx={{ 
              background: 'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
              '&:hover': { 
                background: 'linear-gradient(135deg, #0D4715 0%, #41644A 100%)',
              },
              borderRadius: 2
            }}
          >
            Notifications
            <Badge badgeContent={3} color="error" sx={{ ml: 1 }} />
          </Button>
        </Box>
      </Box>

      {/* Alert Section */}
      <Box sx={{ px: 2, py: 1 }}>
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ 
            background: 'linear-gradient(90deg, rgba(65, 100, 74, 0.1) 0%, rgba(13, 71, 21, 0.2) 100%)',
            color: '#0D4715',
            '& .MuiAlert-icon': { color: '#41644A' },
            py: 0.5
          }}
        >
          <Typography variant="caption">
            <strong>System Update:</strong> New features have been added to improve certificate processing.
          </Typography>
        </Alert>
      </Box>

      {/* Tabs for different sections */}
      <Box sx={{ px: 2, py: 1 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            '& .MuiTab-root': { 
              color: '#41644A', 
              fontWeight: 'bold',
              fontSize: '0.8rem',
              py: 0.5,
              px: 1,
              minHeight: 'auto',
              '&.Mui-selected': { color: '#0D4715' }
            },
            '& .MuiTabs-indicator': { 
              background: 'linear-gradient(90deg, #E9762B 0%, #d4681f 100%)',
              height: 3
            }
          }}
        >
          <Tab label="Dashboard" />
          <Tab label="Certificate Analytics" />
          <Tab label="Services" />
          <Tab label="Events" />
          <Tab label="Officials" />
          <Tab label="Announcements" />
        </Tabs>
      </Box>

      {/* Tab Content - Full Height Container */}
      <Box sx={{ 
        flexGrow: 1, 
        overflow: 'auto',
        px: 2,
        pb: 2
      }}>
        {tabValue === 0 && (
          <Grid container spacing={2}>
            {/* Main Stats Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Total Residents" 
                value={stats.residents} 
                icon={<PeopleIcon />}
                color="primary"
                trend="5% increase from last month"
                subtitle="Registered in the system"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Certificates Issued" 
                value={stats.certificates} 
                icon={<AssignmentIcon />}
                color="secondary"
                trend="12% increase from last month"
                subtitle="Total certificates created"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Households" 
                value={stats.households} 
                icon={<HomeIcon />}
                color="primary"
                trend="3% increase from last month"
                subtitle="Registered households"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard 
                title="Health Checkups" 
                value={stats.healthCheckups} 
                icon={<HealthIcon />}
                color="secondary"
                trend="8% increase from last month"
                subtitle="This month"
              />
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                height: '100%',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 2 }}>
                  Quick Actions
                </Typography>
                <Grid container spacing={1.5}>
                  {quickActions.map((action, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.7) 0%, rgba(241, 240, 233, 0.5) 100%)',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 6px 12px rgba(0,0,0,0.08)'
                          }
                        }}
                        onClick={action.action}
                      >
                        <CardContent sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
                              color: '#F1F0E9',
                              mr: 1.5
                            }}>
                              {action.icon}
                            </Box>
                            <Typography variant="body1" sx={{ color: '#0D4715' }}>
                              {action.title}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="#0D4715">
                            {action.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Calendar Widget */}
            <Grid item xs={12} md={4}>
              <CalendarWidget />
            </Grid>

            {/* Demographics Summary */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                height: '100%',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 2 }}>
                  Community Demographics
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}>
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" color="#0D4715">Senior Citizens</Typography>
                        <Typography variant="caption" fontWeight="bold" color="#0D4715">{stats.seniorCitizens}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stats.seniorCitizens / stats.residents) * 100} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: alpha('#41644A', 0.2),
                          '& .MuiLinearProgress-bar': { 
                            background: 'linear-gradient(90deg, #41644A 0%, #0D4715 100%)',
                          }
                        }} 
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" color="#0D4715">Solo Parents</Typography>
                        <Typography variant="caption" fontWeight="bold" color="#0D4715">{stats.soloParents}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stats.soloParents / stats.residents) * 100} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: alpha('#E9762B', 0.2),
                          '& .MuiLinearProgress-bar': { 
                            background: 'linear-gradient(90deg, #E9762B 0%, #d4681f 100%)',
                          }
                        }} 
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" color="#0D4715">Job Seekers</Typography>
                        <Typography variant="caption" fontWeight="bold" color="#0D4715">{stats.jobSeekers}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stats.jobSeekers / stats.residents) * 100} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: alpha('#41644A', 0.2),
                          '& .MuiLinearProgress-bar': { 
                            background: 'linear-gradient(90deg, #41644A 0%, #0D4715 100%)',
                          }
                        }} 
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                        <Typography variant="caption" color="#0D4715">PWD</Typography>
                        <Typography variant="caption" fontWeight="bold" color="#0D4715">{stats.personsWithDisability}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(stats.personsWithDisability / stats.residents) * 100} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: alpha('#E9762B', 0.2),
                          '& .MuiLinearProgress-bar': { 
                            background: 'linear-gradient(90deg, #E9762B 0%, #d4681f 100%)',
                          }
                        }} 
                      />
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ 
                  mt: 1.5, 
                  p: 1.5, 
                  background: 'linear-gradient(90deg, rgba(65, 100, 74, 0.1) 0%, rgba(13, 71, 21, 0.2) 100%)', 
                  borderRadius: 2 
                }}>
                  <Typography variant="caption" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
                    Community Insights
                  </Typography>
                  <Typography variant="caption" color="#0D4715" sx={{ display: 'block' }}>
                    Based on current demographics, employment assistance and senior citizen programs are priority services.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Recent Activity */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                height: '100%',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 2 }}>
                  Recent Activity
                </Typography>
                <List sx={{ p: 0 }}>
                  {recentActivity.map((activity, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0, py: 0.8 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {getActivityIcon(activity.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.message}
                          primaryTypographyProps={{ variant: 'body2', color: '#0D4715' }}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.3 }}>
                              <TimeIcon sx={{ fontSize: '0.7rem', mr: 0.3, color: '#41644A' }} />
                              <Typography variant="caption" color="#41644A">{activity.time}</Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentActivity.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 1 && (
          <Grid container spacing={2}>
            {/* Certificate Analytics Header */}
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 1 }}>
                  Certificate Analytics & Demographics
                </Typography>
                <Typography variant="caption" color="#0D4715">
                  Understanding certificate patterns helps optimize barangay services and resource allocation.
                </Typography>
              </Paper>
            </Grid>

            {/* Certificate by Age Group */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                height: '100%',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 2 }}>
                  Certificate Requests by Age Group
                </Typography>
                <Box sx={{ height: 200, position: 'relative' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-end', height: 150, gap: 1 }}>
                    {certificateByAge.map((item, index) => (
                      <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: '100%', 
                          height: `${(item.count / 142) * 100}%`, 
                          background: index === 1 
                            ? 'linear-gradient(180deg, #E9762B 0%, #d4681f 100%)'
                            : 'linear-gradient(180deg, #41644A 0%, #0D4715 100%)',
                          borderRadius: '4px 4px 0 0',
                          position: 'relative',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 5px 15px rgba(13, 71, 21, 0.3)'
                          }
                        }}>
                          <Tooltip title={`${item.age}: ${item.count} requests (${item.percentage}%)`}>
                            <Box sx={{ 
                              position: 'absolute', 
                              top: -20, 
                              left: 0, 
                              right: 0, 
                              textAlign: 'center',
                              fontSize: '10px',
                              fontWeight: 'bold',
                              color: '#0D4715'
                            }}>
                              {item.count}
                            </Box>
                          </Tooltip>
                        </Box>
                        <Typography variant="caption" sx={{ mt: 0.5, textAlign: 'center', color: '#0D4715' }}>
                          {item.age}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ 
                    mt: 1.5, 
                    p: 1.5, 
                    background: 'linear-gradient(90deg, rgba(65, 100, 74, 0.1) 0%, rgba(13, 71, 21, 0.2) 100%)', 
                    borderRadius: 2 
                  }}>
                    <Typography variant="caption" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
                      Key Insight
                    </Typography>
                    <Typography variant="caption" color="#0D4715" sx={{ display: 'block' }}>
                      The 26-35 age group has the highest certificate requests (29.3%), primarily for employment purposes.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Certificate by Type */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                height: '100%',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 2 }}>
                  Certificate Requests by Type
                </Typography>
                <Grid container spacing={1.5}>
                  {certificateByType.map((item, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <CertificateTypeCard 
                        type={item.type}
                        count={item.count}
                        percentage={item.percentage}
                        icon={item.icon}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ 
                  mt: 1.5, 
                  p: 1.5, 
                  background: 'linear-gradient(90deg, rgba(233, 118, 43, 0.1) 0%, rgba(212, 104, 31, 0.2) 100%)', 
                  borderRadius: 2 
                }}>
                  <Typography variant="caption" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
                    Service Recommendation
                  </Typography>
                  <Typography variant="caption" color="#0D4715" sx={{ display: 'block' }}>
                    Barangay Clearance is the most requested certificate. Consider streamlining this process.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Certificate by Purpose */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                height: '100%',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 2 }}>
                  Certificate Requests by Purpose
                </Typography>
                <Grid container spacing={1.5}>
                  {certificateByPurpose.map((item, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <PurposeCard 
                        purpose={item.purpose}
                        count={item.count}
                        percentage={item.percentage}
                        icon={item.icon}
                      />
                    </Grid>
                  ))}
                </Grid>
                <Box sx={{ 
                  mt: 1.5, 
                  p: 1.5, 
                  background: 'linear-gradient(90deg, rgba(65, 100, 74, 0.1) 0%, rgba(13, 71, 21, 0.2) 100%)', 
                  borderRadius: 2 
                }}>
                  <Typography variant="caption" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
                    Community Need
                  </Typography>
                  <Typography variant="caption" color="#0D4715" sx={{ display: 'block' }}>
                    Employment is the primary reason for certificate requests (34.6%). Consider partnering with local businesses.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Certificate Processing Time */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                height: '100%',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 2 }}>
                  Certificate Processing Time
                </Typography>
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                    <Typography variant="caption" color="#0D4715">Barangay Clearance</Typography>
                    <Typography variant="caption" fontWeight="bold" color="#0D4715">Same Day</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={100} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: alpha('#41644A', 0.2),
                      '& .MuiLinearProgress-bar': { 
                        background: 'linear-gradient(90deg, #41644A 0%, #0D4715 100%)',
                      }
                    }} 
                  />
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                    <Typography variant="caption" color="#0D4715">Certificate of Residency</Typography>
                    <Typography variant="caption" fontWeight="bold" color="#0D4715">1-2 Days</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={80} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: alpha('#41644A', 0.2),
                      '& .MuiLinearProgress-bar': { 
                        background: 'linear-gradient(90deg, #41644A 0%, #0D4715 100%)',
                      }
                    }} 
                  />
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                    <Typography variant="caption" color="#0D4715">Certificate of Indigency</Typography>
                    <Typography variant="caption" fontWeight="bold" color="#0D4715">2-3 Days</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={60} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: alpha('#E9762B', 0.2),
                      '& .MuiLinearProgress-bar': { 
                        background: 'linear-gradient(90deg, #E9762B 0%, #d4681f 100%)',
                      }
                    }} 
                  />
                </Box>
                <Box sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                    <Typography variant="caption" color="#0D4715">Business Clearance</Typography>
                    <Typography variant="caption" fontWeight="bold" color="#0D4715">3-5 Days</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={40} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      backgroundColor: alpha('#E9762B', 0.2),
                      '& .MuiLinearProgress-bar': { 
                        background: 'linear-gradient(90deg, #E9762B 0%, #d4681f 100%)',
                      }
                    }} 
                  />
                </Box>
                <Box sx={{ 
                  mt: 1.5, 
                  p: 1.5, 
                  background: 'linear-gradient(90deg, rgba(65, 100, 74, 0.1) 0%, rgba(13, 71, 21, 0.2) 100%)', 
                  borderRadius: 2 
                }}>
                  <Typography variant="caption" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
                    Efficiency Metric
                  </Typography>
                  <Typography variant="caption" color="#0D4715" sx={{ display: 'block' }}>
                    Average Processing Time: 2.3 Days (Based on the last 100 certificates)
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 2 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 2 }}>
                  Barangay Services
                </Typography>
                <Grid container spacing={2}>
                  {services.map((service, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card sx={{ 
                        height: '100%', 
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.7) 0%, rgba(241, 240, 233, 0.5) 100%)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 12px rgba(0,0,0,0.08)'
                        }
                      }}>
                        <CardContent sx={{ py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              width: 40, 
                              height: 40, 
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
                              color: '#F1F0E9',
                              mr: 1.5
                            }}>
                              {service.icon}
                            </Box>
                            <Typography variant="body1" sx={{ color: '#0D4715' }}>
                              {service.name}
                            </Typography>
                          </Box>
                          <Box sx={{ mb: 1.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                              <Typography variant="caption" color="#0D4715">Total Requests</Typography>
                              <Typography variant="caption" fontWeight="bold" color="#0D4715">{service.requests}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                              <Typography variant="caption" color="#0D4715">Processing</Typography>
                              <Typography variant="caption" fontWeight="bold" color="#E9762B">{service.processing}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                              <Typography variant="caption" color="#0D4715">Avg. Time</Typography>
                              <Typography variant="caption" fontWeight="bold" color="#0D4715">{service.avgTime}</Typography>
                            </Box>
                          </Box>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            fullWidth 
                            sx={{ 
                              borderColor: '#41644A', 
                              color: '#41644A',
                              fontSize: '0.7rem',
                              py: 0.3,
                              '&:hover': { 
                                borderColor: '#0D4715', 
                                backgroundColor: alpha('#41644A', 0.05) 
                              } 
                            }}
                          >
                            View Details
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 3 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
                    Upcoming Events
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #0D4715 0%, #41644A 100%)',
                      },
                      borderRadius: 2
                    }}
                  >
                    Add Event
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {upcomingEvents.map((event, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <EventCard event={event} />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 4 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Typography variant="h6" gutterBottom sx={{ color: '#0D4715', fontWeight: 'bold', mb: 2 }}>
                  Barangay Officials
                </Typography>
                <Grid container spacing={2}>
                  {barangayOfficials.map((official, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <OfficialCard official={official} />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {tabValue === 5 && (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper sx={{ 
                p: 2, 
                borderRadius: 2, 
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                background: 'linear-gradient(135deg, rgba(241, 240, 233, 0.9) 0%, rgba(241, 240, 233, 0.7) 100%)'
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#0D4715', fontWeight: 'bold' }}>
                    Announcements
                  </Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{ 
                      background: 'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
                      '&:hover': { 
                        background: 'linear-gradient(135deg, #0D4715 0%, #41644A 100%)',
                      },
                      borderRadius: 2
                    }}
                  >
                    Add Announcement
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {announcements.map((announcement, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <AnnouncementCard announcement={announcement} />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="refresh"
        size="small"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          background: 'linear-gradient(135deg, #41644A 0%, #0D4715 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0D4715 0%, #41644A 100%)',
          }
        }}
      >
        <RefreshIcon fontSize="small" />
      </Fab>
    </Box>
  );
};

export default Home;