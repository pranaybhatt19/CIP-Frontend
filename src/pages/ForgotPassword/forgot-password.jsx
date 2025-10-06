import React, { useState } from "react";
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
  Link,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import { Email } from "@mui/icons-material";
import { useFormik } from "formik";
import { forgotPassword } from "../../services/authentication";
import { theme } from "../../styles/login-theme";
import { ForgotPasswordvalidationSchema } from "../../util/validationSchema";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import loginBg from "../../assets/bg-image.png";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();
  const muiTheme = useTheme();

  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: ForgotPasswordvalidationSchema,
    onSubmit: (values, { setSubmitting }) => {
      setApiError(null);
      forgotPassword(values)
        .then((res) => {
          localStorage.setItem("email", values.email);
          toast.success("OTP sent successfully to your registered email");
          navigate(`/otp-verification?otpToken=${res.token}`);
        })
        .catch((err) => {
          setApiError(err.message || "Something went wrong");
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
              <Card
                sx={{
                  maxWidth: 480,
                  mx: "auto",
                  animation: "fadeIn 0.5s ease-in",
                  backgroundColor: muiTheme.palette.background.paper,
                }}
              >
                <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
                  <Box sx={{ textAlign: "center", mb: 2 }}>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        fontSize: "32px",
                        color: muiTheme.palette.primary.main,
                        mb: 2,
                      }}
                    >
                      Forgot Password
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: muiTheme.palette.text.secondary, mb: 2 }}
                    >
                      Provide an email associated with your account for verification.
                    </Typography>
                  </Box>

                  <Box
                    component="form"
                    onSubmit={formik.handleSubmit}
                    sx={{ mt: 3 }}
                  >
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.email && !!formik.errors.email}
                      helperText={formik.touched.email && formik.errors.email}
                      margin="normal"
                      aria-label="Email Address"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: muiTheme.palette.text.secondary }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    {apiError && (
                      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                        {apiError}
                      </Alert>
                    )}

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={formik.isSubmitting}
                      aria-label="Send email"
                      sx={{
                        mt: 3,
                        mb: 3,
                        backgroundColor: muiTheme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: muiTheme.palette.primary.dark,
                        },
                      }}
                    >
                      {formik.isSubmitting ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CircularProgress
                            size={20}
                            sx={{ color: muiTheme.palette.common.white }}
                          />
                          <Typography color="inherit">Sending email...</Typography>
                        </Box>
                      ) : (
                        "Send Email"
                      )}
                    </Button>

                    <Box sx={{ textAlign: "center" }}>
                      <Link
                        component={RouterLink}
                        to="/"
                        sx={{
                          color: muiTheme.palette.primary.main,
                          textDecoration: "none",
                          fontWeight: 500,
                          "&:hover": {
                            textDecoration: "underline",
                            color: muiTheme.palette.primary.dark,
                          },
                        }}
                      >
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

export default ForgotPassword;
