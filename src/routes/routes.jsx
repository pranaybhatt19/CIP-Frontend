import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage/login";
import ForgotPassword from "../pages/ForgotPassword/forgot-password";
import Profile from "../pages/Profile/profile";
import ResetPassword from "../pages/ResetPassword/reset-password";
import Dashboard from "../pages/Dashboard/dashboard";
import TestDetailView from "../pages/TestDetailView/test-detail-view";
import UserTestDashboard from "../pages/UserTestTable/user-test-list";
import NotFound from "../pages/NotFound/not-found";
import ProtectedRoute from "./protected-route";
import OtpVerification from "../pages/OtpVerification/otp-verification";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verification" element={<OtpVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/test-detail-view/:id"
        element={
          <ProtectedRoute>
            <TestDetailView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-test-dashboard/:id"
        element={
          <ProtectedRoute>
            <UserTestDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
