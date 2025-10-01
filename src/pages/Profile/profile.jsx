import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Typography,
  Paper,
  Chip,
  Grid,
  Tooltip,
  Divider,
  Card,
  CardContent,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
  Fade,
  Skeleton,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Code as SkillIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import Header from "../../components/header";
import {
  getSkills,
  getUserInfo,
  updateUser,
} from "../../services/authentication";
import { decodeToken } from "../../util/commonFunction";
import { toast } from "react-toastify";
import { Roles, ScoreTypes } from "../../util/enum";

const getValidationSchema = (role) =>
  Yup.object({
    primarySkill:
      role === Roles.DEVELOPER
        ? Yup.array()
          .min(1, "At least one primary skill is required")
          .required("Primary skill is required")
        : Yup.array().strip(),
    secondarySkills:
      role === Roles.DEVELOPER ? Yup.array() : Yup.array().strip(),
    avgScoreList:
      role === Roles.MANAGER ? Yup.array().min(2, "Please provide at least 2 scores to calculate the average") : Yup.array().strip(),
  });
const MAX_VISIBLE_CHIPS = 3;

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [skillOptions, setSkillOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [origianlData, setOriginalData] = useState();
  const [role, setRole] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery("(max-width:400px)");


  const ScoreTypeLabels = {
    [ScoreTypes.technical_score]: "Technical Score",
    [ScoreTypes.problem_solving_score]: "Problem Solving Score",
    [ScoreTypes.project_domain_score]: "Project Domain Score",
    [ScoreTypes.communication_score]: "Communication Score",
    [ScoreTypes.soft_skill_score]: "Soft Skill Score",
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      primarySkill: [],
      secondarySkills: [],
      is_active: true,
      avgScoreList: [],
    },
    validationSchema: getValidationSchema(role),
    enableReinitialize: true,
    onSubmit: async (values) => {
      const payload = { id: values.user_id };
      if (role === Roles.DEVELOPER) {
        payload.primarySkill = values.primarySkill;
        payload.secondarySkill = values.secondarySkills;
      }
      if (role === Roles.MANAGER) {
        payload.avgScoreList = values.avgScoreList;
      }
      const res = await updateUser(payload);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    },
  });


  const handleCancel = () => {
    setIsEditing(false);
    formik.setValues(origianlData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const decodedToken = decodeToken();
        // Fetch skills and profile data in parallel
        const [skillsResponse, profileResponse] = await Promise.all([
          getSkills(),
          (async () => {
            return await getUserInfo(decodedToken?.sub);
          })(),
        ]);

        setSkillOptions(skillsResponse.skills || []);
        const userInfo = decodeToken();
        setRole(userInfo.role);
        const user = profileResponse.user;
        formik.setValues({
          user_id: decodedToken?.sub,
          name: user.name,
          email: user.email,
          primarySkill: user.primarySkill.map((s) => s.id),
          secondarySkills: user.secondarySkill.map((s) => s.id),
          is_active: user.is_active,
          avgScoreList: user.avgScoreList || [],
        });
        setOriginalData({
          user_id: decodedToken?.sub,
          name: user.name,
          email: user.email,
          primarySkill: user.primarySkill.map((s) => s.id),
          secondarySkills: user.secondarySkill.map((s) => s.id),
          is_active: user.is_active,
          avgScoreList: user.avgScoreList || [],
        });


        formik.validateForm();

      } catch (err) {
        setError(err.message || "Failed to fetch data");
        toast.error(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Enhanced chip renderer with better responsive behavior
  const renderChips = (
    selected,
    maxVisible = isSmallMobile ? 1 : isMobile ? 2 : MAX_VISIBLE_CHIPS
  ) => {
    const selectedSkills = selected
      .map((id) => skillOptions.find((s) => s.id === id)?.name)
      .filter(Boolean);

    if (selectedSkills.length === 0) {
      return (
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ fontStyle: "italic", py: 1 }}
        >
          No skills selected
        </Typography>
      );
    }

    const visible = selectedSkills.slice(0, maxVisible);
    const hidden = selectedSkills.length - visible.length;

    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 0.5, sm: 0.75 },
          alignItems: "center",
        }}
      >
        {visible.map((name, idx) => (
          <Chip
            key={idx}
            label={name}
            size={isMobile ? "small" : "medium"}
            sx={{
              fontWeight: 500,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              height: { xs: 24, sm: 32 },
              "& .MuiChip-label": {
                px: { xs: 1, sm: 1.5 },
              },
            }}
          />
        ))}
        {hidden > 0 && (
          <Tooltip
            title={selectedSkills.slice(maxVisible).join(", ")}
            placement="top"
            arrow
          >
            <Chip
              label={`+${hidden} more`}
              size={isMobile ? "small" : "medium"}
              sx={{
                bgcolor: "#f5f5f5",
                color: "#666",
                fontWeight: 500,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                height: { xs: 24, sm: 32 },
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "#eeeeee",
                },
              }}
            />
          </Tooltip>
        )}
      </Box>
    );
  };

  // Loading skeleton
  if (loading) {
    return (
      <>
        <Header />
        <Container
          maxWidth="md"
          sx={{
            mt: { xs: 1, sm: 2, md: 3 },
            mb: 3,
            px: { xs: 1, sm: 2 },
          }}
        >
          <Card elevation={1} sx={{ borderRadius: { xs: 2, sm: 3 } }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Skeleton
                  variant="circular"
                  width={isMobile ? 60 : 80}
                  height={isMobile ? 60 : 80}
                />
                <Box>
                  <Skeleton variant="text" width={200} height={32} />
                  <Skeleton variant="text" width={150} height={24} />
                  <Skeleton
                    variant="rectangular"
                    width={60}
                    height={24}
                    sx={{ borderRadius: 3, mt: 1 }}
                  />
                </Box>
              </Stack>
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={150} />
            </CardContent>
          </Card>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container
        maxWidth="md"
        sx={{
          mt: { xs: 1, sm: 2, md: 3 },
          mb: 3,
          px: { xs: 1, sm: 2 },
        }}
      >
        <Fade in timeout={600}>
          <Card
            elevation={isMobile ? 0 : 2}
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              overflow: "hidden",
              backgroundColor: "background.paper",
              border: isMobile ? `1px solid ${theme.palette.divider}` : "none",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {/* Header Section */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={{ xs: 2, sm: 3 }}
                alignItems={{ xs: "center", sm: "flex-start" }}
                sx={{ mb: { xs: 3, sm: 4 } }}
              >
                <Avatar
                  sx={{
                    width: { xs: 60, sm: 80, md: 100 },
                    height: { xs: 60, sm: 80, md: 100 },
                    bgcolor: "#1976d2", // Professional blue
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                    fontWeight: "bold",
                  }}
                >
                  {formik.values.name
                    ? formik.values.name.charAt(0).toUpperCase()
                    : "U"}
                </Avatar>
                <Box sx={{ textAlign: { xs: "center", sm: "left" }, flex: 1 }}>
                  <Typography
                    variant={isMobile ? "h6" : isTablet ? "h5" : "h4"}
                    fontWeight="700"
                    sx={{
                      mb: { xs: 0.5, sm: 1 },
                      lineHeight: 1.2,
                      wordBreak: "break-word",
                    }}
                  >
                    {formik.values.name || "User Profile"}
                  </Typography>

                  <Chip
                    label={formik.values.is_active ? "Active" : "Inactive"}
                    color={formik.values.is_active ? "success" : "default"}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  />
                </Box>
              </Stack>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                  }}
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={formik.handleSubmit}>
                {/* Account Information Section */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: { xs: 1.5, sm: 2 } }}
                  >
                    <PersonIcon
                      color="primary"
                      sx={{ fontSize: { xs: 20, sm: 24 } }}
                    />
                    <Typography
                      variant={isMobile ? "subtitle1" : "h6"}
                      fontWeight="bold"
                    >
                      Account Information
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        margin="normal"
                        value={formik.values.name}
                        size={isMobile ? "small" : "medium"}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <PersonIcon
                              sx={{
                                mr: 1,
                                color: "action.active",
                                fontSize: { xs: 18, sm: 20 },
                              }}
                            />
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f8f9fa",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Email Address"
                        margin="normal"
                        value={formik.values.email}
                        size={isMobile ? "small" : "medium"}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <EmailIcon
                              sx={{
                                mr: 1,
                                color: "action.active",
                                fontSize: { xs: 18, sm: 20 },
                              }}
                            />
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#f8f9fa",
                          },
                        }}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Skills Section - Updated to Full Width Column Layout */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: { xs: 1.5, sm: 2 } }}
                  >
                    {role === Roles.DEVELOPER && (
                      <>
                        <SkillIcon
                          color="primary"
                          sx={{ fontSize: { xs: 20, sm: 24 } }}
                        />
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          fontWeight="bold"
                        >
                          Skills & Expertise
                        </Typography>
                      </>
                    )}
                  </Stack>
                  <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
                  {role === Roles.DEVELOPER && (
                    <Stack spacing={{ xs: 2, sm: 3 }}>
                      {/* Primary Skills - Full Width */}
                      <Paper
                        elevation={0}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: { xs: 1.5, sm: 2 } }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              bgcolor: "#1976d2",
                            }}
                          />
                          <Typography
                            variant={isMobile ? "body2" : "subtitle2"}
                            fontWeight="bold"
                            color="#1976d2"
                          >
                            Primary Skills
                          </Typography>
                        </Stack>
                        <FormControl fullWidth disabled={!isEditing}>
                          <InputLabel
                            id="primary-skill-label"
                            size={isMobile ? "small" : "normal"}
                          >
                            Select Primary Skills
                          </InputLabel>
                          <Select
                            labelId="primary-skill-label"
                            name="primarySkill"
                            multiple
                            value={formik.values.primarySkill}
                            onChange={formik.handleChange}
                            size={isMobile ? "small" : "medium"}
                            input={
                              <OutlinedInput
                                label="Select Primary Skills"
                                size={isMobile ? "small" : "medium"}
                              />
                            }
                            renderValue={(selected) => renderChips(selected)}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: isMobile ? 250 : 300,
                                },
                              },
                            }}
                          >
                            {skillOptions
                              .filter(
                                (skill) =>
                                  !formik.values.secondarySkills.includes(
                                    skill.id
                                  )
                              ) // exclude secondary skills
                              .map((skill) => (
                                <MenuItem key={skill.id} value={skill.id}>
                                  {skill.name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                        {formik.touched.primarySkill &&
                          formik.errors.primarySkill && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 1, display: "block" }}
                            >
                              {formik.errors.primarySkill}
                            </Typography>
                          )}
                      </Paper>

                      {/* Secondary Skills - Full Width */}
                      <Paper
                        elevation={0}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ mb: { xs: 1.5, sm: 2 } }}
                        >
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#1976d2",
                              // bgcolor: '#6c757d'
                            }}
                          />
                          <Typography
                            variant={isMobile ? "body2" : "subtitle2"}
                            fontWeight="bold"
                            color="#1976d2"
                          // color="#6c757d"
                          >
                            Secondary Skills
                          </Typography>
                        </Stack>
                        <FormControl fullWidth disabled={!isEditing}>
                          <InputLabel
                            id="secondary-skills-label"
                            size={isMobile ? "small" : "normal"}
                          >
                            Select Secondary Skills
                          </InputLabel>
                          <Select
                            labelId="secondary-skills-label"
                            name="secondarySkills"
                            multiple
                            value={formik.values.secondarySkills}
                            onChange={formik.handleChange}
                            size={isMobile ? "small" : "medium"}
                            input={
                              <OutlinedInput
                                label="Select Secondary Skills"
                                size={isMobile ? "small" : "medium"}
                              />
                            }
                            renderValue={(selected) => renderChips(selected)}
                            MenuProps={{
                              PaperProps: {
                                style: {
                                  maxHeight: isMobile ? 250 : 300,
                                },
                              },
                            }}
                          >
                            {skillOptions
                              .filter(
                                (skill) =>
                                  !formik.values.primarySkill.includes(skill.id)
                              )
                              .map((skill) => (
                                <MenuItem key={skill.id} value={skill.id}>
                                  {skill.name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Paper>
                    </Stack>
                  )}
                  {role === Roles.MANAGER && (
                    <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mb: { xs: 1.5, sm: 2 } }}
                      >
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          fontWeight="bold"
                          color="primary"
                        >
                          Average Score Formula
                        </Typography>
                      </Stack>
                      <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

                      <FormControl
                        fullWidth
                        disabled={!isEditing}
                        error={Boolean(formik.touched.avgScoreList && formik.errors.avgScoreList)}
                      >
                        <InputLabel id="score-type-label">Select Score Type</InputLabel>
                        <Select
                          labelId="score-type-label"
                          name="avgScoreList"
                          multiple
                          value={formik.values.avgScoreList || []}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          size={isMobile ? "small" : "medium"}
                          input={<OutlinedInput label="Select Score Type" />}
                          renderValue={(selected) => (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {selected.map((value) => (
                                <Chip key={value} label={ScoreTypeLabels[value]} />
                              ))}
                            </Box>
                          )}
                        >
                          {Object.entries(ScoreTypeLabels).map(([key, label]) => (
                            <MenuItem key={key} value={Number(key)}>
                              {label}
                            </MenuItem>
                          ))}
                        </Select>

                        {formik.touched.avgScoreList &&
                          formik.errors.avgScoreList && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 1, display: "block" }}
                            >
                              {formik.errors.avgScoreList}
                            </Typography>
                          )}
                      </FormControl>

                    </Box>
                  )}
                </Box>

                {/* Action Buttons */}
                {role && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 1.5, sm: 2 },
                      pt: { xs: 2, sm: 3 },
                      borderTop: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {isEditing ? (
                      <>
                        <Button
                          onClick={handleCancel}
                          color="inherit"
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          size={isMobile ? "medium" : "large"}
                          fullWidth={isMobile}
                          sx={{
                            minHeight: { xs: 44, sm: 48 },
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          size={isMobile ? "medium" : "large"}
                          fullWidth={isMobile}
                          sx={{
                            minHeight: { xs: 44, sm: 48 },
                            fontSize: { xs: "0.875rem", sm: "1rem" },
                            background:
                              "linear-gradient(45deg, #1976d2, #1565c0)",
                            "&:hover": {
                              background:
                                "linear-gradient(45deg, #1565c0, #0d47a1)",
                            },
                          }}
                        >
                          Save Changes
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(true)}
                        startIcon={<EditIcon />}
                        size={isMobile ? "medium" : "large"}
                        fullWidth={isMobile}
                        sx={{
                          minHeight: { xs: 44, sm: 48 },
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                          borderWidth: 2,
                          "&:hover": {
                            borderWidth: 2,
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 8px rgba(25, 118, 210, 0.2)",
                          },
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </Box>
                )}
              </form>
            </CardContent>
          </Card>
        </Fade>
      </Container>
    </>
  );
};

export default Profile;
