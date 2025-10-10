import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  CircularProgress,
  Typography,
  TextField,
  FormControl,
  FormLabel,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addPractice } from "../services/authentication";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useParams } from "react-router-dom";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 450,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
};

const scrollbarStyles = {
  px: 0,
  pr: 1.5,
  maxHeight: "62vh",
  overflowY: "auto",
  "&::-webkit-scrollbar": { width: "5px" },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f5f5f5",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#d6d6d6",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#555" },
};

const validationSchema = Yup.object({
  datetime: Yup.date().required("Date & Time is required"),
  link: Yup.string().url("Enter a valid URL").required("Link is required"),
  feedback: Yup.string(),
});

const AddPracticeModal = ({ open, onClose, onSubmitSuccess }) => {
  const [initialDateTime] = useState(dayjs().subtract(5, "minute"));
  const { id } = useParams();
  const formik = useFormik({
    initialValues: {
      datetime: initialDateTime,
      link: "",
      feedback: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const datetimeISO = dayjs(values.datetime).toISOString();
        await addPractice({
          id: +id,
          date: datetimeISO,
          link: values.link,
          feedback: values.feedback,
        });
        toast.success("Practice added successfully!");
        resetForm();
        if (onSubmitSuccess) onSubmitSuccess();
        onClose();
      } catch (err) {
        toast.error(err.message || "Failed to add practice");
      } finally {
        setSubmitting(false);
      }
    },
  });
  const handleClose = () => {
    formik.resetForm();
    onClose();
  };
  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
      <Box sx={modalStyle}>
        <Typography
          variant="h3"
          sx={{ mb: 3, fontWeight: 700, textAlign: "left" }}
        >
          Add Practice
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Box sx={scrollbarStyles}>
            {/* Date & Time with proper label */}
            <FormControl fullWidth margin="normal">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Date & Time"
                  value={formik.values.datetime}
                  onChange={(newValue) => {
                    // Always update Formik field
                    formik.setFieldValue("datetime", newValue);
                    formik.setFieldTouched("datetime", true);

                    // Custom future-date validation
                    if (newValue && dayjs(newValue).isAfter(dayjs())) {
                      formik.setFieldError("datetime", "Future date/time not allowed");
                    } else {
                      formik.setFieldError("datetime", undefined);
                    }
                  }}
                  onBlur={() => formik.setFieldTouched("datetime", true)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      error: formik.touched.datetime && Boolean(formik.errors.datetime),
                    },
                  }}
                  format="DD/MM/YYYY HH:mm"
                  disableFuture
                />
                {formik.touched.datetime && formik.errors.datetime && (
                  <Typography variant="caption" color="error" sx={{ ml: 0.5 }}>
                    {formik.errors.datetime}
                  </Typography>
                )}
              </LocalizationProvider>
            </FormControl>

            <TextField
              fullWidth
              label="Link*"
              margin="normal"
              name="link"
              value={formik.values.link}
              onChange={formik.handleChange}
              error={formik.touched.link && Boolean(formik.errors.link)}
              helperText={formik.touched.link && formik.errors.link}
            />

            <TextField
              fullWidth
              label="Feedback"
              margin="normal"
              multiline
              rows={4}
              name="feedback"
              value={formik.values.feedback}
              onChange={formik.handleChange}
              error={formik.touched.feedback && Boolean(formik.errors.feedback)}
              helperText={formik.touched.feedback && formik.errors.feedback}
            />
          </Box>

          <Box mt={4} display="flex" justifyContent="flex-end" gap={1}>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              sx={{ textTransform: "none" }}
            >
              {formik.isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: "white" }} />
                  Saving...
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
