import React from "react";
import Navbar from "./navbar";
import BottomNav from "./bottomnav";
import { Box } from "@mui/material";

const Layout = ({ children }) => {
  return (
    <Box sx={{ pb: 8 }}   style={{ backgroundColor: "#f0f0f0" }}> {/* padding bottom so content is not hidden by BottomNav */}
      <Navbar />
      <Box sx={{ mt: 8 }}>{children}</Box> {/* margin top for navbar height */}
      <BottomNav />
    </Box>
  );
};

export default Layout;