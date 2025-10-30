import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  CircularProgress,
  Switch,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { toast } from "react-toastify";
import {
  getDesignations,
  getReportingPersons,
  updateUser,
} from "../services/authentication";
import { useFormik } from "formik";
import * as Yup from "yup";
import { decodeToken } from "../util/commonFunction";
import { filter } from "lodash";

const style = {
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
  firstName: Yup.string()
    .trim()
    .matches(
      /^[A-Za-z]+$/,
      "First Name must contain only alphabets and no spaces"
    )
    .max(50, "First Name must be at most 50 characters long")
    .required("First Name is required"),

  middleName: Yup.string()
    .trim()
    .matches(
      /^[A-Za-z]+$/,
      "Middle Name must contain only alphabets and no spaces"
    )
    .max(50, "Middle Name must be at most 50 characters long")
    .required("Middle Name is required"),

  lastName: Yup.string()
    .trim()
    .matches(
      /^[A-Za-z]+$/,
      "Last Name must contain only alphabets and no spaces"
    )
    .max(50, "Last Name must be at most 50 characters long")
    .required("Last Name is required"),

  designation: Yup.number()
    .nullable()
    .required("Designation is required")
    .typeError("Please select a valid designation"),

  reportingPerson: Yup.number()
    .nullable()
    .required("Reporting Officer is required")
    .typeError("Please select a valid reporting officer"),
});

