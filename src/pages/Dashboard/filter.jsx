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
  Button,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AttemptFilter from "../../components/attemptFilter";
import ScoreFilter from "../../components/scoreFilter";

export default function FilterDrawer({
  open,
  onClose,
  searchName,
  setSearchName,
  selectedDesignation,
  setSelectedDesignation,
  selectedExperience,
  setSelectedExperience,
  selectedReportingPerson,
  setSelectedReportingPerson,
  selectedAttempts,
  setSelectedAttempts,
  designationList,
  reportingPersonList,
  onClear,
  onApply,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
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
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            Filters
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Name filter */}
        <TextField
          label="Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          fullWidth
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "transparent",
            },
          }}
        />

        {/* Designation filter */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="designation-label">Designation</InputLabel>
          <Select
            labelId="designation-label"
            multiple
            value={selectedDesignation}
            onChange={(e) => setSelectedDesignation(e.target.value)}
            input={<OutlinedInput label="Designation" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
                {selected.map((id) => {
                  const d = designationList.find((item) => item.id === id);
                  return <Chip key={id} label={d?.name ?? id} />;
                })}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: { maxHeight: isMobile ? 250 : 300 },
              },
            }}
          >
            {designationList.map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Reporting Person filter */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="reporting-label">Reporting Person</InputLabel>
          <Select
            labelId="reporting-label"
            multiple
            value={selectedReportingPerson}
            onChange={(e) => setSelectedReportingPerson(e.target.value)}
            input={<OutlinedInput label="Reporting Person" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
                {selected.map((id) => {
                  const person = reportingPersonList.find(
                    (item) => item.user_id === id
                  );
                  return <Chip key={id} label={person?.name ?? id} />;
                })}
              </Box>
            )}
            MenuProps={{
              PaperProps: {
                style: { maxHeight: isMobile ? 250 : 300 },
              },
            }}
          >
            {reportingPersonList.map((item) => (
              <MenuItem key={item.user_id} value={item.user_id}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Experience filter */}
        <ScoreFilter
          label="Experience (Years)"
          value={selectedExperience.value}
          type={selectedExperience.type}
          onChange={(newFilter) => setSelectedExperience(newFilter)}
        />

        {/* Attempts filter */}
        <ScoreFilter
          label="Total Attempts"
          value={selectedAttempts.value}
          type={selectedAttempts.type}
          onChange={(newFilter) => setSelectedAttempts(newFilter)}
        />

        {/* Buttons */}
        <Box
          display="flex"
          justifyContent={"end"}
          alignItems={"center"}
          gap={1}
          fullWidth
        >
          <Button variant="outlined" onClick={onClear}>
            Clear
          </Button>
          <Button
            variant="contained"
            sx={{ marginLeft: 1 }}
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
