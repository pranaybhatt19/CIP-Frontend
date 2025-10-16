import {
  Drawer,
  Box,
  TextField,
  FormControl,
  Chip,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Autocomplete from "@mui/material/Autocomplete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useState, useEffect, useMemo } from "react";
import ScoreFilter from "../../components/scoreFilter";
import AttemptFilter from "../../components/attemptFilter";

dayjs.extend(utc);

export default function FilterDrawer({
  open,
  onClose,
  selectedExperience,
  setSelectedExperience,
  selectedReportingPerson,
  setSelectedReportingPerson,
  selectedTags,
  setSelectedTags,
  selectedMediumOfEducation,
  setSelectedMediumOfEducation,
  selectedAttempts,
  setSelectedAttempts,
  lastAttemptedDate,
  setLastAttemptedDate,
  reportingPersonList,
  languageList,
  tagsList,
  onClear,
  onApply,
  userId,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const safeLastAttemptedDate = lastAttemptedDate || {};
  const [initialValues, setInitialValues] = useState(null);
  const [dateErrors, setDateErrors] = useState({
    exactDate: "",
    fromDate: "",
    toDate: "",
    range: "",
  });

  useEffect(() => {
    if (open && !initialValues) {
      setInitialValues({
        selectedExperience: { ...selectedExperience },
        selectedReportingPerson: [...selectedReportingPerson],
        selectedTags: [...selectedTags],
        selectedMediumOfEducation: [...selectedMediumOfEducation],
        selectedAttempts: { ...selectedAttempts },
        lastAttemptedDate: { ...lastAttemptedDate },
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setInitialValues(null);
      setDateErrors({
        exactDate: "",
        fromDate: "",
        toDate: "",
        range: "",
      });
    }
  }, [open]);

  const hasChanges = useMemo(() => {
    if (!initialValues) return false;
    return (
      JSON.stringify(selectedExperience) !==
      JSON.stringify(initialValues.selectedExperience) ||
      JSON.stringify(selectedReportingPerson) !==
      JSON.stringify(initialValues.selectedReportingPerson) ||
      JSON.stringify(selectedTags) !==
      JSON.stringify(initialValues.selectedTags) ||
      JSON.stringify(selectedMediumOfEducation) !==
      JSON.stringify(initialValues.selectedMediumOfEducation) ||
      JSON.stringify(selectedAttempts) !==
      JSON.stringify(initialValues.selectedAttempts) ||
      JSON.stringify(lastAttemptedDate) !==
      JSON.stringify(initialValues.lastAttemptedDate)
    );
  }, [
    initialValues,
    selectedExperience,
    selectedReportingPerson,
    selectedTags,
    selectedMediumOfEducation,
    selectedAttempts,
    lastAttemptedDate,
  ]);

  const validateDateRange = (fromDate, toDate) => {
    const errors = { fromDate: "", toDate: "", range: "" };
    if (fromDate && toDate) {
      const from = dayjs(fromDate);
      const to = dayjs(toDate);
      if (from.isAfter(to)) {
        errors.range = "From Date must be before or equal to To Date";
      } else if (from.isSame(to, "day")) {
        errors.range = "From Date and To Date cannot be the same";
      }
    }
    return errors;
  };

  const handleDateChange = (key, value) => {
    let newValue = value ? dayjs(value).utc(true).startOf("day") : null;
    if (newValue && !newValue.isValid()) newValue = null;

    const today = dayjs().utc(true).startOf("day");
    if (newValue && newValue.isAfter(today)) {
      setDateErrors((prev) => ({
        ...prev,
        [key]: "Date cannot be in the future",
      }));
      return;
    } else {
      setDateErrors((prev) => ({ ...prev, [key]: "" }));
    }

    const newDate = {
      ...lastAttemptedDate,
      [key]: newValue ? newValue.toISOString() : null,
    };

    if (key === "fromDate" || key === "toDate") {
      const rangeErrors = validateDateRange(
        key === "fromDate" ? newValue?.toISOString() : newDate.fromDate,
        key === "toDate" ? newValue?.toISOString() : newDate.toDate
      );
      setDateErrors((prev) => ({ ...prev, ...rangeErrors }));
    }

    setLastAttemptedDate(newDate);
  };

  const handleManualDateInput = (key, value) => {
    if (!value) return;
    const parsed = dayjs(value, "DD/MM/YYYY", true);
    if (parsed.isValid()) {
      const today = dayjs().startOf("day");
      if (parsed.isAfter(today)) {
        setDateErrors((prev) => ({
          ...prev,
          [key]: "Date cannot be in the future",
        }));
        handleDateChange(key, today);
      } else {
        handleDateChange(key, parsed);
      }
    }
  };

  const validateExperience = (filter) => {
    if (filter.value === "" || filter.value === null) return true;
    const num = Number(filter.value);
    return !isNaN(num) && num >= 0;
  };

  const validateAttempts = (filter) => {
    if (filter.value === "" || filter.value === null) return true;
    const num = Number(filter.value);
    return Number.isInteger(num) && num >= 0 && Number.isSafeInteger(num);
  };

  const hasValidationErrors = useMemo(() => {
    return (
      Object.values(dateErrors).some((error) => error !== "") ||
      !validateExperience(selectedExperience) ||
      !validateAttempts(selectedAttempts)
    );
  }, [dateErrors, selectedExperience, selectedAttempts]);

  const handleApply = () => {
    if (!hasChanges) {
      onClose();
      return;
    }
    if (hasValidationErrors) return;

    const payload = {
      selectedExperience,
      selectedReportingPerson,
      selectedTags,
      selectedAttempts,
      selectedMediumOfEducation,
      last_communication_date: lastAttemptedDate,
    };
    onApply(payload);
    onClose();
  };

  const handleClear = () => {
    setDateErrors({
      exactDate: "",
      fromDate: "",
      toDate: "",
      range: "",
    });
    onClear();
  };

  const handleClose = () => {
    setDateErrors({
      exactDate: "",
      fromDate: "",
      toDate: "",
      range: "",
    });
    onClose();
  };

  return (
    <Drawer anchor="right" open={open} onClose={handleClose}>
      <Box sx={{ width: 350, p: 2 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h3" sx={{ fontWeight: 500 }}>
            Filters
          </Typography>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 🔹 Reporting Officer (Autocomplete) */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Autocomplete
            multiple
            options={reportingPersonList.filter((item) => item.id !== userId)}
            getOptionLabel={(option) =>
              option.name
                ? option.name
                    .split(" ")
                    .map((word, idx, arr) =>
                      idx > 0 && idx < arr.length - 1 ? word[0] : word
                    )
                    .join(" ")
                : "-"
            }
            value={reportingPersonList.filter((item) =>
              selectedReportingPerson.includes(item.id)
            )}
            onChange={(event, newValue) =>
              setSelectedReportingPerson(newValue.map((item) => item.id))
            }
            disableCloseOnSelect
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option.id}
                  label={
                    option.name
                      ? option.name
                          .split(" ")
                          .map((word, idx, arr) =>
                            idx > 0 && idx < arr.length - 1 ? word[0] : word
                          )
                          .join(" ")
                      : "-"
                  }
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Reporting Officer" />
            )}
            ListboxProps={{
              style: { maxHeight: 250, overflowY: "auto" },
            }}
          />
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="tags-label">Tags</InputLabel>
          <Select
            labelId="tags-label"
            multiple
            value={selectedTags}
            onChange={(e) => {
              // Ensure no duplicates
              const value = Array.from(new Set(e.target.value));
              setSelectedTags(value.map(v => String(v).toLowerCase()));
            }}
            input={<OutlinedInput label="Tags" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip
                    key={value}
                    label={value}
                    size="small"
                  />
                ))}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: { maxHeight: isMobile ? 250 : 300 },
              },
            }}
          >
            {tagsList?.map((tag) => (
              <MenuItem key={tag} value={tag}>
                {tag}
              </MenuItem>
            ))}
          </Select>
        </FormControl>


        {/* 🔹 Medium of Education (Autocomplete) */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={languageList}
            getOptionLabel={(option) => option}
            value={selectedMediumOfEducation}
            onChange={(event, newValue) =>
              setSelectedMediumOfEducation(newValue)
            }
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option}
                  label={option}
                  size="small"
                  {...getTagProps({ index })}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="Medium of Education" />
            )}
            PaperProps={{
              style: { maxHeight: isMobile ? 250 : 300 },
            }}
          />
        </FormControl>

        <ScoreFilter
          label="Experience (Years)"
          value={selectedExperience.value}
          type={selectedExperience.type}
          onChange={(newFilter) => setSelectedExperience(newFilter)}
        />

        <AttemptFilter
          label="Total Attempts"
          value={selectedAttempts.value}
          type={selectedAttempts.type}
          onChange={(newFilter) => setSelectedAttempts(newFilter)}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Exact Date (Last Attempt)"
            format="DD/MM/YYYY"
            value={
              safeLastAttemptedDate.exactDate
                ? dayjs(safeLastAttemptedDate.exactDate)
                : null
            }
            onChange={(val) => handleDateChange("exactDate", val)}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { mb: 2 },
                error: Boolean(dateErrors.exactDate),
                helperText: dateErrors.exactDate,
                onBlur: (e) => {
                  handleManualDateInput("exactDate", e.target.value);
                },
              },
            }}
            maxDate={dayjs()}
          />

          <DatePicker
            label="From Date (Last Attempt)"
            format="DD/MM/YYYY"
            value={
              safeLastAttemptedDate.fromDate
                ? dayjs(safeLastAttemptedDate.fromDate)
                : null
            }
            onChange={(val) => handleDateChange("fromDate", val)}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { mb: 2 },
                error: Boolean(dateErrors.fromDate || dateErrors.range),
                helperText: dateErrors.fromDate || dateErrors.range,
                onBlur: (e) => {
                  handleManualDateInput("fromDate", e.target.value);
                },
              },
            }}
            maxDate={dayjs()}
          />

          <DatePicker
            label="To Date (Last Attempt)"
            format="DD/MM/YYYY"
            value={
              safeLastAttemptedDate.toDate
                ? dayjs(safeLastAttemptedDate.toDate)
                : null
            }
            onChange={(val) => handleDateChange("toDate", val)}
            slotProps={{
              textField: {
                fullWidth: true,
                sx: { mb: 2 },
                error: Boolean(dateErrors.toDate),
                helperText: dateErrors.toDate,
                onBlur: (e) => {
                  handleManualDateInput("toDate", e.target.value);
                },
              },
            }}
            maxDate={dayjs()}
          />
        </LocalizationProvider>

        <Box
          display="flex"
          justifyContent="end"
          alignItems="center"
          gap={1}
          sx={{ mt: 2 }}
        >
          <Button variant="outlined" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="contained" onClick={handleApply}>
            Apply
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
