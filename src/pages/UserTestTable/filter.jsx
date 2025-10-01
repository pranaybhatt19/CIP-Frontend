import {
  Drawer,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  ListItemText,
  Button,
  IconButton,
  Tooltip,
  Divider,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ScoreFilter from "../../components/scoreFilter";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

export default function FilterDrawer({
  open,
  onClose,
  selectedTechStack,
  setSelectedTechStack,
  selectedInterviewType,
  setSelectedInterviewType,
  selectedTechnical,
  setSelectedTechnical,
  selectedSoftSkills,
  setSelectedSoftSkills,
  selectedProblemSolving,
  setSelectedProblemSolving,
  selectedCommunication,
  setSelectedCommunication,
  selectedProjectDomain,
  setSelectedProjectDomain,
  selectedOverall,
  setSelectedOverall,
  selectedExactDate,
  setSelectedExactDate,
  selectedToDate,
  setSelectedToDate,
  selectedFromDate,
  setSelectedFromDate,
  techStackList,
  interviewTypes,
  onClear,
  onApply,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 500, color: "#1976d2" }}>
            Filters
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: "#1976d2" }} />
          </IconButton>
        </Box>

        {/* TechStack */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="techstack-label">Tech Stack</InputLabel>
          <Select
            labelId="techstack-label"
            multiple
            value={selectedTechStack}
            onChange={(e) => setSelectedTechStack(e.target.value)}
            input={<OutlinedInput label="Tech Stack" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
                {selected.map((id) => {
                  const skill = techStackList.find((item) => item.id === id);
                  return <Chip key={id} label={skill?.name} />;
                })}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: isMobile ? 250 : 300,
                },
              },
            }}
          >
            {techStackList.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                <ListItemText primary={item.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="interview-label">Interview Type</InputLabel>
          <Select
            labelId="interview-label"
            multiple
            value={selectedInterviewType}
            onChange={(e) => setSelectedInterviewType(e.target.value)}
            input={<OutlinedInput label="Interview Type" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
                {selected.map((id) => {
                  const skill = interviewTypes.find((item) => item.id === id);
                  return <Chip key={id} label={skill?.name} />;
                })}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: isMobile ? 250 : 300,
                },
              },
            }}
          >
            {interviewTypes.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                <ListItemText primary={item.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <ScoreFilter
          label="Technical Score"
          value={selectedTechnical.value}
          type={selectedTechnical.type}
          onChange={(newFilter) => setSelectedTechnical(newFilter)}
        />

        <ScoreFilter
          label="Problem Solving Score"
          value={selectedProblemSolving.value}
          type={selectedProblemSolving.type}
          onChange={(newFilter) => setSelectedProblemSolving(newFilter)}
        />

        <ScoreFilter
          label="Project Domain Score"
          value={selectedProjectDomain.value}
          type={selectedProjectDomain.type}
          onChange={(newFilter) => setSelectedProjectDomain(newFilter)}
        />

        <ScoreFilter
          label="Communication Score"
          value={selectedCommunication.value}
          type={selectedCommunication.type}
          onChange={(newFilter) => setSelectedCommunication(newFilter)}
        />

        <ScoreFilter
          label="Soft Skills Score"
          value={selectedSoftSkills.value}
          type={selectedSoftSkills.type}
          onChange={(newFilter) => setSelectedSoftSkills(newFilter)}
        />

        <ScoreFilter
          label="Overall Score"
          value={selectedOverall.value}
          type={selectedOverall.type}
          onChange={(newFilter) => setSelectedOverall(newFilter)}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {/* Exact Date */}
          <DatePicker
            label="Exact Date"
            format="DD/MM/YYYY"
            value={selectedExactDate ? dayjs(selectedExactDate) : null}
            maxDate={dayjs()}
            onChange={(newValue) =>
              setSelectedExactDate(newValue?.toISOString() || null)
            }
            slotProps={{
              textField: { fullWidth: true },
            }}
            sx={{ mb: 2 }}
          />

          {/* From Date */}
          <DatePicker
            label="From Date"
            format="DD/MM/YYYY"
            value={selectedFromDate ? dayjs(selectedFromDate) : null}
            onChange={(newValue) =>
              setSelectedFromDate(newValue?.toISOString() || null)
            }
            minDate={selectedToDate ? dayjs("1970-01-01") : undefined}
            maxDate={selectedToDate ? dayjs(selectedToDate) : dayjs()}
            slotProps={{
              textField: { fullWidth: true },
            }}
            sx={{ mb: 2 }}
          />

          {/* To Date */}
          <DatePicker
            label="To Date"
            format="DD/MM/YYYY"
            value={selectedToDate ? dayjs(selectedToDate) : null}
            onChange={(newValue) =>
              setSelectedToDate(newValue?.toISOString() || null)
            }
            minDate={selectedFromDate ? dayjs(selectedFromDate) : undefined}
            maxDate={dayjs()}
            slotProps={{
              textField: { fullWidth: true },
            }}
            sx={{ mb: 2 }}
          />
        </LocalizationProvider>
        {/* Buttons */}
        <Box
          display="flex"
          justifyContent={"end"}
          alignItems={"end"}
          gap={1}
          fullWidth
        >
          <Button variant="outlined" onClick={onClear}>
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onApply();
              onClose();
            }}
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
