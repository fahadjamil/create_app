import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Box,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  Add,
  FolderOpen,
  Link as LinkIcon,
  People,
  CalendarMonth,
  Description,
  BarChart,
  ColorLens,
  Settings,
  Calculate,
  Logout,
} from "@mui/icons-material";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Dummy user (replace with your auth logic later)
  const user = {
    name: "John Doe",
    email: "john@example.com",
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/dashboard")) setPageTitle("Dashboard");
    else if (path.includes("/projects")) setPageTitle("Projects");
    else if (path.includes("/clients")) setPageTitle("Clients");
    else if (path.includes("/accounts")) setPageTitle("Accounts");
    else if (path.includes("/calendar")) setPageTitle("Calendar");
    else if (path.includes("/profile")) setPageTitle("Profile");
    else setPageTitle("Create");
  }, [location]);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleSignOut = () => {
    console.log("Signing out...");
    localStorage.removeItem("token");
    handleMenuClose();
    navigate("/login", { replace: true });
  };

  const navigationItems = [
    { path: "/clients", label: "Clients", icon: <People fontSize="small" /> },
    {
      path: "/calendar",
      label: "Calendar",
      icon: <CalendarMonth fontSize="small" />,
    },
    {
      path: "/documents",
      label: "Documents",
      icon: <Description fontSize="small" />,
    },
    { path: "/reports", label: "Reports", icon: <BarChart fontSize="small" /> },
    {
      path: "/brand-center",
      label: "Brand Center",
      icon: <ColorLens fontSize="small" />,
    },
    {
      path: "/notification-settings",
      label: "Notification Settings",
      icon: <Settings fontSize="small" />,
    },
    { path: "/tax", label: "Tax Center", icon: <Calculate fontSize="small" /> },
  ];

  return (
    <AppBar position="sticky" color="default" elevation={1}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Left section */}
        <Box display="flex" alignItems="center">
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">{pageTitle}</Typography>
        </Box>

        {/* Right section */}
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>

          {/* Create New Menu */}
          <IconButton
            color="primary"
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Add />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleNavigate("/projects/new")}>
              <FolderOpen fontSize="small" sx={{ mr: 1 }} /> New Project
            </MenuItem>
            <MenuItem onClick={() => handleNavigate("/payments/new")}>
              <LinkIcon fontSize="small" sx={{ mr: 1 }} /> New Payment Link
            </MenuItem>
            <Divider />
            {navigationItems.map((item) => (
              <MenuItem
                key={item.path}
                onClick={() => handleNavigate(item.path)}
              >
                {item.icon}
                <Typography sx={{ ml: 1 }}>{item.label}</Typography>
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={handleSignOut} sx={{ color: "error.main" }}>
              <Logout fontSize="small" sx={{ mr: 1 }} /> Log Out
            </MenuItem>
          </Menu>

          {/* User Avatar */}
          <IconButton color="inherit" onClick={handleMenuOpen}>
            <AccountCircle />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
