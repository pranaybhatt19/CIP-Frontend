import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  CircularProgress,
  Typography,
  TextField,
  FormControl,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { addPractice } from "../services/authentication";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { useParams } from "react-router-dom";

dayjs.extend(utc);

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

// ✅ Yup validation schema
const validationSchema = Yup.object({
  datetime: Yup.mixed()
    .required("Date & Time is required")
    .test("is-valid-date", "Please enter a valid date", (value) => {
      if (!value) return false;
      return dayjs.isDayjs(value) && value.isValid();
    })
    .test("not-in-future", "Date & Time cannot be in the future", (value) => {
      if (!value || !dayjs.isDayjs(value)) return true;
      return (
        dayjs(value).isBefore(dayjs()) || dayjs(value).isSame(dayjs(), "second")
      );
    }),
  link: Yup.string().url("Enter a valid URL").required("Link is required"),
  feedback: Yup.string(),
});

const AddPracticeModal = ({ open, onClose, onSubmitSuccess }) => {
  const { id } = useParams();
  const [dateError, setDateError] = useState("");

  const formik = useFormik({
    initialValues: {
      datetime: dayjs().subtract(5, "minute"),
      link: "",
      feedback: "",
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const datetimeISO = dayjs(values.datetime)
          .utc(true)
          .startOf("minute")
          .toISOString();
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
    setDateError("");
    onClose();
  };

  // ✅ Real-time validation while typing or picking date/time
  const handleDateTimeChange = (newValue) => {
    if (!newValue || !dayjs(newValue).isValid()) {
      setDateError("Please enter a valid date");
    } else if (dayjs(newValue).isAfter(dayjs())) {
      setDateError("Date & Time cannot be in the future");
    } else {
      setDateError("");
    }

    formik.setFieldValue("datetime", newValue);
    formik.setFieldTouched("datetime", true, true);
  };

  const combinedError =
    dateError ||
    (formik.touched.datetime && formik.errors.datetime
      ? formik.errors.datetime
      : "");

  return (
    <Modal open={open} onClose={handleClose} closeAfterTransition>
      <Box sx={modalStyle}>
        <Typography
          variant="h3"
          sx={{  textAlign: "left" }}

        >
          Add Practice
        </Typography>
        
        <form onSubmit={formik.handleSubmit}>
          <Box sx={scrollbarStyles}>
            {/* ✅ Date & Time Picker */}
            <FormControl fullWidth margin="normal">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Date & Time"
                  value={formik.values.datetime}
                  onChange={handleDateTimeChange}
                  onError={(reason) => {
                    if (reason === "invalidDate")
                      setDateError("Please enter a valid date");
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      error: Boolean(combinedError),
                      helperText: combinedError,
                    },
                  }}
                  format="DD/MM/YYYY HH:mm"
                  maxDateTime={dayjs()}
                />
              </LocalizationProvider>
            </FormControl>

            <TextField
              fullWidth
              label="Link*"
              margin="normal"
              name="link"
              value={formik.values.link}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.link && Boolean(formik.errors.link)}
              helperText={formik.touched.link && formik.errors.link}
            />

            <TextField
              fullWidth
              label="Summary"
              margin="normal"
              multiline
              rows={4}
              name="feedback"
              value={formik.values.feedback}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
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
              disabled={formik.isSubmitting || Boolean(dateError)}
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
