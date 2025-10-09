import React, { useState } from "react";
import {
  Box,
  Button,
  Modal,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  // boxShadow: 24,
  p: 4,
  borderRadius: "12px",
  outline: "none",
};

export const AddLanguageModal = ({ open }) => {
  const [selectedLang, setSelectedLang] = useState("");
  const [otherValue, setOtherValue] = useState("");
  const [error, setError] = useState("");

  const languageRegex = /^[A-Za-z]+$/;

  const handleOtherValueChange = (e) => {
    const val = e.target.value;

    if (val === "" || /^[A-Za-z]+$/.test(val)) {
      setOtherValue(val);

      if (val.length > 0 && val.length < 3) {
        setError("Enter at least 3 letters");
      } else {
        setError("");
      }
    } else {
      setError("Only letters are allowed");
    }
  };

  const handleSave = () => {
    const valueToSave = selectedLang === "others" ? otherValue : selectedLang;
    toast.success(`Saved: ${valueToSave}`);
    // Add your save logic here
  };

  // Disable Save if nothing selected or invalid input
  const isSaveDisabled =
    !selectedLang ||
    (selectedLang === "others" &&
      (!otherValue ||
        !languageRegex.test(otherValue) ||
        otherValue.length < 3));

  return (
    <Modal
      open={open}
      disableEscapeKeyDown
      BackdropProps={{
        sx: { backgroundColor: "rgba(0, 0, 0, 0.5)" }, // 50% dark overlay
      }}
      // hideBackdrop
      aria-labelledby="language-modal"
      aria-describedby="select-language"
    >
      <Box sx={style}>
        <h3 style={{ color: "#2a9d8f", marginBottom: "1.5rem" }}>
          Update Language
        </h3>

        <Typography variant="body2" mb={2} color="text.secondary">
          Select your Schooling Language Medium. If you choose “Others”, enter
          it below.
        </Typography>

        <RadioGroup
          value={selectedLang}
          onChange={(e) => {
            setSelectedLang(e.target.value);
            setError("");
            if (e.target.value !== "others") setOtherValue("");
          }}
        >
          <FormControlLabel
            value="gujarati"
            control={<Radio />}
            label="Gujarati"
          />
          <FormControlLabel
            value="english"
            control={<Radio />}
            label="English"
          />
          <FormControlLabel value="others" control={<Radio />} label="Others" />
        </RadioGroup>

        {selectedLang === "others" && (
          <TextField
            label="Enter Language"
            value={otherValue}
            onChange={handleOtherValueChange}
            fullWidth
            margin="normal"
            error={!!error}
            helperText={error}
          />
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={handleSave}
          sx={{ mt: 2 }}
          disabled={isSaveDisabled}
        >
          Save
        </Button>
      </Box>
    </Modal>
  );
};

export default AddLanguageModal;
