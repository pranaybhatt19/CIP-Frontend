import {
  Box,
  Button,
  Modal,
  TextField,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect } from "react";
// import { addCommunicationPractice } from "../services/communication"; 
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

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

const style = (theme) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: theme.palette.background.paper,
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
});

const validationSchema = Yup.object({
  date: Yup.date().required("Date & Time of Practice is required"),
  link: Yup.string()
    .required("Link is required")
    .url("Please enter a valid URL (e.g. https://example.com)"),
});

export const AddPracticeModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const formik = useFormik({
    initialValues: {
      date: dayjs()
        .minute(Math.floor(dayjs().minute() / 5) * 5)
        .second(0)
        .format("YYYY-MM-DD HH:mm:ss"),
      link: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const payload = { ...values };
        await addCommunicationPractice(payload); // call your API
        resetForm();
        onClose();
        toast.success("Practice added successfully!");
      } catch (err) {
        toast.error(err.message || "Failed to add practice");
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (!open) formik.resetForm();
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style(theme)}>
        <Typography variant="h5" sx={{ color: theme.palette.primary.main, mb: 2 }}>
          Add Communication Practice
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={scrollbarStyles}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Date & Time of Practice"
                format="DD/MM/YYYY HH:mm"
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
                  <CircularProgress size={20} sx={{ color: muiTheme.palette.common.white }} />
                  <Typography sx={{ color: muiTheme.palette.common.white, textTransform: "none" }}>Adding...</Typography>
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

export default AddPracticeModal;
