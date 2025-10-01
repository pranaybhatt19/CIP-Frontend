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
import { addUser } from "../services/authentication";
import { toast } from "react-toastify";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";

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

const designationList = ["TSE", "ASE", "SE", "SSE", "TL", "STL", "APM", "PM"];

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address"
    )
    .required("Email is required"),
  designation: Yup.string().required("Designation is required"),
  years: Yup.number()
    .required("Years is required")
    .min(0, "Years cannot be negative"),
  months: Yup.number()
    .min(0, "Months cannot be negative")
    .when("years", {
      is: 0,
      then: (schema) =>
        schema
          .required("Months is required when years is 0")
          .min(1, "Months must be greater than 0 when years is 0"),
      otherwise: (schema) => schema.notRequired(),
    }),
  password: Yup.string()
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
      "Password must be at least 8 characters long, contain an uppercase, a lowercase, a number, and a special character"
    )
    .required("Password is required"),
  role: Yup.string().required("Role is required"),
});

export const AddUserModal = ({ open, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      designation: "",
      years: "",
      months: "",
      role: "developer",
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      const { years, months, ...restValues } = values;
      const safeMonths = months ?? 0;
      const formattedMonths = String(safeMonths).padStart(2, "0");
      const experience = parseFloat(`${years}.${formattedMonths}`);
      try {
        const res = await addUser({
          ...restValues,
          experience: experience,
          email: restValues.email.toLowerCase(),
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
        <h3 style={{ color: "#1976d2", marginBottom: "1.5rem" }}>
          Add New User
        </h3>

        <form onSubmit={formik.handleSubmit}>
          <Box sx={scrollbarStyles}>
            <TextField
              fullWidth
              label="Name"
              margin="normal"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              autoComplete="off"
              FormHelperTextProps={{
                sx: {
                  marginLeft: 0,
                  marginRight: 0,
                },
              }}
            />

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              autoComplete="off"
              FormHelperTextProps={{
                sx: {
                  marginLeft: 0,
                  marginRight: 0,
                },
              }}
            />

            <TextField
              fullWidth
              label="Password"
              margin="normal"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoComplete="new-password"
              FormHelperTextProps={{
                sx: {
                  marginLeft: 0,
                  marginRight: 0,
                },
              }}
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="designation-label">Designation</InputLabel>
              <Select
                labelId="designation-label"
                name="designation"
                value={formik.values.designation || ""}
                onChange={formik.handleChange}
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
                  <MenuItem key={item} value={item}>
                    {item}
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

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {/* Group Label */}
              <FormLabel
                sx={{ mb: 0, mt: 1, fontWeight: 600, fontSize: "14px" }}
              >
                Experience
              </FormLabel>
              <Box sx={{ display: "flex", gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="years-label">Years</InputLabel>
                  <Select
                    labelId="years-label"
                    name="years"
                    value={formik.values.years ?? ""}
                    onChange={formik.handleChange}
                    error={formik.touched.years && Boolean(formik.errors.years)}
                    input={<OutlinedInput label="Years" />}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: isMobile ? 250 : 250,
                        },
                      },
                    }}
                  >
                    {[...Array(51).keys()].map((year) => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.years && formik.errors.years && (
                    <Box
                      sx={{
                        color: "#d32f2f",
                        fontSize: 12,
                        mt: 0.5,
                        marginLeft: 0,
                      }}
                    >
                      {formik.errors.years}
                    </Box>
                  )}
                </FormControl>

                {/* Months Dropdown */}
                <FormControl fullWidth>
                  <InputLabel id="months-label">Months</InputLabel>
                  <Select
                    labelId="months-label"
                    name="months"
                    value={formik.values.months ?? ""}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.months && Boolean(formik.errors.months)
                    }
                    input={<OutlinedInput label="Months" />}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: isMobile ? 250 : 250,
                        },
                      },
                    }}
                  >
                    {[...Array(12).keys()].map((month) => (
                      <MenuItem key={month} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.months && formik.errors.months && (
                    <Box
                      sx={{
                        color: "#d32f2f",
                        fontSize: 12,
                        mt: 0.5,
                        marginLeft: 0,
                      }}
                    >
                      {formik.errors.months}
                    </Box>
                  )}
                </FormControl>
              </Box>
            </Box>

            {/* Role Selection */}
            <Paper
              variant="outlined"
              sx={{ p: 2, mt: 2, borderRadius: 2, borderColor: "grey.300" }}
            >
              <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                Select Role
              </FormLabel>
              <RadioGroup
                name="role"
                value={formik.values.role}
                onChange={formik.handleChange}
              >
                <FormControlLabel
                  value="manager"
                  control={<Radio />}
                  label="Manager"
                />
                <FormControlLabel
                  value="developer"
                  control={<Radio />}
                  label="Developer"
                />
              </RadioGroup>
              {formik.touched.role && formik.errors.role && (
                <Box sx={{ color: "red", fontSize: 12, mt: 1 }}>
                  {formik.errors.role}
                </Box>
              )}
            </Paper>
          </Box>

          <Box mt={4} display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose}>Cancel</Button>
            {/* <Button variant="contained" type="submit">
              Save
            </Button> */}
            <Button
              type="submit"
              variant="contained"
              disabled={formik.isSubmitting}
              aria-label="Save"
              sx={{ mt: 2, mb: 3 }}
            >
              {formik.isSubmitting ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress
                    size={20}
                    sx={{ color: "text.secondary" }}
                  />
                  <Typography sx={{ textTransform: "none" }}>
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
