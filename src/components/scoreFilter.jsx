import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  InputAdornment,
  FormControl,
  Tooltip,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const ScoreFilter = ({ label, value, type, onChange }) => {
  const [localValue, setLocalValue] = useState(value || "");
  const [localType, setLocalType] = useState(type || "EQUALS");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  useEffect(() => {
    setLocalType(type || "EQUALS");
  }, [type]);

  const handleValueChange = (e) => {
    let val = e.target.value;

    // Allow only numbers with up to 2 decimals
    if (/^\d*\.?\d{0,2}$/.test(val)) {
      if (val === "" || (parseFloat(val) >= 1 && parseFloat(val) <= 5)) {
        setLocalValue(val);

        onChange({
          type: localType,
          value: val,
        });
      }
    }
  };

  const handleTypeChange = (e) => {
    const selected = e.target.value;
    setLocalType(selected);

    onChange({
      type: selected,
      value: localValue,
    });
  };

  return (
    <TextField
      fullWidth
      sx={{ mb: 2 }}
      type="text"
      label={label}
      value={localValue}
      onChange={handleValueChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" sx={{ mr: 1 }}>
            <Select
              value={localType}
              onChange={handleTypeChange}
              variant="standard"
              disableUnderline
              sx={{
                fontSize: "14px",
                minWidth: "40px",
                "& .MuiSelect-select": { p: 0 },
              }}
            >
              <MenuItem value="GREATER_THAN">{">"}</MenuItem>
              <MenuItem value="LESS_THAN">{"<"}</MenuItem>
              <MenuItem value="EQUALS">{"="}</MenuItem>
            </Select>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default ScoreFilter;
