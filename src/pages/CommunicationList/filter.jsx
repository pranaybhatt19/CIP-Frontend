import React from "react";
import { Drawer, Box, Typography, IconButton, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function filter({
  open,
  onClose,
  exactDate,
  setExactDate,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}) {
  const handleClear = () => {
    setExactDate(null);
    setFromDate(null);
    setToDate(null);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 300, p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h5" sx={{ color: "#1976d2" }}>Filters</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: "#1976d2" }} />
          </IconButton>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Exact Date"
            format="DD/MM/YYYY"
            value={exactDate ? dayjs(exactDate) : null}
            onChange={(newValue) => setExactDate(newValue?.toISOString() || null)}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
            maxDate={dayjs()}
          />
          <DatePicker
            label="From Date"
            format="DD/MM/YYYY"
            value={fromDate ? dayjs(fromDate) : null}
            onChange={(newValue) => setFromDate(newValue?.toISOString() || null)}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
            maxDate={toDate ? dayjs(toDate) : dayjs()}
          />
          <DatePicker
            label="To Date"
            format="DD/MM/YYYY"
            value={toDate ? dayjs(toDate) : null}
            onChange={(newValue) => setToDate(newValue?.toISOString() || null)}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
            minDate={fromDate ? dayjs(fromDate) : undefined}
            maxDate={dayjs()}
          />
        </LocalizationProvider>

        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button variant="outlined" onClick={handleClear}>Clear</Button>
          <Button variant="contained" onClick={onClose}>Apply</Button>
        </Box>
      </Box>
    </Drawer>
  );
}
