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
import { getSkills, getUserInfo, updateUser } from "../../services/authentication";
import { decodeToken } from "../../util/commonFunction";
import { toast } from "react-toastify";
import { Roles, ScoreTypes } from "../../util/enum";

const getValidationSchema = (role) =>
  Yup.object({
    primarySkill:
      role === Roles.DEVELOPER
        ? Yup.array().min(1, "At least one primary skill is required").required("Primary skill is required")
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
  const [originalData, setOriginalData] = useState();
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
      await updateUser(payload);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    },
  });

  const handleCancel = () => {
    setIsEditing(false);
    formik.setValues(originalData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const decodedToken = decodeToken();
        const [skillsResponse, profileResponse] = await Promise.all([
          getSkills(),
          getUserInfo(decodedToken?.sub),
        ]);

        setSkillOptions(skillsResponse.skills || []);
        const userInfo = decodeToken();
        setRole(userInfo.role);

        const user = profileResponse.user;
        const initialData = {
          user_id: decodedToken?.sub,
          name: user.name,
          email: user.email,
          primarySkill: user.primarySkill.map((s) => s.id),
          secondarySkills: user.secondarySkill.map((s) => s.id),
          is_active: user.is_active,
          avgScoreList: user.avgScoreList || [],
        };

        formik.setValues(initialData);
        setOriginalData(initialData);
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

  const renderChips = (selected, maxVisible = isSmallMobile ? 1 : isMobile ? 2 : MAX_VISIBLE_CHIPS) => {
    const selectedSkills = selected
      .map((id) => skillOptions.find((s) => s.id === id)?.name)
      .filter(Boolean);

    if (!selectedSkills.length) {
      return (
        <Typography
          variant="body2"
          color={theme.palette.text.disabled}
          sx={{ fontStyle: "italic", py: 1 }}
        >
          No skills selected
        </Typography>
      );
    }

    const visible = selectedSkills.slice(0, maxVisible);
    const hidden = selectedSkills.length - visible.length;

    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, alignItems: "center" }}>
        {visible.map((name, idx) => (
          <Chip
            key={idx}
            label={name}
            size={isMobile ? "small" : "medium"}
            sx={{
              fontWeight: 500,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              height: { xs: 24, sm: 32 },
              "& .MuiChip-label": { px: { xs: 1, sm: 1.5 } },
              bgcolor: theme.palette.action.hover,
            }}
          />
        ))}
        {hidden > 0 && (
          <Tooltip title={selectedSkills.slice(maxVisible).join(", ")} placement="top" arrow>
            <Chip
              label={`+${hidden} more`}
              size={isMobile ? "small" : "medium"}
              sx={{
                bgcolor: theme.palette.action.selected,
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                height: { xs: 24, sm: 32 },
                cursor: "pointer",
                "&:hover": { bgcolor: theme.palette.action.hover },
              }}
            />
          </Tooltip>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <>
        <Header />
        <Container maxWidth="md" sx={{ mt: 2, mb: 3 }}>
          <Card elevation={1} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Skeleton variant="circular" width={isMobile ? 60 : 80} height={isMobile ? 60 : 80} />
                <Box>
                  <Skeleton variant="text" width={200} height={32} />
                  <Skeleton variant="text" width={150} height={24} />
                  <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 3, mt: 1 }} />
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
      <Container maxWidth="md" sx={{ mt: 2, mb: 3 }}>
        <Fade in timeout={600}>
          <Card
            elevation={isMobile ? 0 : 2}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              backgroundColor: theme.palette.background.paper,
              border: isMobile ? `1px solid ${theme.palette.divider}` : "none",
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {/* Header Section */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "center", sm: "flex-start" }} sx={{ mb: 3 }}>
                <Avatar
                  sx={{
                    width: { xs: 60, sm: 80, md: 100 },
                    height: { xs: 60, sm: 80, md: 100 },
                    bgcolor: theme.palette.primary.main,
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                    fontWeight: "bold",
                  }}
                >
                  {formik.values.name ? formik.values.name.charAt(0).toUpperCase() : "U"}
                </Avatar>
                <Box sx={{ textAlign: { xs: "center", sm: "left" }, flex: 1 }}>
                  <Typography variant={isMobile ? "h6" : isTablet ? "h5" : "h4"} fontWeight="700" sx={{ mb: 1, lineHeight: 1.2 }}>
                    {formik.values.name || "User Profile"}
                  </Typography>
                  <Chip
                    label={formik.values.is_active ? "Active" : "Inactive"}
                    color={formik.values.is_active ? "success" : "default"}
                    size={isMobile ? "small" : "medium"}
                    sx={{ fontWeight: 600, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  />
                </Box>
              </Stack>

              {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

              <form onSubmit={formik.handleSubmit}>
                {/* Account Information */}
                <Box sx={{ mb: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <PersonIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                    <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold">
                      Account Information
                    </Typography>
                  </Stack>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        margin="normal"
                        value={formik.values.name}
                        size={isMobile ? "small" : "medium"}
                        InputProps={{ readOnly: true }}
                        sx={{ "& .MuiOutlinedInput-root": { backgroundColor: theme.palette.action.hover } }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        margin="normal"
                        value={formik.values.email}
                        size={isMobile ? "small" : "medium"}
                        InputProps={{ readOnly: true }}
                        sx={{ "& .MuiOutlinedInput-root": { backgroundColor: theme.palette.action.hover } }}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Skills Section */}
                {role === Roles.DEVELOPER && (
                  <Box sx={{ mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <SkillIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
                      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold">Skills & Expertise</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={2}>
                      {/* Primary Skills */}
                      <Paper elevation={0}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: theme.palette.primary.main }} />
                          <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.primary.main}>Primary Skills</Typography>
                        </Stack>
                        <FormControl fullWidth disabled={!isEditing}>
                          <Select
                            multiple
                            name="primarySkill"
                            value={formik.values.primarySkill}
                            onChange={formik.handleChange}
                            size={isMobile ? "small" : "medium"}
                            input={<OutlinedInput label="Select Primary Skills" />}
                            renderValue={(selected) => renderChips(selected)}
                          >
                            {skillOptions.filter(s => !formik.values.secondarySkills.includes(s.id)).map(skill => (
                              <MenuItem key={skill.id} value={skill.id}>{skill.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Paper>

                      {/* Secondary Skills */}
                      <Paper elevation={0}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: theme.palette.primary.main }} />
                          <Typography variant="subtitle2" fontWeight="bold" color={theme.palette.primary.main}>Secondary Skills</Typography>
                        </Stack>
                        <FormControl fullWidth disabled={!isEditing}>
                          <Select
                            multiple
                            name="secondarySkills"
                            value={formik.values.secondarySkills}
                            onChange={formik.handleChange}
                            size={isMobile ? "small" : "medium"}
                            input={<OutlinedInput label="Select Secondary Skills" />}
                            renderValue={(selected) => renderChips(selected)}
                          >
                            {skillOptions.filter(s => !formik.values.primarySkill.includes(s.id)).map(skill => (
                              <MenuItem key={skill.id} value={skill.id}>{skill.name}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Paper>
                    </Stack>
                  </Box>
                )}

                {/* Manager Avg Score Section */}
                {role === Roles.MANAGER && (
                  <Box sx={{ mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                      <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="primary">Average Score Formula</Typography>
                    </Stack>
                    <Divider sx={{ mb: 2 }} />
                    <FormControl fullWidth disabled={!isEditing} error={Boolean(formik.touched.avgScoreList && formik.errors.avgScoreList)}>
                      <Select
                        multiple
                        name="avgScoreList"
                        value={formik.values.avgScoreList || []}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        size={isMobile ? "small" : "medium"}
                        input={<OutlinedInput label="Select Score Type" />}
                        renderValue={(selected) => (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {selected.map(value => <Chip key={value} label={ScoreTypeLabels[value]} />)}
                          </Box>
                        )}
                      >
                        {Object.entries(ScoreTypeLabels).map(([key, label]) => (
                          <MenuItem key={key} value={Number(key)}>{label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {/* Action Buttons */}
                {role && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", flexDirection: { xs: "column", sm: "row" }, gap: 2, pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    {isEditing ? (
                      <>
                        <Button onClick={handleCancel} color="inherit" variant="outlined" startIcon={<CancelIcon />} fullWidth={isMobile}>Cancel</Button>
                        <Button type="submit" variant="contained" startIcon={<SaveIcon />} fullWidth={isMobile} sx={{ background: theme.palette.primary.main, "&:hover": { background: theme.palette.primary.dark } }}>Save Changes</Button>
                      </>
                    ) : (
                      <Button variant="outlined" onClick={() => setIsEditing(true)} startIcon={<EditIcon />} fullWidth={isMobile}>Edit Profile</Button>
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
