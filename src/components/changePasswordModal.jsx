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
  InputAdornment,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  CircularProgress,
} from "@mui/material";
import {
  LockReset as LockResetIcon,
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
  Lock,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { decodeToken } from "../util/commonFunction";
import { updateUser } from "../services/authentication";
import { useFormik } from "formik";
import * as yup from "yup";

const ChangePasswordValidationSchema = yup.object().shape({
  new_password: yup
    .string()
    .required("New password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
      "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
    ),
  confirm_password: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("new_password"), null], "Passwords must match"),
});

const ChangePasswordDialog = ({ open, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      new_password: "",
      confirm_password: "",
    },
    validationSchema: ChangePasswordValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const decodedToken = decodeToken();

        await updateUser({
          id: decodedToken?.sub,
          password: values.new_password,
        });

        toast.success("Password updated successfully!");
        resetForm();
        onClose();
      } catch (err) {
        toast.error(err.message || "Failed to update password");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      {/* ---------- Dialog Header ---------- */}
      <DialogTitle sx={{ pb: 1, mb: 2.5 }}>
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
          <IconButton onClick={handleClose} size="small" sx={{ color: "grey.500" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* ---------- Form Section ---------- */}
      <DialogContent sx={{ pt: "3", overflow: "visible" }}>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Stack spacing={3}>
            {/* New Password */}
            <FormControl
              variant="outlined"
              fullWidth
              error={formik.touched.new_password && Boolean(formik.errors.new_password)}
            >
              <InputLabel htmlFor="new_password">New Password</InputLabel>
              <OutlinedInput
                id="new_password"
                name="new_password"
                type={showPassword ? "text" : "password"}
                value={formik.values.new_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="New Password"
                placeholder="Enter new password"
                startAdornment={
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                }
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                sx={{ backgroundColor: "grey.50" }}
              />
              {formik.touched.new_password && formik.errors.new_password && (
                <Typography color="error" variant="caption">
                  {formik.errors.new_password}
                </Typography>
              )}
            </FormControl>

            {/* Confirm Password */}
            <FormControl
              variant="outlined"
              fullWidth
              error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)}
            >
              <InputLabel htmlFor="confirm_password">Confirm Password</InputLabel>
              <OutlinedInput
                id="confirm_password"
                name="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                value={formik.values.confirm_password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                label="Confirm Password"
                placeholder="Re-enter your password"
                startAdornment={
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                }
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
                sx={{ backgroundColor: "grey.50" }}
              />
              {formik.touched.confirm_password && formik.errors.confirm_password && (
                <Typography color="error" variant="caption">
                  {formik.errors.confirm_password}
                </Typography>
              )}
            </FormControl>
          </Stack>

          {/* ---------- Actions ---------- */}
          <DialogActions sx={{ px: 0, pb: 0, pt: 3 }}>
            <Button onClick={handleClose} variant="outlined" disabled={formik.isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{ minWidth: 120 }}
            >
              {formik.isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: "white" }} />
                  Updating...
                </Box>
              ) : (
                "Update Password"
              )}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
