import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  ThemeProvider,
  CssBaseline,
  Link,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useFormik } from "formik";
import {
  verifyOTP,
  resendOTP,
  verifyOtpToken,
} from "../../services/authentication";
import { theme } from "../../styles/login-theme";
import { OTPValidationSchema } from "../../util/validationSchema";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import loginBg from "../../assets/images/bg-image.png";
import { toast } from "react-toastify";

const OtpVerification = () => {
  const [apiError, setApiError] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();
  const otpRefs = useRef([]);
  const otpToken = new URLSearchParams(useLocation().search).get("otpToken");

  useEffect(() => {
    if (!otpToken) navigate("/forgot-password");
    verifyOtpToken({ otp: otpToken })
      .then((res) => {
        if (!res.valid) {
          navigate("/forgot-password");
        }
      })
      .catch((e) => {
        navigate("/forgot-password");
      });
  }, []);

  const formik = useFormik({
    initialValues: {
      otp1: "",
      otp2: "",
      otp3: "",
      otp4: "",
      otp5: "",
      otp6: "",
    },
    validationSchema: OTPValidationSchema,
    onSubmit: (values, { setSubmitting }) => {
      setApiError(null);
      setSuccessMessage(null);
      const email = localStorage.getItem("email");
      // Combine OTP digits
      const otpCode = Object.values(values).join("");
      verifyOTP({ otp: otpCode, email })
        .then((res) => {
          localStorage.setItem("resetToken", res.resetToken);
          setSuccessMessage(res.message || "OTP verified successfully!");
          toast.success(res.message || "OTP verified successfully!");
          navigate(`/reset-password?resetToken=${res.resetToken}`);
        })
        .catch((err) => {
          setApiError(err.message || "OTP verification failed");
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
  });

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      formik.setFieldValue(`otp${index + 1}`, value);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index, event) => {
    if (
      event.key === "Backspace" &&
      !formik.values[`otp${index + 1}`] &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (event) => {
    event.preventDefault();
    const paste = event.clipboardData.getData("text");
    if (/^\d{6}$/.test(paste)) {
      const digits = paste.split("");
      digits.forEach((digit, index) => {
        formik.setFieldValue(`otp${index + 1}`, digit);
      });
      otpRefs.current[5]?.focus();
    }
  };

  // Check if any OTP field has error
  const hasOtpError = Object.keys(formik.errors).some((key) =>
    key.startsWith("otp")
  );
  const otpTouched = Object.keys(formik.touched).some((key) =>
    key.startsWith("otp")
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "#ffffff",
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
            <Grid component="div" item xs={12}>
              <Card
                sx={{
                  maxWidth: 480,
                  mx: "auto",
                  animation: "fadeIn 0.5s ease-in",
                }}
              >
                <CardContent sx={{ p: { xs: 4, sm: 6 } }}>
                  <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        fontSize: "32px",
                        color: "#1a4571",
                        mb: 4,
                      }}
                    >
                      Verification
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary", mb: 2 }}
                    >
                      Please enter the 6-digit code sent to your email address
                    </Typography>
                  </Box>

                  <Box
                    component="form"
                    onSubmit={formik.handleSubmit}
                    sx={{ mt: 3 }}
                  >
                    {/* OTP Input Fields */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                        mb: 3,
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5].map((index) => (
                        <TextField
                          key={index}
                          inputRef={(el) => (otpRefs.current[index] = el)}
                          name={`otp${index + 1}`}
                          value={formik.values[`otp${index + 1}`]}
                          onChange={(e) =>
                            handleOtpChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          onBlur={formik.handleBlur}
                          error={hasOtpError && otpTouched}
                          inputProps={{
                            maxLength: 1,
                            style: {
                              textAlign: "center",
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                            },
                            "aria-label": `OTP digit ${index + 1}`,
                          }}
                          sx={{
                            width: "48px",
                            "& .MuiOutlinedInput-root": {
                              height: "56px",
                            },
                          }}
                        />
                      ))}
                    </Box>

                    {/* Error message for OTP */}
                    {hasOtpError && otpTouched && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ display: "block", textAlign: "center", mb: 2 }}
                      >
                        Please enter a valid 6-digit OTP
                      </Typography>
                    )}

                    {/* API Error */}
                    {apiError && (
                      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                        {apiError}
                      </Alert>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                      <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                        {successMessage}
                      </Alert>
                    )}

                    {/* Verify Button */}
                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={formik.isSubmitting}
                      aria-label="Verify OTP"
                      sx={{ mt: 2, mb: 3 }}
                    >
                      {formik.isSubmitting ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress
                            size={20}
                            sx={{ color: "text.secondary" }}
                          />
                          <Typography>Verifying...</Typography>
                        </Box>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>

                    {/* <Box sx={{ textAlign: "center", mt: 2, mb: 3 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 1 }}
                      >
                        Didn't receive the code?
                      </Typography>
                      <Button
                        onClick={handleResendOTP}
                        disabled={resendLoading || resendTimer > 0}
                        sx={{
                          textDecoration: "none",
                          fontWeight: 500,
                          textTransform: "none",

                          "&:disabled": {
                            color: "text.disabled",
                          },
                        }}
                      >
                        {resendLoading ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <CircularProgress size={16} />
                            <Typography>Sending...</Typography>
                          </Box>
                        ) : resendTimer > 0 ? (
                          `Resend OTP in ${resendTimer}s`
                        ) : (
                          "Resend OTP"
                        )}
                      </Button>
                    </Box> */}

                    {/* Back to Login */}
                    <Box sx={{ textAlign: "center" }}>
                      <Link
                        component={RouterLink}
                        to="/"
                        sx={{
                          color: "primary.main",
                          textDecoration: "none",
                          fontWeight: 500,
                          "&:hover": {
                            textDecoration: "underline",
                            color: "primary.dark",
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

export default OtpVerification;
