// src/pages/auth/ResetPassword.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  ThemeProvider,
  CssBaseline,
  Alert,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff, Lock } from "@mui/icons-material";
import { useFormik } from "formik";
import theme from "../../components/theme";
import { ResetPasswordValidationSchema } from "../../util/validationSchema";
import loginBg from "../../assets/bg-image.png";
import { resetPassword, verifyOtpToken } from "../../services/authentication";
import { toast } from "react-toastify";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const resetToken = new URLSearchParams(useLocation().search).get(
    "resetToken"
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("resetToken");

    if (!storedToken) navigate("/forgot-password");
    verifyOtpToken({ otp: storedToken })
      .then((res) => {
        if (!res.valid) navigate("/forgot-password");
      })
      .catch(() => navigate("/forgot-password"));
  }, [navigate]);

  const formik = useFormik({
    initialValues: {
      new_password: "",
      confirm_password: "",
    },
    validationSchema: ResetPasswordValidationSchema,
    onSubmit: (values, { setSubmitting }) => {
      const data = {
        password: values.new_password,
        token: resetToken,
      };
      resetPassword(data)
        .then(() => {
          localStorage.clear();
          toast.success("Password reset successfully!");
          navigate("/");
        })
        .catch((err) => {
          setApiError(err.message || "Password reset failed");
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url(${loginBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Grid container justifyContent="center" alignItems="center">
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Typography variant="h3">Reset Password</Typography>
                    <Typography variant="body1">
                      Enter your new password below
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
                    {/* New Password */}
                    <TextField
                      fullWidth
                      label="New Password"
                      name="new_password"
                      type={showPassword ? "text" : "password"}
                      value={formik.values.new_password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.new_password && !!formik.errors.new_password}
                      helperText={formik.touched.new_password && formik.errors.new_password}
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Confirm Password */}
                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirm_password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formik.values.confirm_password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.confirm_password && !!formik.errors.confirm_password
                      }
                      helperText={
                        formik.touched.confirm_password && formik.errors.confirm_password
                      }
                      margin="normal"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {apiError && <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{apiError}</Alert>}

                    <Button fullWidth type="submit" variant="contained" sx={{ mt: 3, mb: 1 }}>
                      Reset Password
                    </Button>

                    <Box sx={{ textAlign: "center", mt: 2 }}>
                      <Link component={RouterLink} to="/">
                        Back to login
                      </Link>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ResetPassword;
