// src/layouts/MainLayout.jsx
import React from "react";
import Header from "./header";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

const MainLayout = () => {
  return (
    <Box>
      <Header />
      <Box component="main" sx={{ p: 3 }}>
        <Outlet /> 
      </Box>
    </Box>
  );
};

export default MainLayout;
