import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "@mui/material/styles"; // ✅ import theme hook

import Header from "../../components/header";
import AddUserModal from "../../components/addUser";
import FilterDrawer from "./filter";
import { decodeToken } from "../../util/commonFunction";
import { Roles } from "../../util/enum";

export const Dashboard = () => {
  const theme = useTheme(); 
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [selectedDesignation, setSelectedDesignation] = useState([]);
  const [selectedExperience, setSelectedExperience] = useState({
    type: "EQUALS",
    value: "",
  });
  const [selectedReportingPerson, setSelectedReportingPerson] = useState([]);
  const [selectedAttempts, setSelectedAttempts] = useState({
    type: "EQUALS",
    value: "",
  });
  const [loading, setLoading] = useState(true);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [designationList, setDesignationList] = useState([]);
  const [reportingPersonList, setReportingPersonList] = useState([]);
  const [clearTriggered, setClearTriggered] = useState(false);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  // Dummy data instead of API for now
  useEffect(() => {
    setRows([
      {
        user_id: 1,
        name: "Alice Johnson",
        designation: "Software Engineer",
        experience: 3,
        reporting_person: "Bob Manager",
        total_attempts: 2,
      },
      {
        user_id: 2,
        name: "David Smith",
        designation: "Senior Developer",
        experience: 5,
        reporting_person: "Carol Lead",
        total_attempts: 4,
      },
      {
        user_id: 3,
        name: "Eva Brown",
        designation: "UI/UX Designer",
        experience: 2,
        reporting_person: "Bob Manager",
        total_attempts: 1,
      },
      {
        user_id: 4,
        name: "Frank Wilson",
        designation: "QA Engineer",
        experience: 4,
        reporting_person: "Carol Lead",
        total_attempts: 3,
      },
      {
        user_id: 5,
        name: "Grace Lee",
        designation: "Project Manager",
        experience: 7,
        reporting_person: "-",
        total_attempts: 5,
      },
    ]);
    setTotalCount(5);
    setLoading(false);
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearFilters = () => {
    setSearchName("");
    setSelectedDesignation([]);
    setSelectedExperience({ type: "EQUALS", value: "" });
    setSelectedReportingPerson([]);
    setSelectedAttempts({ type: "EQUALS", value: "" });
    setPage(0);
    setClearTriggered(true);
  };

  return (
    <div style={{ width: "100%", padding: 2, overflow: "hidden" }}>
      <Header />

      {/* Top Bar */}
      <Box
        sx={{
          margin: "1rem",
          marginLeft: 2,
          // marginBottom: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {/* Title with theme color */}
        <Typography
          variant="h4"
          marginLeft={0}
          sx={{
            fontWeight: "bold",
            color: theme.palette.primary.main
          }}
        >
          Dashboard
        </Typography>

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 1 }}>

          <Button
            variant="outlined"
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              fontWeight: "bold",
            }}
            onClick={() => setAddUserModalOpen(true)}
            startIcon={<PersonAddAltIcon color="primary" />}
          >
            Add User
          </Button>


          <Button
            variant="outlined"
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              fontWeight: "bold",
            }}
            startIcon={<FilterListIcon color="primary" />}
            onClick={() => setFilterOpen(true)}
          >
            Filters
          </Button>
        </Box>

        {/* Filter Drawer */}
        <FilterDrawer
          open={filterOpen}
          onClose={() => {
            setFilterOpen(false);
            setPage(0);
          }}
          searchName={searchName}
          setSearchName={setSearchName}
          selectedDesignation={selectedDesignation}
          setSelectedDesignation={setSelectedDesignation}
          selectedExperience={selectedExperience}
          setSelectedExperience={setSelectedExperience}
          selectedReportingPerson={selectedReportingPerson}
          setSelectedReportingPerson={setSelectedReportingPerson}
          selectedAttempts={selectedAttempts}
          setSelectedAttempts={setSelectedAttempts}
          designationList={designationList}
          reportingPersonList={reportingPersonList}
          onClear={handleClearFilters}
        />
      </Box>

      {/* Add User Modal */}
      <AddUserModal
        key={addUserModalOpen ? "open" : "closed"}
        open={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
      />

      {/* Data Table */}
      <Paper sx={{ width: "100%", p: 1 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <thead>
              <TableRow>
                <TableCell onClick={(e) => handleRequestSort(e, "name")}>
                  <b>Name</b>
                </TableCell>
                <TableCell onClick={(e) => handleRequestSort(e, "designation")}>
                  <b>Designation</b>
                </TableCell>
                <TableCell onClick={(e) => handleRequestSort(e, "experience")}>
                  <b>Experience</b>
                </TableCell>
                <TableCell onClick={(e) => handleRequestSort(e, "reporting_person")}>
                  <b>Reporting Person</b>
                </TableCell>
                <TableCell onClick={(e) => handleRequestSort(e, "total_attempts")}>
                  <b>Attempts</b>
                </TableCell>
                <TableCell align="center">
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </thead>
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow hover key={row.user_id ?? index}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.designation ?? "-"}</TableCell>
                    <TableCell>
                      {row.experience ? `${row.experience} Years` : "-"}
                    </TableCell>
                    <TableCell>{row.reporting_person ?? "-"}</TableCell>
                    <TableCell>{row.total_attempts ?? "-"}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        aria-label="view"
                        onClick={() => navigate(`/user-test-dashboard/${row.user_id}`)}
                      >
                        <VisibilityIcon color="primary" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    {loading ? (
                      <CircularProgress
                        size="2rem"
                        sx={{ color: theme.palette.primary.main }}
                      />
                    ) : (
                      "No data found"
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default Dashboard;