const EditUserModal = ({
  open,
  onClose,
  userData,
  currentUserId,
  onUpdated,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [userId, setUserId] = useState(null);
  const [designationList, setDesignationList] = useState([]);
  const [reportingPersonList, setReportingPersonList] = useState([]);
  const [educationMedium, setEducationMedium] = useState("");
  const [otherValue, setOtherValue] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const isSelf = userData?.user_id === currentUserId;

  const fetchDesignations = async () => {
    try {
      await getDesignations().then((res) => {
        setDesignationList(res.data || []);
      });
    } catch (err) {
      if (err.status != 409) {
        toast.error(err.message || "Failed to fetch data");
      }
    }
  };

  const fetchReportingPersons = async () => {
    try {
      await getReportingPersons().then((res) => {
        console.log("user", userId);
        const filtered = (res.data || []).filter(
          (item) => item.id !== userData?.user_id
        );
        setReportingPersonList(filtered);
      });
    } catch (err) {
      if (err.status != 409) {
        toast.error(err.message || "Failed to fetch data");
      }
    }
  };

  useEffect(() => {
    const decodedToken = decodeToken();
    fetchDesignations();
    fetchReportingPersons();
    if (decodedToken?.sub) setUserId(decodedToken.sub);
    if (!userData) return;
    const medium = userData.education_medium?.toLowerCase() || "";
    if (medium === "gujarati" || medium === "english") {
      setEducationMedium(medium);
      setOtherValue("");
    } else if (medium) {
      setEducationMedium("others");
      setOtherValue(medium.charAt(0).toUpperCase() + medium.slice(1));
    } else {
      setEducationMedium("");
      setOtherValue("");
    }

    // set active/inactive status
    setIsActive(userData.active_status ?? true);

    setError("");
  }, [userData]);

  useEffect(() => {
    if (userData) {
      formik.resetForm({ values: initialValues });
    }
  }, [userData]);

  const initialValues = useMemo(
    () => ({
      id: userData?.user_id,
      firstName: userData?.first_name || "",
      middleName: userData?.middle_name || "",
      lastName: userData?.last_name || "",
      designation: userData?.designation?.id || "",
      reportingPerson: userData?.reporting_person?.id,
    }),
    [userData]
  );

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const res = await updateUser({
          ...values,
          educationLanguage:
            educationMedium === "others" ? otherValue : educationMedium,
          status: isActive,
        });
        toast.success("User updated successfully!");
        resetForm();
        onClose();
      } catch (err) {
        toast.error(err.message || "Failed to add user");
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true,
  });

  if (!userData) return null;

  const languageRegex = /^[A-Za-z]+$/;

  const isSaveDisabled =
    educationMedium === "others" &&
    (!otherValue || !languageRegex.test(otherValue) || otherValue.length < 3);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h3" mb={1.5}>
          Edit User
        </Typography>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={scrollbarStyles}>
            <TextField
              fullWidth
              label="First Name"
              margin="normal"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.firstName && Boolean(formik.errors.firstName)
              }
              helperText={formik.touched.firstName && formik.errors.firstName}
              autoComplete="off"
              FormHelperTextProps={{
                sx: {
                  marginLeft: 0,
                  marginRight: 0,
                },
              }}
              sx={{ marginBottom: 0 }}
            />

            <TextField
              fullWidth
              label="Middle Name"
              margin="normal"
              name="middleName"
              value={formik.values.middleName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.middleName && Boolean(formik.errors.middleName)
              }
              helperText={formik.touched.middleName && formik.errors.middleName}
              autoComplete="off"
              FormHelperTextProps={{
                sx: {
                  marginLeft: 0,
                  marginRight: 0,
                },
              }}
              sx={{ marginBottom: 0 }}
            />

            <TextField
              fullWidth
              label="Last Name"
              margin="normal"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              autoComplete="off"
              FormHelperTextProps={{
                sx: {
                  marginLeft: 0,
                  marginRight: 0,
                },
              }}
              sx={{ marginBottom: 0 }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="designation-label">Designation</InputLabel>
              <Select
                labelId="designation-label"
                name="designation"
                value={formik.values.designation || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.designation &&
                  Boolean(formik.errors.designation)
                }
                input={<OutlinedInput label="Designation" />}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: isMobile ? 250 : 300,
                    },
                  },
                }}
              >
                {designationList.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.designation && formik.errors.designation && (
                <Box
                  sx={{
                    color: "#d32f2f",
                    fontSize: 12,
                    mt: 0.5,
                    marginLeft: 0,
                  }}
                >
                  {formik.errors.designation}
                </Box>
              )}
            </FormControl>

            <FormControl fullWidth margin="normal" size="small">
              <Autocomplete
                options={reportingPersonList}
                getOptionLabel={(option) => option.name || ""}
                value={
                  reportingPersonList.find(
                    (item) => item.id === formik.values.reportingPerson
                  ) || null
                }
                onChange={(event, newValue) => {
                  formik.setFieldValue(
                    "reportingPerson",
                    newValue ? newValue.id : ""
                  );
                }}
                onBlur={() => formik.setFieldTouched("reportingPerson", true)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Reporting Officer"
                    error={
                      formik.touched.reportingPerson &&
                      Boolean(formik.errors.reportingPerson)
                    }
                    helperText={
                      formik.touched.reportingPerson &&
                      formik.errors.reportingPerson
                    }
                  />
                )}
                ListboxProps={{
                  style: { maxHeight: isMobile ? 250 : 300, overflowY: "auto" },
                }}
              />
            </FormControl>

            <Box
              mt={2}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography variant="subtitle1">Status</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    disabled={isSelf}
                  />
                }
                label={isActive ? "Active" : "Inactive"}
              />
            </Box>

            <Typography variant="subtitle1" mt={2} mb={1}>
              Medium of Education
            </Typography>

            <RadioGroup
              value={educationMedium}
              onChange={(e) => {
                setEducationMedium(e.target.value);
                setError("");
                if (e.target.value !== "others") setOtherValue("");
              }}
            >
              <FormControlLabel
                value="gujarati"
                control={<Radio />}
                label="Gujarati"
                disabled={isSelf}
              />
              <FormControlLabel
                value="english"
                control={<Radio />}
                label="English"
                disabled={isSelf}
              />
              <FormControlLabel
                value="others"
                control={<Radio />}
                label="Others"
                disabled={isSelf}
              />
            </RadioGroup>

            {educationMedium === "others" && (
              <TextField
                label="Enter Language"
                value={otherValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "" || languageRegex.test(val)) {
                    setOtherValue(val);
                    if (val.length > 0 && val.length < 3) {
                      setError("Enter at least 3 letters");
                    } else {
                      setError("");
                    }
                  } else {
                    setError("Only letters are allowed");
                  }
                }}
                fullWidth
                margin="normal"
                error={!!error}
                helperText={error}
                disabled={isSelf}
              />
            )}

            {isSelf && (
              <Typography sx={{ color: "red", fontSize: 14, mt: 1 }}>
                You cannot update your own details or status.
              </Typography>
            )}
          </Box>

          <Box mt={4} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose} variant="outlined">
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || isSaveDisabled}
            >
              {formik.isSubmitting ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#fff",
                  }}
                >
                  <CircularProgress size={20} sx={{ color: "#fff" }} />
                  <Typography sx={{ textTransform: "none" }}>
                    Saving...
                  </Typography>
                </Box>
              ) : (
                "Save Changes"
              )}
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default EditUserModal;
