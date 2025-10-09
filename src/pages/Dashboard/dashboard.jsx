import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableRow,
  Typography,
  Tab,
  Tabs,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "@mui/material/styles";
import AddUserModal from "../../components/addUser";
import FilterDrawer from "./filter";
import { decodeToken } from "../../util/commonFunction";
import {
  getDesignations,
  getReportingPersons,
  searchDashboard,
} from "../../services/authentication";
import { DashboardTableHead } from "../../components/dashboardTableHead";
import { Tooltip } from "@mui/material";
import UserTreeView from "../../components/userTreeView";
import dayjs from "dayjs";

export const Dashboard = () => {
  const theme = useTheme();
  const [isTreeView, setIsTreeView] = useState(true);
  const [openTreeView, setOpenTreeView] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();
  const [userDesignation, setUserDesignation] = useState("");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("full_name");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterOpen, setFilterOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  // Filters
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

  const [lastAttemptedDate, setLastAttemptedDate] = useState({
    exactDate: null,
    fromDate: null,
    toDate: null,
  });

  const [designationList, setDesignationList] = useState([]);
  const [reportingPersonList, setReportingPersonList] = useState([]);
  const [clearTriggered, setClearTriggered] = useState(false);

  // ====================== Effects ======================
  useEffect(() => {
    const decodedToken = decodeToken();
    if (decodedToken?.designation)
      setUserDesignation(decodedToken.designation?.name);
    if (decodedToken?.sub) setUserId(decodedToken.sub);
    fetchDesignations();
    fetchReportingPersons();
  }, []);

  // ====================== API Calls ======================
  const fetchDesignations = async () => {
    try {
      const res = await getDesignations();
      setDesignationList(res.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch designations");
    }
  };

  const fetchReportingPersons = async () => {
    try {
      const res = await getReportingPersons();
      setReportingPersonList(res.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch reporting persons");
    }
  };

  const fetchData = async () => {
    try {
      const payload = {
        isTreeView: isTreeView,
      };

      if (!isTreeView) {
        payload.limit = rowsPerPage;
        payload.offset = page * rowsPerPage;
        payload.order = [[orderBy, order.toUpperCase()]];
      }

      if (searchName?.trim()) payload.full_name = searchName.trim();
      if (selectedDesignation?.length > 0)
        payload.designation_ids = selectedDesignation;
      if (selectedExperience?.value) payload.experience = selectedExperience;
      if (selectedReportingPerson?.length > 0)
        payload.reporting_persons_ids = selectedReportingPerson;
      if (selectedAttempts?.value) payload.attempts = selectedAttempts;

      const dateFilter = lastAttemptedDate;
      if (dateFilter?.exactDate || dateFilter?.fromDate || dateFilter?.toDate) {
        payload.last_communication_date = dateFilter;
      }

      setLoading(true);
      await searchDashboard(payload).then((res) => {
        setRows(res.data.data || []);
        if (isTreeView) {
          setOpenTreeView(true);
        } else {
          setOpenTreeView(false);
        }
        setTotalCount(res.data.totalCount || 0);
      });
    } catch (err) {
      toast.error(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clearTriggered) {
      fetchData();
      setClearTriggered(false);
    }
  }, [clearTriggered]);

  useEffect(() => {
    fetchData();
  }, [addUserModalOpen, order, orderBy, page, rowsPerPage, isTreeView]);

  // ====================== Handlers ======================
  const handleRequestSort = (_, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
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
    setLastAttemptedDate({
      exactDate: null,
      fromDate: null,
      toDate: null,
    });
    setPage(0);
    setClearTriggered(true);
  };

  // ====================== Render ======================
  return (
    <div style={{ width: "100%", overflow: "hidden", margin: 0 }}>
      {/* Top Bar */}
      <Box
        sx={{
          padding: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: theme.palette.primary.main,
          }}
        >
          Dashboard
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {reportingPersonList.length > 0 && (
            <Tabs
              value={isTreeView ? 1 : 0}
              onChange={(e, newValue) => setIsTreeView(newValue === 1)}
              indicatorColor="none"
              sx={{
                minHeight: 36,
                border: "1px solid #2a9d8f",
                borderRadius: 1,
                overflow: "hidden",
                "& .MuiTabs-flexContainer": {
                  height: "100%",
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  minHeight: 36,
                  height: "100%",
                  flex: 1,
                  color: "#2a9d8f",
                  whiteSpace: "nowrap",
                  padding: "0 12px",
                  margin: 0,
                  borderRadius: 0,
                  "&.Mui-selected": {
                    color: "#fff",
                    backgroundColor: "#2a9d8f",
                  },
                },
              }}
            >
              <Tab label="List View" />
              <Tab label="Tree View" />
            </Tabs>
          )}

          {["PM", "APM", "STL", "TL"].includes(userDesignation) && (
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
          )}

          {reportingPersonList.length > 0 && (
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
          )}
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
          lastAttemptedDate={lastAttemptedDate}
          setLastAttemptedDate={setLastAttemptedDate}
          designationList={designationList}
          reportingPersonList={reportingPersonList}
          onClear={handleClearFilters}
          onApply={fetchData}
          userId={userId}
        />
      </Box>

      {/* Add User Modal */}
      <AddUserModal
        key={addUserModalOpen ? "open" : "closed"}
        open={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
      />

      {openTreeView ? (
        <UserTreeView treeData={Array.isArray(rows) ? rows : [rows]} />
      ) : (
        <Paper sx={{ width: "100%", mb: 2, p: "8px 16px", pb: 0 }}>
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <DashboardTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                setPage={setPage}
              />
              <TableBody>
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <TableRow
                      hover
                      key={row.user_id ?? index}
                      sx={{
                        height: "60px",
                        "& .MuiTableCell-root": {
                          py: 1,
                        },
                      }}
                    >
                      <TableCell align="left" sx={{ pl: "5px" }}>
                        <Tooltip
                          title={
                            <div style={{ fontSize: "0.8rem" }}>
                              <div>
                                <strong>Full Name:</strong> {row.full_name}
                              </div>
                              <Divider
                                sx={{ my: 0.5, backgroundColor: "white" }}
                              />
                              <div>
                                <strong>Email:</strong> {row.email}
                              </div>
                            </div>
                          }
                          arrow
                          placement="right"
                        >
                          <span style={{ cursor: "pointer" }}>
                            {row.full_name
                              ? row.full_name
                                  .split(" ")
                                  .map((word, idx, arr) =>
                                    idx > 0 && idx < arr.length - 1
                                      ? word[0]
                                      : word
                                  )
                                  .join(" ")
                              : "-"}
                          </span>
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ pl: "5px" }}>
                        {row.designation?.name ?? "-"}
                      </TableCell>
                      <TableCell sx={{ pl: "5px" }}>
                        {row.experience ?? "-"}
                      </TableCell>
                      <TableCell sx={{ pl: "5px" }}>
                        {row.reporting_person?.name
                          ? row.reporting_person?.name
                              .split(" ")
                              .map((word, idx, arr) =>
                                idx > 0 && idx < arr.length - 1 ? "" : word
                              )
                              .join(" ")
                          : "-"}
                      </TableCell>
                      <TableCell sx={{ pl: "5px" }}>
                        {row.last_communication_date
                          ? dayjs(row.last_communication_date).format(
                              "DD/MM/YYYY"
                            )
                          : "-"}
                      </TableCell>
                      <TableCell sx={{ pl: "5px" }}>
                        {row.attempts ?? "-"}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          aria-label="view"
                          onClick={() =>
                            navigate(`/user-practices/${row.user_id}`)
                          }
                        >
                          <VisibilityIcon color="primary" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
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
            sx={{
              "& .MuiTablePagination-toolbar": {
                minHeight: "60px",
              },
              "& .MuiTablePagination-selectLabel": {
                marginTop: "0",
                fontSize: "0.9rem",
              },
              "& .MuiTablePagination-displayedRows": {
                marginTop: "0",
                fontSize: "0.9rem",
              },
              "& .MuiTablePagination-select": {
                paddingTop: "4px",
                paddingBottom: "4px",
              },
              "& .MuiInputBase-root": {
                fontSize: "0.9rem",
              },
            }}
          />
        </Paper>
      )}
    </div>
  );
};

export default Dashboard;
