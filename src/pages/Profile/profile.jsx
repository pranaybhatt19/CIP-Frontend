import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  TextField,
  Typography,
  Card,
  CardContent,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  Skeleton,
  Alert,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  SupervisorAccount as SupervisorIcon,
  LockReset as LockResetIcon,
  Close as CloseIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { decodeToken } from "../../util/commonFunction";
import { getUserInfo, updateUser } from "../../services/authentication";
import { toast } from "react-toastify";
import ChangePasswordDialog from "../../components/changePasswordModal";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const decodedToken = decodeToken();
        if (!decodedToken?.sub) {
          throw new Error("Unable to decode token or missing user ID");
        }

        // Fetch user data from backend
        const response = await getUserInfo(decodedToken.sub);
        const user = response?.payload;

        if (!user) {
          throw new Error("User data not found");
        }

        setUserInfo({
          id: user.id,
          firstName: user.first_name || "",
          middleName: user.middle_name || "",
          lastName: user.last_name || "",
          fullName: user.full_name || "",
          email: user.email || "",
          experience: user.experience_years
            ? `${user.experience_years} Years`
            : "N/A",
          experienceStartDate: user.experience_start_date || "",
          designation: user.designation?.name || "",
          mediumOfEducation: user.medium_of_education || "",
          isActive: user.is_active || false,
          reportingPerson: {
            id: user.reporting_person?.id || null,
            fullName: user.reporting_person?.full_name || "",
            designation: user.reporting_person?.designation?.name || "",
          },
        });
      } catch (err) {
        if (err.status === 409) {
          navigate("/dashboard");
        } else {
          toast.error(
            err?.response?.data?.message || "Failed to fetch profile data"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenPasswordModal = () => {
    setOpenPasswordModal(true);
    setPasswordData({ newPassword: "", confirmPassword: "" });
  };

  const handleClosePasswordModal = () => {
    setOpenPasswordModal(false);
    setPasswordData({ newPassword: "", confirmPassword: "" });
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
  };

  if (loading) {
    return (
      <Container
        maxWidth="xl"
        sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 6 } }}
      >
        <Card
          elevation={2}
          sx={{ borderRadius: 2, maxWidth: 1400, mx: "auto" }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            <Stack direction="row" spacing={3} sx={{ mb: 4 }}>
              <Skeleton variant="circular" width={80} height={80} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width={200} height={40} />
                <Skeleton variant="text" width={120} height={24} />
              </Box>
            </Stack>
            <Skeleton variant="rectangular" height={400} />
          </CardContent>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="xl"
        sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 6 } }}
      >
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, px: { xs: 2, sm: 3, md: 6 } }}>
      <Fade in timeout={600}>
        <Card
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor: theme.palette.background.paper,
            maxWidth: 1400,
            mx: "auto",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            {/* Header Section */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 3,
                mb: 4,
                pb: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: theme.palette.primary.main,
                  fontSize: "2rem",
                  fontWeight: "bold",
                }}
              >
                {getInitials(`${userInfo?.firstName} ${userInfo?.lastName}`)}
              </Avatar>

              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" fontWeight="600" sx={{ mb: 0.5 }}>
                  {`${userInfo?.firstName} ${userInfo?.lastName}` || "-"}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {userInfo?.designation || "N/A"}
                </Typography>
                <Chip
                  label={userInfo?.isActive ? "Active" : "Inactive"}
                  color={userInfo?.isActive ? "success" : "default"}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              <Button
                variant="outlined"
                startIcon={<LockResetIcon />}
                onClick={handleOpenPasswordModal}
                sx={{
                  alignSelf: "flex-start",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Change Password
              </Button>
            </Box>

            {/* Professional Info */}
            <Box sx={{ mb: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
              >
                <WorkIcon color="primary" />
                <Typography variant="h6" fontWeight="600">
                  Professional Information
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                  mb: 4,
                }}
              >
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userInfo?.fullName || ""}
                  InputProps={{ readOnly: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.palette.grey[50],
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  value={userInfo?.email || ""}
                  InputProps={{ readOnly: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.palette.grey[50],
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                  mb: 4,
                }}
              >
                <TextField
                  fullWidth
                  label="Designation"
                  value={userInfo?.designation || ""}
                  InputProps={{ readOnly: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.palette.grey[50],
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Experience (Years)"
                  value={userInfo?.experience || ""}
                  InputProps={{ readOnly: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.palette.grey[50],
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <TextField
                  fullWidth
                  label="Joining Date"
                  value={
                    userInfo?.experienceStartDate
                      ? new Date(
                          userInfo.experienceStartDate
                        ).toLocaleDateString()
                      : "-"
                  }
                  InputProps={{ readOnly: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.palette.grey[50],
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Medium of Education"
                  value={String(userInfo?.mediumOfEducation) || ""}
                  InputProps={{ readOnly: true }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: theme.palette.grey[50],
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Reporting Manager Info */}
            {userInfo?.reportingPerson?.id && (
              <Box>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}
                >
                  <SupervisorIcon color="primary" />
                  <Typography variant="h6" fontWeight="600">
                    Reporting Manager Information
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Name"
                    value={userInfo?.reportingPerson?.fullName || ""}
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: theme.palette.grey[50],
                      },
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Designation"
                    value={userInfo?.reportingPerson?.designation || ""}
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: theme.palette.grey[50],
                      },
                    }}
                  />
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>

      {/* Change Password Modal */}
      <ChangePasswordDialog
        open={openPasswordModal}
        onClose={handleClosePasswordModal}
      />
    </Container>
  );
};

export default Profile;
