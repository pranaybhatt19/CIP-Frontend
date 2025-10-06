import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function PracticeFilterDrawer({
  open,
  onClose,
  exactDate,
  fromDate,
  toDate,
  onApply, // function to trigger API call
}) {
  // Local state inside drawer
  const [localExactDate, setLocalExactDate] = useState(exactDate);
  const [localFromDate, setLocalFromDate] = useState(fromDate);
  const [localToDate, setLocalToDate] = useState(toDate);

  // Keep local state in sync if parent state changes
  useEffect(() => {
    setLocalExactDate(exactDate);
    setLocalFromDate(fromDate);
    setLocalToDate(toDate);
  }, [exactDate, fromDate, toDate]);

  const handleClear = () => {
    setLocalExactDate(null);
    setLocalFromDate(null);
    setLocalToDate(null);
  };

  const handleApply = () => {
    // Call parent onApply with local values only when Apply clicked
    onApply({
      exactDate: localExactDate,
      fromDate: localFromDate,
      toDate: localToDate,
    });
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 320, p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h5" sx={{ color: "#1976d2", fontWeight: "bold" }}>
            Filters
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: "#1976d2" }} />
          </IconButton>
        </Box>

        {/* Date Pickers */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Exact Date"
            format="DD/MM/YYYY"
            value={localExactDate ? dayjs(localExactDate) : null}
            onChange={(newValue) => setLocalExactDate(newValue?.toISOString() || null)}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 3 } } }}
            maxDate={dayjs()}
          />
          <DatePicker
            label="From Date"
            format="DD/MM/YYYY"
            value={localFromDate ? dayjs(localFromDate) : null}
            onChange={(newValue) => setLocalFromDate(newValue?.toISOString() || null)}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 3 } } }}
            maxDate={localToDate ? dayjs(localToDate) : dayjs()}
          />
          <DatePicker
            label="To Date"
            format="DD/MM/YYYY"
            value={localToDate ? dayjs(localToDate) : null}
            onChange={(newValue) => setLocalToDate(newValue?.toISOString() || null)}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 3 } } }}
            minDate={localFromDate ? dayjs(localFromDate) : undefined}
            maxDate={dayjs()}
          />
        </LocalizationProvider>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleClear}
            sx={{ fontWeight: "bold" }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ fontWeight: "bold" }}
            onClick={handleApply} // apply only on click
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
