import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage/login";
import ForgotPassword from "../pages/ForgotPassword/forgot-password";
import Profile from "../pages/Profile/profile";
import ResetPassword from "../pages/ResetPassword/reset-password";
import Dashboard from "../pages/Dashboard/dashboard";
import NotFound from "../pages/NotFound/not-found";
import ProtectedRoute from "./protected-route";
import OtpVerification from "../pages/OtpVerification/otp-verification";
import CommunicationListDashboard from "../pages/CommunicationList/communication-list-dashboard";
import MainLayout from "../components/mainLayout";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verification" element={<OtpVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/user-practices/:id"
          element={<CommunicationListDashboard />}
        />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
