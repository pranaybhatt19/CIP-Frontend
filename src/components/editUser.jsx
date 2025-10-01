import {
  Box,
  Button,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  Paper,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Typography,
  Radio,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { updateUser } from "../services/authentication";
import { toast } from "react-toastify";

const scrollbarStyles = {
  px: 0,
  pr: 1.5,
  maxHeight: "40vh",
  overflowY: "auto",
  "&::-webkit-scrollbar": {
    width: "5px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f5f5f5",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#d6d6d6",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: "#555",
  },
};

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
};

const validationSchema = Yup.object({
  primary_skills_ids: Yup.array().min(1, "Select at least one primary skill"),
  secondary_skills_ids: Yup.array(),
  is_active: Yup.string().required("Status is required"),
});

export const EditUserModal = ({
  open,
  onClose,
  userData,
  skillOptions = [],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formik = useFormik({
    initialValues: {
      user_id: userData?.user_id || null,
      username: userData?.name || "",
      primary_skills_ids: userData?.primary_skills?.map((s) => s.id) || [],
      secondary_skills_ids: userData?.secondary_skills?.map((s) => s.id) || [],
      is_active: userData?.is_active ?? true,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = {
          id: values.user_id,
          primarySkill: values.primary_skills_ids,
          secondarySkill: values.secondary_skills_ids,
          status: values.is_active,
        };
        const res = await updateUser(payload);
        toast.success("User updated successfully!");
        resetForm();
        onClose();
      } catch (err) {
        toast.error(err.message || "Failed to update user");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography
          variant="h6"
          mb={2}
          style={{ color: "#1976d2", marginBottom: "1.5rem" }}
        >
          <h3>
            Edit User: &nbsp;<strong>{formik.values.username}</strong>
          </h3>
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Box sx={scrollbarStyles}>
            {/* Primary Skills */}
            <FormControl
              fullWidth
              margin="normal"
              error={Boolean(
                formik.touched.primary_skills_ids &&
                  formik.errors.primary_skills_ids
              )}
            >
              <InputLabel id="primary-skills-label">Primary Skills</InputLabel>
              <Select
                labelId="primary-skills-label"
                id="primary_skills_ids"
                multiple
                name="primary_skills_ids"
                value={formik.values.primary_skills_ids || []}
                onChange={(e) =>
                  formik.setFieldValue("primary_skills_ids", e.target.value)
                }
                input={<OutlinedInput label="Primary Skills" />}
                renderValue={(selectedIds) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selectedIds.map((id) => {
                      const skill = skillOptions.find((s) => s.id === id);
                      return <Chip key={id} label={skill?.name || ""} />;
                    })}
                  </Box>
                )}
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
                      !formik.values.secondary_skills_ids.includes(skill.id)
                  ) // exclude secondary skills
                  .map((skill) => (
                    <MenuItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </MenuItem>
                  ))}
              </Select>
              {formik.touched.primary_skills_ids &&
                formik.errors.primary_skills_ids && (
                  <Box sx={{ color: "red", fontSize: 12, mt: 0.5 }}>
                    {formik.errors.primary_skills_ids}
                  </Box>
                )}
            </FormControl>

            {/* Secondary Skills */}
            <FormControl
              fullWidth
              margin="normal"
              error={Boolean(
                formik.touched.secondary_skills_ids &&
                  formik.errors.secondary_skills_ids
              )}
            >
              <InputLabel id="secondary-skills-label">
                Secondary Skills
              </InputLabel>
              <Select
                labelId="secondary-skills-label"
                id="secondary_skills_ids"
                multiple
                name="secondary_skills_ids"
                value={formik.values.secondary_skills_ids || []}
                onChange={(e) =>
                  formik.setFieldValue("secondary_skills_ids", e.target.value)
                }
                input={<OutlinedInput label="Secondary Skills" />}
                renderValue={(selectedIds) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selectedIds.map((id) => {
                      const skill = skillOptions.find((s) => s.id === id);
                      return <Chip key={id} label={skill?.name || ""} />;
                    })}
                  </Box>
                )}
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
                      !formik.values.primary_skills_ids.includes(skill.id)
                  ) // exclude secondary skills
                  .map((skill) => (
                    <MenuItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </MenuItem>
                  ))}
              </Select>
              {formik.touched.secondary_skills_ids &&
                formik.errors.secondary_skills_ids && (
                  <Box sx={{ color: "red", fontSize: 12, mt: 0.5 }}>
                    {formik.errors.secondary_skills_ids}
                  </Box>
                )}
            </FormControl>

            {/* Status */}
            <Paper
              variant="outlined"
              sx={{ p: 2, mt: 2, borderRadius: 2, borderColor: "grey.300" }}
            >
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                Account Status
              </FormLabel>
              <RadioGroup
                name="is_active"
                value={formik.values.is_active}
                onChange={(e) =>
                  formik.setFieldValue("is_active", e.target.value === "true")
                }
                row
              >
                <FormControlLabel
                  value={true}
                  control={<Radio />}
                  label="Active"
                />
                <FormControlLabel
                  value={false}
                  control={<Radio />}
                  label="Inactive"
                />
              </RadioGroup>
            </Paper>
          </Box>

          <Box mt={4} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              aria-label="Save"
            >
              {formik.isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress
                    size={20}
                    sx={{ color: "text.secondary" }}
                  />
                  <Typography sx={{ textTransform: "none" }}>
                    Updating User...
                  </Typography>
                </Box>
              ) : (
                "Save"
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default EditUserModal;
