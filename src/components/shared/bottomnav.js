import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Dialog,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";

// ✅ MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const BottomNav = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState(pathname);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  const handleChange = (event, newValue) => {
    if (newValue === "new") {
      setIsSubMenuOpen(true);
    } else {
      setValue(newValue);
      navigate(newValue);
    }
  };

  // Function to determine icon color based on active tab
  const getIconColor = (tabValue) => (value === tabValue ? "#ffffff" : "#aaaaaa");

  return (
    <>
      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          borderRadius: "16px 16px 0 0",
          bgcolor: "#333333", // dark gray background
        }}
        elevation={3}
      >
        <BottomNavigation value={value} onChange={handleChange} showLabels>
          <BottomNavigationAction
            label="Home"
            value="/"
            icon={<HomeIcon sx={{ color: getIconColor("/") }} />}
          />
          <BottomNavigationAction
            label="Projects"
            value="/projects"
            icon={<DescriptionIcon sx={{ color: getIconColor("/projects") }} />}
          />
          <BottomNavigationAction
            label="New"
            value="new"
            icon={
              <Box
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: "50%",
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AddIcon />
              </Box>
            }
          />
          <BottomNavigationAction
            label="Accounts"
            value="/accounts"
            icon={<AttachMoneyIcon sx={{ color: getIconColor("/accounts") }} />}
          />
          <BottomNavigationAction
            label="Profile"
            value="/profile"
            icon={<PeopleIcon sx={{ color: getIconColor("/profile") }} />}
          />
        </BottomNavigation>
      </Paper>

      {/* NewSubMenu as MUI Dialog */}
      <Dialog open={isSubMenuOpen} onClose={() => setIsSubMenuOpen(false)}>
        <DialogContent>
          <Box sx={{ textAlign: "center" }}>
            <h3>Create New</h3>
            <IconButton onClick={() => setIsSubMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
            {/* Replace with your submenu items */}
            <Box sx={{ mt: 2 }}>Add your submenu content here</Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BottomNav;
