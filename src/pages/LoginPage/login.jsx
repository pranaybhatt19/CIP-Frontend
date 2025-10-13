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
  Link,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";
import { useFormik } from "formik";
import { loginUser } from "../../services/authentication";
import { theme } from "../../styles/login-theme";
import { LoginvalidationSchema } from "../../util/validationSchema";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import loginBg from "../../assets/bg-image.png";
import headphonesIcon from "../../assets/headphones.svg";

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();
  const muiTheme = useTheme();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: LoginvalidationSchema,
    onSubmit: (values, { setSubmitting }) => {
      setApiError(null);
      const data = {
        identity: values.email,
        password: values.password,
      };
      loginUser(data)
        .then((res) => {
          localStorage.setItem("token", res.token);
          navigate("/dashboard");
        })
        .catch((err) => {
          setApiError(err.message || "Login failed");
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
  });

  useEffect(() => {
    localStorage.clear();
  }, []);

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
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      width: "100%",
                      mb: 3,
                    }}
                  >
                    {/* SVG Logo */}
                    <Box
                      component="img"
                      src={headphonesIcon}
                      alt="Headphones Logo"
                      sx={{
                        width: { xs: "80px", sm: "100px" },
                        height: { xs: "80px", sm: "100px" },
                        mb: 2,
                      }}
                    />

                    {/* Title */}
                    <Typography
                      variant="h4"
                      component="h1"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        textAlign: "center",
                        mb: 0.5,
                        fontSize: { xs: "1.5rem", sm: "2rem" },
                      }}
                    >
                      COMMUNICATION ACE
                    </Typography>

                    {/* Subtitle */}
                    <Typography
                      variant="subtitle1"
                      sx={{
                        // color: theme.palette.primary.main,
                        textAlign: "center",
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        fontWeight: 400,
                      }}
                    >
                      Communication Improvement Portal
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
                            <Email
                              sx={{ color: muiTheme.palette.text.secondary }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={
                        formik.touched.password && !!formik.errors.password
                      }
                      helperText={
                        formik.touched.password && formik.errors.password
                      }
                      margin="normal"
                      aria-label="Password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock
                              sx={{ color: muiTheme.palette.text.secondary }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              sx={{ color: muiTheme.palette.text.secondary }}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {apiError && (
                      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                        {apiError}
                      </Alert>
                    )}

                    <Box sx={{ textAlign: "right", mt: 2, mb: 3 }}>
                      <Link
                        component={RouterLink}
                        to="/forgot-password"
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
                        Forgot your password?
                      </Link>
                    </Box>

                    <Button
                      fullWidth
                      type="submit"
                      variant="contained"
                      disabled={formik.isSubmitting}
                      aria-label="Sign In"
                      sx={{
                        mt: 2,
                        mb: 3,
                        backgroundColor: muiTheme.palette.primary.main,
                        "&:hover": {
                          backgroundColor: muiTheme.palette.primary.dark,
                        },
                      }}
                    >
                      {formik.isSubmitting ? (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <CircularProgress
                            size={20}
                            sx={{ color: muiTheme.palette.common.white }}
                          />
                          <Typography color="inherit">Signing In...</Typography>
                        </Box>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
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

export default LoginPage;
