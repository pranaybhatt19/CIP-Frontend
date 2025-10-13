import api from "./api";

export const loginUser = async (credentials) => {
  return api.post("api/login", credentials);
};

export const addUser = async (details) => {
  return api.post("api/auth/users/register", details);
};

export const forgotPassword = async (details) => {
  return api.post("api/forgot-password-otp-generator", details);
};

export const resendOTP = async (details) => {
  return api.post("api/resend-otp", details);
};

export const verifyOtpToken = async (details) => {
  return api.post("api/verify-otp-token", details);
};

export const verifyOTP = async (details) => {
  return api.post("api/verify-otp", details);
};

export const updateUser = async (details) => {
  return api.post("api/auth/users/update-user-details", details);
};

export const getDesignations = async () => {
  return api.get("api/auth/users/get-designations");
};

export const getReportingPersons = async () => {
  return api.get("api/auth/users/get-reporting-persons");
};

export const getEducationMedium = async () => {
  return api.get("api/auth/users/get-user-medium");
};

export const resetPassword = async (details) => {
  return api.post("api/reset-password", details);
};

export const getUserInfo = async (id) => {
  return api.get(`/api/auth/users/get-user-details/${id}`);
};

export const searchDashboard = async (details) => {
  return api.post("/api/auth/users/searchUsers", details);
};

export const getPracticeDetailsByUserId = async (details) => {
  return api.post("/api/auth/users/user-practices", details);
};

export const addPractice = async (details) => {
  return api.post("/api/auth/users/add-practice", details);
};

export const deletePractice = async (id) => {
  return api.patch(`/api/auth/users/delete-practice/${id}`);
};
