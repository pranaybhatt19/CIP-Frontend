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
import { useEffect } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ColorBasedText } from "./Enum/enum";
import AttemptFilter from "../../components/attemptFilter";

export default function FilterDrawer({
  open,
  onClose,
  searchName,
  setSearchName,
  selectedSkills,
  setSelectedSkills,
  selectedAttempts,
  setSelectedAttempts,
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
  selectedStatus,
  setSelectedStatus,
  techStackList,
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

        {/* Username */}
        <TextField
          label="Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="skills-label">Skills</InputLabel>
          <Select
            labelId="skills-label"
            multiple
            value={selectedSkills}
            onChange={(e) => setSelectedSkills(e.target.value)}
            input={<OutlinedInput label="Skills" />}
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

        <AttemptFilter
          label="Total Attempts"
          value={selectedAttempts.value}
          type={selectedAttempts.type}
          onChange={(newFilter) => setSelectedAttempts(newFilter)}
        />

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

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="status-label">Status</InputLabel>
          <Select
            labelId="status-label"
            multiple
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            input={<OutlinedInput label="Status" />}
            renderValue={(selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.4 }}>
                {selected.map((key) => (
                  <Chip key={key} label={ColorBasedText[key]} />
                ))}
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
            {Object.entries(ColorBasedText).map(([key, label]) => (
              <MenuItem key={key} value={key}>
                <ListItemText primary={label} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
