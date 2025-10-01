import React, { useEffect, useState } from "react";
import { getSkills, searchDashboard } from "../../services/authentication";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import Header from "../../components/header";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddUserModal from "../../components/addUser";
import { DashboardTableHead } from "../../components/dashboardTableHead";
import EditUserModal from "../../components/editUser";
import { useNavigate } from "react-router-dom";
import { Roles } from "../../util/enum";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterDrawer from "./filter";
import { toast } from "react-toastify";
import { decodeToken } from "../../util/commonFunction";
import { ColorBasedText } from "./Enum/enum";

export const Dashboard = () => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [selected, setSelected] = useState([]);
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
  // const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [clearTriggered, setClearTriggered] = useState(false);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      await getDesignation().then((res) =>
        setDesignationList(res.designations || [])
      );
    } catch (err) {
      toast.error(err.message || "Failed to fetch designations");
    } finally {
      setLoading(false);
    }
  };

  const fetchReportingPersons = async () => {
    try {
      setLoading(true);
      await getReportingPersons().then((res) =>
        setReportingPersonList(res.reportingPersons || [])
      );
    } catch (err) {
      toast.error(err.message || "Failed to fetch designations");
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const userDetails = decodeToken();
      setRole(userDetails.role);
      const payload = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        order: [[orderBy, order.toUpperCase()]],
      };

      if (searchName?.trim()) {
        payload.name = searchName.trim();
      }

      if (selectedDesignation?.length > 0) {
        payload.designations = selectedDesignation;
      }

      if (selectedExperience?.value) {
        payload.experiences = {
          type: selectedExperience.type,
          value: selectedExperience.value,
        };
      }

      if (selectedReportingPerson?.length > 0) {
        payload.designations = selectedReportingPerson;
      }

      if (selectedAttempts?.value) {
        payload.total_attempts = {
          type: selectedAttempts.type,
          value: selectedAttempts.value,
        };
      }

      setLoading(true);
      await searchDashboard(payload).then((res) => {
        setRows(res.data.data || []);
        setTotalCount(res.data.total || 0);
      });
    } catch (err) {
      toast.error(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignations();
  }, []);

  useEffect(() => {
    if (clearTriggered) {
      fetchData();
      setClearTriggered(false);
    }
  }, [clearTriggered]);

  useEffect(() => {
    fetchData();
  }, [addUserModalOpen, order, orderBy, page, rowsPerPage]);

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
    setSelectedExperience({
      type: "EQUALS",
      value: "",
    });
    setSelectedReportingPerson([]);
    setSelectedAttempts({
      type: "EQUALS",
      value: "",
    });
    setPage(0);
    setClearTriggered(true);
  };

  return (
    <div sx={{ width: "100%", padding: 2, overflow: "hidden" }}>
      <Header />
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
        <Typography
          variant="h4"
          marginLeft={0}
          sx={{ fontWeight: "bold", color: "#1976d2" }}
        >
          Dashboard
        </Typography>
        <Box
          sx={{
            margin: 1,
            marginRight: 0,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {role === Roles.MANAGER && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginRight: 1,
              }}
            >
              <Button
                variant="outlined"
                sx={{
                  height: "38px",
                  fontWeight: "bold",
                  width: 140,
                  border: "1px solid",
                  marginTop: 0.2,
                  marginBottom: 0.1,
                  borderColor: "#1976d2",
                  borderRadius: 1,
                  color: "#1976d2",
                  textTransform: "none !important",
                  fontSize: "15px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0px",
                  gap: 1,
                }}
                onClick={() => setAddUserModalOpen(true)}
              >
                <PersonAddAltIcon />
                Add User
              </Button>
            </Box>
          )}

          <Box sx={{ display: "flex", alignItems: "right" }}>
            <Button
              variant="outlined"
              sx={{
                height: "38px",
                fontWeight: "bold",
                width: 100,
                border: "1px solid",
                borderColor: "#1976d2",
                borderRadius: 1,
                marginTop: 0.2,
                marginBottom: 0.1,
                color: "#1976d2",
                textTransform: "none !important",
                fontSize: "15px",
              }}
              startIcon={<FilterListIcon />}
              onClick={() => setFilterOpen(true)}
            >
              Filters
            </Button>
          </Box>

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
            onApply={() => {
              fetchData();
            }}
          />
        </Box>
      </Box>
      <AddUserModal
        key={addUserModalOpen ? "open" : "closed"}
        open={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
      />

      <Paper sx={{ width: "100%", mb: 2, p: 1, pb: 0 }}>
        <TableContainer>
          <Table
            sx={{
              minWidth: 750,
              "& .MuiTableCell-body": {
                padding: "5px",
              },
            }}
            size="medium"
          >
            <DashboardTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              setPage={setPage}
            />
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow hover key={row.user_id ?? index}>
                    <TableCell align="left">
                      <Tooltip
                        title={
                          <>
                            <Typography variant="body2">{row.email}</Typography>
                          </>
                        }
                        arrow
                        placement="top"
                      >
                        <span>
                          {row.name} ({row.designation} - {row.experience}{" "}
                          Years)
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="left">
                      {row.primary_skills?.length ||
                      row.secondary_skills?.length ? (
                        <Tooltip
                          title={
                            <Box sx={{ p: 1 }}>
                              {row.primary_skills?.length > 0 && (
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: "bold", mb: 0.5 }}
                                >
                                  Primary Skills:
                                </Typography>
                              )}
                              {row.primary_skills?.map((s) => (
                                <Typography key={`p-${s.id}`} variant="body2">
                                  • {s.name}
                                </Typography>
                              ))}

                              {row.secondary_skills?.length > 0 && (
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: "bold", mt: 1, mb: 0.5 }}
                                >
                                  Secondary Skills:
                                </Typography>
                              )}
                              {row.secondary_skills?.map((s) => (
                                <Typography key={`s-${s.id}`} variant="body2">
                                  • {s.name}
                                </Typography>
                              ))}
                            </Box>
                          }
                          arrow
                          placement="bottom-end"
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "nowrap",
                              alignItems: "center",
                            }}
                          >
                            {/* Show first primary OR secondary as chip */}
                            {[
                              ...(row.primary_skills || []),
                              ...(row.secondary_skills || []),
                            ]
                              .slice(0, 1)
                              .map((skill) => (
                                <Chip
                                  key={skill.id}
                                  label={skill.name}
                                  sx={{
                                    mr: 0.5,
                                    fontSize: "11px",
                                    // padding: "0.05",
                                  }}
                                />
                              ))}

                            {/* Show "+N more" if there are extra skills */}
                            {(row.primary_skills?.length || 0) +
                              (row.secondary_skills?.length || 0) >
                              1 && (
                              <Chip
                                label={`+${
                                  (row.primary_skills?.length || 0) +
                                  (row.secondary_skills?.length || 0) -
                                  1
                                } more`}
                                size="small"
                                sx={{
                                  bgcolor: "grey.200",
                                  cursor: "pointer",
                                  fontSize: "10px",
                                  // padding: "0.1",
                                }}
                              />
                            )}
                          </Box>
                        </Tooltip>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="left">
                      {row.total_attempts ?? "-"}
                    </TableCell>
                    <TableCell align="left">
                      {row.technical_score ?? "-"}
                    </TableCell>
                    <TableCell align="left">
                      {row.problem_solving_score ?? "-"}
                    </TableCell>
                    <TableCell align="left">
                      {row.project_domain_score ?? "-"}
                    </TableCell>
                    <TableCell align="left">
                      {row.communication_score ?? "-"}
                    </TableCell>
                    <TableCell align="left">
                      {row.soft_skill_score ?? "-"}
                    </TableCell>
                    <TableCell align="left">
                      {row.overall_score ?? "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={ColorBasedText[row.status]}
                        sx={{
                          backgroundColor: ratingColor[row.status],
                          color: "white",
                          fontWeight: "bold",
                          width: "160px",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "nowrap",
                        }}
                      >
                        {role === Roles.MANAGER && (
                          <IconButton
                            aria-label="edit"
                            id={row.user_id}
                            onClick={() => handleEditClick(row)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        <IconButton
                          aria-label="view"
                          id={row.user_id}
                          onClick={() =>
                            navigate(`/user-test-dashboard/${row.user_id}`)
                          }
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    align="center"
                    sx={{
                      py: 3,
                      fontWeight: "bold",
                      height: "60px",
                      fontSize: "16px",
                    }}
                  >
                    {loading ? (
                      <CircularProgress enableTrackSlot size="3rem" />
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
          sx={{
            ".MuiTablePagination-selectLabel": {
              marginTop: "auto",
            },
            ".MuiSelect-select": {
              paddingTop: "4px",
              paddingBottom: "4px",
            },
            ".MuiTablePagination-displayedRows": {
              marginTop: "auto",
            },
          }}
        />
      </Paper>
    </div>
  );
};
export default Dashboard;
