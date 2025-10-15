import React, { useEffect, useState } from "react";
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { toast } from "react-toastify";
import { updateUser } from "../services/authentication";

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

const EditUserModal = ({
  open,
  onClose,
  userData,
  currentUserId,
  onUpdated,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [educationMedium, setEducationMedium] = useState(""); // 'gujarati' | 'english' | 'others'
  const [otherValue, setOtherValue] = useState(""); // only for others
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSelf = userData?.user_id === currentUserId;

  useEffect(() => {
    if (!userData) return;
    const medium = userData.education_medium?.toLowerCase() || "";
    if (medium === "gujarati" || medium === "english") {
      setEducationMedium(medium);
      setOtherValue("");
    } else if (medium) {
      setEducationMedium("others");
      setOtherValue(medium);
    } else {
      setEducationMedium("");
      setOtherValue("");
    }
    setError("");
  }, [userData]);

  const handleSubmit = async () => {
    try {
      if (!userData) return;
      setIsSubmitting(true);

      const payload = {
        id: userData.user_id,
        educationLanguage:
          educationMedium === "others" ? otherValue : educationMedium,
      };

      await updateUser(payload);
      toast.success("User updated successfully!");
      onUpdated?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData) return null;

  const languageRegex = /^[A-Za-z]+$/;

  // Disable Save if "Others" is selected and input is empty or invalid
  const isSaveDisabled =
    educationMedium === "others" &&
    (!otherValue || !languageRegex.test(otherValue) || otherValue.length < 3);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Typography variant="h3" mb={1.5}>
          Edit User
        </Typography>

        <Box sx={scrollbarStyles}>
          <TextField
            fullWidth
            label="Full Name"
            value={userData.full_name || ""}
            disabled
            margin="normal"
            autoComplete="off"
            sx={{ marginBottom: 0 }}
          />

          <TextField
            fullWidth
            label="Designation"
            value={userData.designation?.name || ""}
            disabled
            margin="normal"
            autoComplete="off"
            sx={{ marginBottom: 0 }}
          />

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
              You cannot update your own medium of education.
            </Typography>
          )}
        </Box>

        <Box mt={4} display="flex" justifyContent="flex-end" gap={1}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting || isSaveDisabled}
          >
            {isSubmitting ? (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, color: "#fff" }}
              >
                <CircularProgress size={20} sx={{ color: theme.palette.common.white }} />
                <Typography sx={{ color: theme.palette.common.white, textTransform: "none" }}>
                  Saving...
                </Typography>
              </Box>
            ) : (
              "Save Changes"
            )}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default EditUserModal;
