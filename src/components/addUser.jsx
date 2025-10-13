import {
  Box,
  Button,
  Modal,
  TextField,
  FormControlLabel,
  RadioGroup,
  FormLabel,
  Radio,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  useTheme,
  useMediaQuery,
  MenuItem,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  addUser,
  getDesignations,
  getReportingPersons,
} from "../services/authentication";
import { decodeToken } from "../util/commonFunction";
import { toast } from "react-toastify";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useEffect, useState } from "react";

const scrollbarStyles = {
  px: 0,
  pr: 1.5,
  maxHeight: "62vh",
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
  width: 450,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
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

  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),

  designation: Yup.number()
    .nullable()
    .required("Designation is required")
    .typeError("Please select a valid designation"),

  experience: Yup.string()
    .required("Joining Date is required")
    .test(
      "valid-date",
      "Please select a valid date",
      (value) => !!value && !isNaN(Date.parse(value))
    )
    .test("not-in-future", "Joining Date cannot be in the future", (value) => {
      if (!value) return true;
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate <= today;
    }),

  reportingPerson: Yup.number()
    .nullable()
    .required("Reporting Manager is required")
    .typeError("Please select a valid reporting manager"),
});

export const AddUserModal = ({ open, onClose }) => {
  const [userId, setUserId] = useState(null);
  const [designationList, setDesignationList] = useState([]);
  const [reportingPersonList, setReportingPersonList] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        setReportingPersonList(res.data || []);
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
  }, []);

  const formik = useFormik({
    initialValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      designation: null,
      experience: null,
      reportingPerson: userId,
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      try {
        const res = await addUser({
          ...values,
          email: values.email.toLowerCase(),
        });
        toast.success("User added successfully!");
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

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant='h3'>
          Add New User
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

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              autoComplete="off"
              FormHelperTextProps={{
                sx: {
                  marginLeft: 0,
                  marginRight: 0,
                },
              }}
              sx={{ marginBottom: 0 }}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Joining Date"
                format="DD/MM/YYYY"
                onChange={(newValue) => {
                  formik.setFieldValue(
                    "experience",
                    newValue ? newValue.format("YYYY-MM-DD HH:mm:ss") : ""
                  );
                }}
                onClose={() => {
                  formik.setFieldTouched("experience", true);
                }}
                disableFuture
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    onBlur: () => formik.setFieldTouched("experience", true),
                    error:
                      formik.touched.experience &&
                      Boolean(formik.errors.experience),
                    helperText:
                      formik.touched.experience && formik.errors.experience,
                    sx: {
                      "& .MuiFormHelperText-root": {
                        marginLeft: 0,
                        marginRight: 0,
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>

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

            <FormControl fullWidth margin="normal">
              <InputLabel
                id="reporting-person-label"
                shrink={Boolean(formik.values.reportingPerson)}
              >
                Reporting Manager
              </InputLabel>

              <Select
                labelId="reporting-person-label"
                name="reportingPerson"
                value={formik.values.reportingPerson || ""}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.reportingPerson &&
                  Boolean(formik.errors.reportingPerson)
                }
                input={
                  <OutlinedInput
                    label="Reporting Manager"
                    notched={Boolean(formik.values.reportingPerson)}
                  />
                }
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: isMobile ? 250 : 300,
                    },
                  },
                }}
              >
                {reportingPersonList.map((item) => (
                  <MenuItem key={item.user_id} value={item.user_id}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>

              {formik.touched.reportingPerson &&
                formik.errors.reportingPerson && (
                  <Box
                    sx={{
                      color: "#d32f2f",
                      fontSize: 12,
                      mt: 0.5,
                      marginLeft: 0,
                    }}
                  >
                    {formik.errors.reportingPerson}
                  </Box>
                )}
            </FormControl>
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
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#fff", 
                  }}
                >
                  <CircularProgress
                    size={20}
                    sx={{
                      color: muiTheme.palette.common.white, 
                    }}
                  />
                  <Typography sx={{ color: muiTheme.palette.common.white, textTransform: "none" }}>
                    Creating User...
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

export default AddUserModal;
