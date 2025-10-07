import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Stack,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Button,
} from "@mui/material";
import {
  LockReset as LockResetIcon,
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { decodeToken } from "../util/commonFunction";
import { updateUser } from "../services/authentication";

const ChangePasswordDialog = ({ open, onClose }) => {
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters long";
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    return errors;
  };

  const handlePasswordSubmit = async () => {
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      setSubmitting(true);
      const decodedToken = decodeToken();

      await updateUser({
        id: decodedToken?.sub,
        password: passwordData.newPassword,
      });

      toast.success("Password updated successfully!");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LockResetIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Change Password
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "grey.500" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Stack spacing={3}>
          {/* New Password */}
          <FormControl variant="outlined" fullWidth error={Boolean(passwordErrors.newPassword)}>
            <InputLabel htmlFor="New Password">New Password</InputLabel>
            <OutlinedInput
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              label="New Password"
              placeholder="Enter your new password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    edge="end"
                    size="small"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              sx={{
                backgroundColor: "grey.50",
              }}
            />
            {passwordErrors.newPassword && (
              <Typography color="error" variant="caption">
                {passwordErrors.newPassword}
              </Typography>
            )}
          </FormControl>

          {/* Confirm Password */}
          <FormControl variant="outlined" fullWidth error={Boolean(passwordErrors.confirmPassword)}>
            <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
            <OutlinedInput
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              label="Confirm Password"
              placeholder="Re-enter your password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    size="small"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              sx={{
                backgroundColor: "grey.50",
              }}
            />
            {passwordErrors.confirmPassword && (
              <Typography color="error" variant="caption">
                {passwordErrors.confirmPassword}
              </Typography>
            )}
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handlePasswordSubmit}
          variant="contained"
          disabled={submitting}
          sx={{ minWidth: 120 }}
        >
          {submitting ? "Updating..." : "Update Password"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
