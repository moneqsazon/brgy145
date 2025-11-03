import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Collapse,
  IconButton,
  Divider,
  Tooltip,
  Backdrop
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Menu as MenuIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { ChartBarIcon, ChartPieIcon, PieChartIcon } from 'lucide-react';

const drawerWidth = 250;

export default function Sidebar() {
  const { user, hasPermission } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [certOpen, setCertOpen] = useState(location.pathname.startsWith('/certificates'));

  const toggleMobile = () => setMobileOpen(!mobileOpen);

  const navItems = [
    { path: '/home', label: 'Home', icon: <HomeIcon />, permission: 'view_dashboard' },
    { path: '/residents', label: 'Residents', icon: <PeopleIcon />, permission: 'manage_residents' },
    { path: '/reports', label: 'Reports', icon: <ChartBarIcon />, permission: 'manage_residents' },
    {
      path: '/certificates',
      label: 'Certificates',
      icon: <AssignmentIcon />,
      permission: 'manage_certificates',
      children: [
        { path: '/certification-action', label: 'Certificate of Action', icon: <AssignmentIcon /> },
        { path: '/indigency', label: 'Indigency', icon: <AssignmentIcon /> },
        { path: '/barangay-clearance', label: 'Barangay Clearance', icon: <AssignmentIcon /> },
        { path: '/oath-job-seeker', label: 'Oath Job Seeker', icon: <AssignmentIcon /> },
        { path: '/solo-parent-form', label: 'Solo Parent', icon: <AssignmentIcon /> },
        { path: '/business-clearance', label: 'Business Clearance', icon: <AssignmentIcon /> },
        { path: '/certificate-residency', label: 'Certificate of Residency', icon: <AssignmentIcon /> },
        { path: '/permit-to-travel', label: 'Permit To Travel', icon: <AssignmentIcon /> },
        { path: '/cash-assistance', label: 'Cash Assistance', icon: <AssignmentIcon /> },
        { path: '/cohabitation', label: 'Cohabitation', icon: <AssignmentIcon /> },
        { path: '/financial-assistance', label: 'Financial Assistance', icon: <AssignmentIcon /> },
        { path: '/bhert-cert-positive', label: 'Bhert Certificate Positive', icon: <AssignmentIcon /> },
        { path: '/bhert-cert-normal', label: 'Bhert Certificate Normal', icon: <AssignmentIcon /> },
      ]
    },
    { path: '/users', label: 'Users', icon: <SettingsIcon />, permission: 'manage_users' }
  ].filter(item => hasPermission(item.permission));

  const drawerContent = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
      background: 'linear-gradient(180deg, #0D4715 0%, #1a5f2e 40%, #0D2818 100%)',
      color: '#F1F0E9',
      pt: 8,
      borderTopRightRadius: 38,
      borderBottomRightRadius: 38,
      boxShadow: '0 20px 60px rgba(13, 71, 21, 0.4), 0 0 0 1px rgba(241, 240, 233, 0.1)',
      overflowX: 'hidden',
      overflowY: 'auto',
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'linear-gradient(90deg, transparent, rgba(233, 118, 43, 0.6), transparent)',
        boxShadow: '0 0 20px rgba(233, 118, 43, 0.3)',
      }
    }}>
      {/* Profile Section */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 3,
        pb: 2,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 20,
          right: 20,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(241, 240, 233, 0.2), transparent)',
        }
      }}>
        <Avatar sx={{ 
          bgcolor: 'rgba(65, 100, 74, 0.8)', 
          color: '#F1F0E9', 
          width: 54, 
          height: 54,
          border: '2px solid rgba(233, 118, 43, 0.3)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}>
          <AccountCircleIcon sx={{ fontSize: 38 }} />
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ 
            opacity: 0.7, 
            color: '#F1F0E9', 
            letterSpacing: 1.5, 
            fontSize: 12, 
            fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
            textTransform: 'uppercase',
            fontWeight: 500
          }}>Profile</Typography>
          <Typography variant="h6" sx={{ 
            fontWeight: 700, 
            color: '#F1F0E9', 
            fontSize: 18, 
            fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          }}>{user?.name || 'Guest'}</Typography>
        </Box>
      </Box>

      <List sx={{ p: 0, mt: 3 }}>
        {navItems.map(item => {
          const isActive = location.pathname === item.path && !item.children;
          return (
            <Box key={item.path}>
              <Tooltip title={item.label} placement="right" arrow>
                <ListItemButton
                  component={item.children ? 'button' : Link}
                  to={item.children ? undefined : item.path}
                  onClick={() => {
                    if (item.children) setCertOpen(!certOpen);
                    if (!item.children) setMobileOpen(false);
                  }}
                  sx={{
                    color: '#F1F0E9',
                    borderRadius: 3,
                    mx: 2,
                    my: 0.5,
                    fontWeight: 500,
                    fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
                    fontSize: 15,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    background: isActive 
                      ? 'linear-gradient(90deg, rgba(65, 100, 74, 0.6) 0%, rgba(65, 100, 74, 0.3) 100%)' 
                      : 'transparent',
                    '&:hover': {
                      background: isActive 
                        ? 'linear-gradient(90deg, rgba(65, 100, 74, 0.7) 0%, rgba(65, 100, 74, 0.4) 100%)'
                        : 'linear-gradient(90deg, rgba(65, 100, 74, 0.2) 0%, rgba(65, 100, 74, 0.1) 100%)',
                      transform: 'translateX(3px)',
                      '& .sidebar-icon': {
                        background: 'linear-gradient(135deg, #E9762B 0%, #d4681f 100%)',
                        color: '#F1F0E9',
                        boxShadow: '0 4px 12px rgba(233, 118, 43, 0.4)',
                      },
                    },
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 4,
                      height: isActive ? '70%' : 0,
                      bgcolor: '#E9762B',
                      borderRadius: '0 4px 4px 0',
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 0 10px rgba(233, 118, 43, 0.5)' : 'none',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: 'inherit', 
                    minWidth: 42,
                    position: 'relative',
                  }}>
                    <Box className="sidebar-icon" sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isActive 
                        ? 'linear-gradient(135deg, #E9762B 0%, #d4681f 100%)'
                        : 'rgba(241, 240, 233, 0.1)',
                      color: isActive ? '#F1F0E9' : '#F1F0E9',
                      width: 38, 
                      height: 38, 
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                      boxShadow: isActive 
                        ? '0 4px 12px rgba(233, 118, 43, 0.4)' 
                        : '0 2px 8px rgba(0, 0, 0, 0.2)',
                      border: isActive ? '1px solid rgba(233, 118, 43, 0.3)' : '1px solid transparent',
                    }}>
                      {item.icon}
                    </Box>
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    sx={{ 
                      '& .MuiListItemText-primary': {
                        fontWeight: isActive ? 600 : 500,
                        fontSize: 15,
                        fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
                        color: isActive ? '#F1F0E9' : 'rgba(241, 240, 233, 0.9)',
                      }
                    }} 
                  />
                  {item.children ? (certOpen ? <ExpandLessIcon sx={{ color: 'rgba(241, 240, 233, 0.7)' }} /> : <ExpandMoreIcon sx={{ color: 'rgba(241, 240, 233, 0.7)' }} />) : null}
                </ListItemButton>
              </Tooltip>
              {item.children && (
                <Collapse in={certOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map(child => {
                      const childActive = location.pathname === child.path;
                      return (
                        <Tooltip title={child.label} placement="right" arrow key={child.path}>
                          <ListItemButton
                            component={Link}
                            to={child.path}
                            onClick={() => setMobileOpen(false)}
                            sx={{
                              pl: 7,
                              color: '#F1F0E9',
                              borderRadius: 2,
                              mx: 2.5,
                              my: 0.25,
                              fontWeight: 400,
                              fontSize: 14,
                              fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
                              position: 'relative',
                              overflow: 'hidden',
                              transition: 'all 0.3s ease',
                              background: childActive 
                                ? 'linear-gradient(90deg, rgba(65, 100, 74, 0.4) 0%, rgba(65, 100, 74, 0.2) 100%)'
                                : 'transparent',
                              '&:hover': {
                                background: childActive 
                                  ? 'linear-gradient(90deg, rgba(65, 100, 74, 0.5) 0%, rgba(65, 100, 74, 0.3) 100%)'
                                  : 'linear-gradient(90deg, rgba(65, 100, 74, 0.15) 0%, rgba(65, 100, 74, 0.05) 100%)',
                                transform: 'translateX(2px)',
                                '& .sidebar-icon': {
                                  background: 'linear-gradient(135deg, #E9762B 0%, #d4681f 100%)',
                                  color: '#F1F0E9',
                                },
                              },
                              '&:before': {
                                content: '""',
                                position: 'absolute',
                                left: 0,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: 3,
                                height: childActive ? '60%' : 0,
                                bgcolor: '#E9762B',
                                borderRadius: '0 3px 3px 0',
                                transition: 'all 0.3s ease',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ 
                              color: 'inherit', 
                              minWidth: 36,
                              position: 'relative',
                            }}>
                              <Box className="sidebar-icon" sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: childActive 
                                  ? 'linear-gradient(135deg, #E9762B 0%, #d4681f 100%)'
                                  : 'rgba(241, 240, 233, 0.08)',
                                color: childActive ? '#F1F0E9' : 'rgba(241, 240, 233, 0.8)',
                                width: 32, 
                                height: 32, 
                                borderRadius: '10px',
                                transition: 'all 0.3s ease',
                                boxShadow: childActive 
                                  ? '0 3px 10px rgba(233, 118, 43, 0.3)' 
                                  : '0 2px 6px rgba(0, 0, 0, 0.15)',
                              }}>
                                {child.icon}
                              </Box>
                            </ListItemIcon>
                            <ListItemText 
                              primary={child.label} 
                              sx={{ 
                                '& .MuiListItemText-primary': {
                                  fontWeight: childActive ? 500 : 400,
                                  fontSize: 14,
                                  fontFamily: `'Inter', 'Roboto', 'Segoe UI', 'system-ui', Arial, sans-serif`,
                                  color: childActive ? '#F1F0E9' : 'rgba(241, 240, 233, 0.8)',
                                }
                              }} 
                            />
                          </ListItemButton>
                        </Tooltip>
                      );
                    })}
                  </List>
                </Collapse>
              )}
            </Box>
          );
        })}
      </List>
      
      {/* Bottom decorative element */}
      <Box sx={{
        mt: 'auto',
        p: 3,
        display: 'flex',
        justifyContent: 'center',
        opacity: 0.6
      }}>
        <Box sx={{
          width: '70%',
          height: 3,
          borderRadius: 2,
          background: 'linear-gradient(90deg, transparent, rgba(233, 118, 43, 0.5), transparent)',
          boxShadow: '0 0 10px rgba(233, 118, 43, 0.3)',
        }} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Mobile toggle button */}
      <IconButton
        onClick={toggleMobile}
        sx={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: (theme) => theme.zIndex.drawer + 2,
          display: { xs: 'inline-flex', md: 'none' },
          background: 'linear-gradient(135deg, #0D4715 0%, #1a5f2e 100%)',
          color: '#F1F0E9',
          boxShadow: '0 4px 16px rgba(13, 71, 21, 0.4)',
          border: '1px solid rgba(241, 240, 233, 0.1)',
          '&:hover': {
            background: 'linear-gradient(135deg, #1a5f2e 0%, #0D4715 100%)',
            transform: 'scale(1.05)',
            boxShadow: '0 6px 20px rgba(13, 71, 21, 0.5)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Backdrop for mobile */}
      <Backdrop
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: { xs: 'block', md: 'none' },
          bgcolor: 'rgba(13, 71, 21, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
        open={mobileOpen}
        onClick={toggleMobile}
      />

      {/* Temporary drawer for mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #0D4715 0%, #1a5f2e 40%, #0D2818 100%)',
            borderTopRightRadius: 38,
            borderBottomRightRadius: 38,
            boxShadow: '0 20px 60px rgba(13, 71, 21, 0.6)',
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Permanent drawer for desktop */}
      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'linear-gradient(180deg, #0D4715 0%, #1a5f2e 40%, #0D2818 100%)',
            borderTopRightRadius: 38,
            borderBottomRightRadius: 38,
            boxShadow: '0 20px 60px rgba(13, 71, 21, 0.4)',
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}