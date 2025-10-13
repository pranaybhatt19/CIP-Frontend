import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Chip,
  useMediaQuery,
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
  updateUser,
} from "../../services/authentication";
import { DashboardTableHead } from "../../components/dashboardTableHead";
import { Tooltip } from "@mui/material";
import UserTreeView from "../../components/userTreeView";
import dayjs from "dayjs";
import AddLanguageModal from "../../components/addLanguage";
import Cookie from "js-cookie";
import Cookies from "js-cookie";
import { debounce } from "lodash";
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AccountTreeIcon from '@mui/icons-material/AccountTree';

export const Dashboard = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const [isTreeView, setIsTreeView] = useState(false);
  const [openTreeView, setOpenTreeView] = useState(false);
  const [languageModelOpen, setLanguageModalOpen] = useState(false);
  const [educationalLanguage, setEducationalLanguage] = useState("");
  const [otherLanguageValue, setOtherLanguageValue] = useState("");
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
  const [isPM, setIsPM] = useState(false);

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

  const debouncedSearch = useMemo(
    () =>
      debounce(() => {
        fetchData();
      }, 1200),
    [searchName, selectedDesignation]
  );

  useEffect(() => {
    if (searchName.length < 1 || searchName?.length > 2) {
      debouncedSearch();
    }
  }, [searchName, selectedDesignation, debouncedSearch]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // ====================== Effects ======================
  useEffect(() => {
    const decodedToken = decodeToken();
    if (decodedToken?.designation)
      setUserDesignation(decodedToken.designation?.name);
    if (decodedToken?.sub) setUserId(decodedToken.sub);
    fetchDesignations();
    fetchReportingPersons();
  }, []);

  useEffect(() => {
    const savedView = Cookie.get("cip_view_preference");
    if (!savedView) {
      Cookie.set("cip_view_preference", "list", { expires: 7 });
      setIsTreeView(false);
      return;
    }
    switch (savedView) {
      case "tree":
        setIsTreeView(true);
        break;
      case "list":
        setIsTreeView(false);
        break;
      default:
        setIsTreeView(false);
        break;
    }
  }, []);

  const handlePrefChange = (event, newValue) => {
    const selectedView = newValue === 1 ? "tree" : "list";
    setIsTreeView(selectedView === "tree");
    Cookies.set("cip_view_preference", selectedView, { expires: 7 });
  };

  // ====================== API Calls ======================
  const fetchDesignations = async () => {
    try {
      const res = await getDesignations();
      setDesignationList(res.data || []);
    } catch (err) {
      if (err.status != 409) {
        toast.error(err.message || "Failed to fetch designations");
      } else {
        setLanguageModalOpen(true);
      }
    }
  };

  const fetchReportingPersons = async () => {
    try {
      const res = await getReportingPersons();
      setReportingPersonList(res.data || []);
    } catch (err) {
      if (err.status != 409) {
        toast.error(err.message || "Failed to fetch reporting managers");
      } else {
        setLanguageModalOpen(true);
      }
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
      const currentUserId = decodeToken()?.sub;
      const designation = decodeToken()?.designation;
      console.log("reporting Person::", decodeToken());
      setIsPM(designation?.name === "PM");
      await searchDashboard(payload).then((res) => {
        if (!isTreeView) {
          const allUsers = res.data.data || [];
          const sortedUsers = allUsers.sort((a, b) => {
            if (a.user_id == currentUserId) return -1;
            if (b.user_id == currentUserId) return 1;
            return 0;
          });
          setRows(sortedUsers);
        } else {
          setRows(res.data.data || []);
        }
        if (isTreeView) {
          setOpenTreeView(true);
        } else {
          setOpenTreeView(false);
        }
        setTotalCount(res.data.totalCount || 0);
      });
    } catch (err) {
      if (err.status != 409) {
        toast.error(err.message || "Failed to fetch data");
      } else {
        setLanguageModalOpen(true);
      }
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

  const SubmitUpdateUser = async () => {
    try {
      const payload = {
        id: userId,
      };
      if (educationalLanguage === "others") {
        payload.educationLanguage = otherLanguageValue.toLocaleLowerCase();
      } else {
        payload.educationLanguage = educationalLanguage.toLocaleLowerCase();
      }
      const res = await updateUser(payload);
      setLanguageModalOpen(false);
      fetchData();
      fetchReportingPersons();
      fetchDesignations();
    } catch (err) {
      toast.error(err.message || "Failed to update language");
      setLanguageModalOpen(open);
    }
  };

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
          mt: 1,
          minHeight: "80px",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: theme.palette.primary.main,
          }}
        >
          Dashboard
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: { xs: "space-between", sm: "center", md: "flex-end" },
            alignItems: { xs: "stretch" },
            flexWrap: "wrap",
            gap: 2,
            width: isSmallScreen ? "auto" : "100%",
          }}
        >
          {/* Left Side: Filters */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { sm: "row" },
              alignItems: { sm: "center", md: "flex-end" },
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
              width: { xs: "100%", md: "auto" },
            }}
          >
            <TextField
              label="Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              size="small"
              fullWidth
              error={searchName.length > 0 && searchName.length < 3}
              helperText={
                searchName.length > 0 && searchName.length < 3
                  ? "Enter at least 3 characters"
                  : " "
              }
              FormHelperTextProps={{
                sx: { minHeight: "16px", margin: 0, lineHeight: "1rem" },
              }}
              sx={{
                width: { xs: "100%", sm: "47%", lg: "240px" },
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "transparent",
                  height: "40px",
                },
                "& .MuiFormHelperText-root": {
                  position: "absolute",
                  bottom: "-18px",
                  left: 0,
                },
                position: "relative",
              }}
            />

            <FormControl sx={{ width: { xs: "100%", sm: "47%", lg: "240px" } }} size="small">
              <InputLabel id="designation-label">Designation</InputLabel>
              <Select
                labelId="designation-label"
                multiple
                value={selectedDesignation}
                onChange={(e) => setSelectedDesignation(e.target.value)}
                input={<OutlinedInput label="Designation" />}
                renderValue={(selected) => {
                  const maxVisible = 3;
                  const extraCount = selected.length - maxVisible;
                  return (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        overflow: "hidden",
                      }}
                    >
                      {selected.slice(0, maxVisible).map((id) => {
                        const d = designationList.find((item) => item.id === id);
                        return <Chip key={id} label={d?.name ?? id} size="small" />;
                      })}
                      {extraCount > 0 && (
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", whiteSpace: "nowrap" }}
                        >
                          +{extraCount} more
                        </Typography>
                      )}
                    </Box>
                  );
                }}
                sx={{
                  "& .MuiSelect-select": {
                    display: "flex",
                    alignItems: "center",
                    height: "22px !important",
                    overflow: "hidden",
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
          </Box>

          {/* Right Side: Tabs & Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { sm: "row" },
              justifyContent: { xs: "center", sm: "flex-end" },
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1.5,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {reportingPersonList.length > 0 && (
              <Tabs
                value={isTreeView ? 1 : 0}
                onChange={handlePrefChange}
                indicatorColor="none"
                sx={{
                  minHeight: 36,
                  border: "1px solid #2a9d8f",
                  borderRadius: 1,
                  overflow: "hidden",
                  width: { sm: "auto" },
                  "& .MuiTabs-flexContainer": { height: "100%" },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    minHeight: 36,
                    height: "38px",
                    flex: 1,
                    color: "#2a9d8f",
                    whiteSpace: "nowrap",
                    padding: "0 12px",
                    margin: 0,
                    borderRadius: 0,
                    "&.Mui-selected": { color: "#fff", backgroundColor: "#2a9d8f" },
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
                  height: "40px",
                  textWrap: "nowrap",
                  width: { sm: "auto" },
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
                  height: "40px",
                  width: { sm: "auto" },
                }}
                startIcon={<FilterListIcon color="primary" />}
                onClick={() => setFilterOpen(true)}
              >
                Filters
              </Button>
            )}
          </Box>
        </Box>


        <FilterDrawer
          open={filterOpen}
          onClose={() => {
            setFilterOpen(false);
            setPage(0);
          }}
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

      <AddLanguageModal
        open={languageModelOpen}
        educationalLanguage={educationalLanguage}
        setEducationalLanguage={setEducationalLanguage}
        otherValue={otherLanguageValue}
        setOtherValue={setOtherLanguageValue}
        onSave={SubmitUpdateUser}
      />

      {openTreeView ? (
        <UserTreeView treeData={Array.isArray(rows) ? rows : [rows]} />
      ) : (
        <Paper sx={{ width: "100%", mb: 2, mt: 2, p: "8px 16px", pb: 0 }}>
          <TableContainer>
            <Table sx={{ minWidth: 750 }} size="small">
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
                      hover={index != 0}
                      key={row.user_id ?? index}
                      sx={{
                        height: "50px",
                        background: `${index == 0 && !isPM ? "#f2f2f2" : ""}`,
                        "& .MuiTableCell-root": {
                          py: 0.45,
                          height: "50px",
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
                          ? dayjs(row.last_communication_date).format("DD/MM/YYYY \u00A0 hh:mm A") 
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
