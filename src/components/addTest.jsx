import {
  Box,
  Button,
  Modal,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  OutlinedInput,
  ListItemText,
  useMediaQuery,
  useTheme,
  InputAdornment,
  Tooltip,
  IconButton,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { addTest, getUserInfo } from "../services/authentication";
import { getSkills } from "../services/authentication";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const scrollbarStyles = {
  px: 0,
  pr: 1.5,
  maxHeight: "60vh",
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
  interviewType: Yup.string().required("Please select an interview type"),
  date: Yup.date().required("Date of interview is required"),
  link: Yup.string()
    .required()
    .url("Please enter a valid URL (e.g. https://example.com)"),
  result_json: Yup.string()
    .required("Result(Json) is required")
    .test("is-json", "Must be valid JSON", (value) => {
      if (!value) return false;
      try {
        JSON.parse(value);
        return true;
      } catch (err) {
        return false;
      }
    }),
});

const interviewTypes = [
  { id: "technical", name: "Technical" },
  { id: "soft-skill", name: "Soft Skill" },
  { id: "mixed", name: "Mixed" },
];

export const AddTestModal = ({ open, onClose }) => {
  const [techStacks, setTechStacks] = useState([]);
  const [defaultSkillId, setDefaultSkillId] = useState("");
  const { id } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formik = useFormik({
    initialValues: {
      interviewType: "mixed",
      date: dayjs()
        .subtract(5, "minute")
        .minute(Math.floor(dayjs().subtract(5, "minute").minute() / 5) * 5)
        .second(0)
        .format("YYYY-MM-DD HH:mm:ss"),
      link: "",
      result_json: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const parsed = JSON.parse(values.result_json);
        const payload = {
          ...values,
          id: +id,
          result_json: parsed,
        };
        const res = await addTest(payload);
        toast.success("Test added successfully!");
        resetForm();
        onClose();
      } catch (err) {
        toast.error(err.message || "Failed to add test");
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });
  useEffect(() => {
    if (!open) {
      formik.resetForm();
    }
  }, [open]);
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <h3 style={{ color: "#1976d2", marginBottom: "1.5rem" }}>
          Add New Test
        </h3>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={scrollbarStyles}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="interview-type-label">Interview Type</InputLabel>
              <Select
                labelId="interview-type-label"
                name="interviewType"
                value={formik.values.interviewType}
                onChange={formik.handleChange}
                error={
                  formik.touched.interviewType &&
                  Boolean(formik.errors.interviewType)
                }
                input={<OutlinedInput label="Interview Type" />}
              >
                {interviewTypes.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    <ListItemText primary={item.name} />
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.interviewType && formik.errors.interviewType && (
                <Box
                  sx={{
                    color: "#d32f2f",
                    fontSize: 12,
                    mt: 0.5,
                    marginLeft: 2,
                  }}
                >
                  {formik.errors.interviewType}
                </Box>
              )}
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Date & Time of Interview"
                format="DD/MM/YYYY hh:mm A"
                value={formik.values.date ? dayjs(formik.values.date) : dayjs()}
                onChange={(newValue) => {
                  formik.setFieldValue(
                    "date",
                    newValue ? newValue.format("YYYY-MM-DD HH:mm:ss") : ""
                  );
                }}
                disableFuture
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    error: formik.touched.date && Boolean(formik.errors.date),
                    helperText: formik.touched.date && formik.errors.date,
                  },
                }}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              label="Link"
              margin="normal"
              name="link"
              value={formik.values.link}
              onChange={formik.handleChange}
              error={formik.touched.link && Boolean(formik.errors.link)}
              helperText={formik.touched.link && formik.errors.link}
            />

            <TextField
              fullWidth
              label="Result (JSON)"
              margin="normal"
              multiline
              rows={6}
              name="result_json"
              value={formik.values.result_json}
              onChange={formik.handleChange}
              error={
                formik.touched.result_json && Boolean(formik.errors.result_json)
              }
              helperText={
                formik.touched.result_json && formik.errors.result_json
              }
            />
          </Box>
          <Box mt={4} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>
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
                    Adding Test...
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

export default AddTestModal;
