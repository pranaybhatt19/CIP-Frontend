import React, { useState, useEffect } from "react";
import { Box, Button, Drawer, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

dayjs.extend(utc);

export default function PracticeFilterDrawer({
  open,
  onClose,
  exactDate,
  fromDate,
  toDate,
  onClear,
  onApply,
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

  const handleApply = () => {
    onApply({
      exactDate: localExactDate,
      fromDate: localFromDate,
      toDate: localToDate,
    });
    onClose();
  };

  const handleClear = () => {
    // Clear local state
    setLocalExactDate(null);
    setLocalFromDate(null);
    setLocalToDate(null);

    // Call parent's clear function if needed
    if (onClear) onClear();

    // Immediately fetch data without filters
    onApply({ exactDate: null, fromDate: null, toDate: null });
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: "bold" }}>
            Filters
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Date Pickers */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Exact Date"
            format="DD/MM/YYYY"
            value={localExactDate ? dayjs(localExactDate) : null}
            onChange={(newValue) =>
              setLocalExactDate(
                newValue
                  ? dayjs(newValue).utc(true).startOf("day").toISOString()
                  : null
              )
            }
            slotProps={{ textField: { fullWidth: true, sx: { mb: 3 } } }}
            maxDate={dayjs()}
          />
          <DatePicker
            label="From Date"
            format="DD/MM/YYYY"
            value={localFromDate ? dayjs(localFromDate) : null}
            onChange={(newValue) =>
              setLocalFromDate(
                newValue
                  ? dayjs(newValue).utc(true).startOf("day").toISOString()
                  : null
              )
            }
            slotProps={{ textField: { fullWidth: true, sx: { mb: 3 } } }}
            maxDate={
              localToDate ? dayjs(localToDate).subtract(1, "day") : dayjs()
            }
          />
          <DatePicker
            label="To Date"
            format="DD/MM/YYYY"
            value={localToDate ? dayjs(localToDate) : null}
            onChange={(newValue) =>
              setLocalToDate(
                newValue
                  ? dayjs(newValue).utc(true).startOf("day").toISOString()
                  : null
              )
            }
            slotProps={{ textField: { fullWidth: true, sx: { mb: 3 } } }}
            minDate={
              localFromDate ? dayjs(localFromDate).add(1, "day") : undefined
            }
            maxDate={dayjs()}
          />
        </LocalizationProvider>

        {/* Action Buttons */}
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 2 }}
        >
          <Button
            variant="outlined"
            color="primary"
            sx={{ fontWeight: "bold" }}
            onClick={handleClear}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ fontWeight: "bold" }}
            onClick={handleApply}
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
