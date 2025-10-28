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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";

// ✅ MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import LinkIcon from "@mui/icons-material/Link";
import ReceiptIcon from "@mui/icons-material/Receipt";

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
  const getIconColor = (tabValue) =>
    value === tabValue ? "#ffffff" : "#aaaaaa";

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
            value="/projectsList"
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

      {/* New SubMenu as MUI Dialog */}
      <Dialog
        open={isSubMenuOpen}
        onClose={() => setIsSubMenuOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6">Create New</Typography>
            <IconButton onClick={() => setIsSubMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Submenu list */}
          <List>
            <ListItem
              button
              onClick={() => {
                navigate("/projects/new");
                setIsSubMenuOpen(false); // ✅ close popup after selecting
              }}
            >
              <ListItemIcon>
                <FolderOpenIcon color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Project"
                secondary="Create a new project"
              />
            </ListItem>

            <ListItem
              button
              onClick={() => {
                navigate("/new-transaction");
                setIsSubMenuOpen(false); // ✅ close popup after selecting
              }}
            >
              <ListItemIcon>
                <SwapVertIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Transaction"
                secondary="Record income or expense"
              />
            </ListItem>

            <ListItem
              button
              onClick={() => {
                navigate("/new-payment-link");
                setIsSubMenuOpen(false); // ✅ close popup after selecting
              }}
            >
              <ListItemIcon>
                <LinkIcon color="secondary" />
              </ListItemIcon>
              <ListItemText
                primary="Payment Link"
                secondary="Generate payment link"
              />
            </ListItem>

            <ListItem
              button
              onClick={() => {
                navigate("/invoices/new");
                setIsSubMenuOpen(false); // ✅ close popup after selecting
              }}
            >
              <ListItemIcon>
                <ReceiptIcon color="warning" />
              </ListItemIcon>
              <ListItemText primary="Invoice" secondary="Create new invoice" />
            </ListItem>
          </List>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BottomNav;
