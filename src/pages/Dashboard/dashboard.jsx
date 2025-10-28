import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  Link,
  Menu,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import FilterListIcon from "@mui/icons-material/FilterList";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import LabelIcon from "@mui/icons-material/Label";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "@mui/material/styles";
import AddUserModal from "../../components/addUser";
import FilterDrawer from "./filter";
import { decodeToken } from "../../util/commonFunction";
import {
  getDesignations,
  getEducationMedium,
  getReportingPersons,
  getTags,
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
import LinkSharpIcon from "@mui/icons-material/LinkSharp";
import EditUserModal from "../../components/editUser";
import EditTagsModal from "../../components/editTags";

const ratingColor = {
  true: "#4caf50",
  false: "#f44336",
};

export const Dashboard = () => {
  const DASHBOARD_FILTERS_STORAGE_KEY = "cip_dashboard_filters";

  const getDefaultFilterState = () => ({
    searchName: "",
    selectedDesignation: [],
    selectedExperience: { type: "EQUALS", value: "" },
    selectedReportingPerson: [],
    selectedTags: [],
    selectedMediumOfEducation: [],
    selectedStatus: true,
    selectedAttempts: { type: "EQUALS", value: "" },
    lastAttemptedDate: { exactDate: null, fromDate: null, toDate: null },
    page: 0,
    rowsPerPage: 25,
    order: "asc",
    orderBy: "full_name",
    totalCount: 0,
    isTreeView: true,
  });
  const getInitialFilterState = () => {
    try {
      const savedFilters = sessionStorage.getItem(
        DASHBOARD_FILTERS_STORAGE_KEY
      );
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        if (parsedFilters.lastAttemptedDate?.exactDate) {
          parsedFilters.lastAttemptedDate.exactDate = dayjs(
            parsedFilters.lastAttemptedDate.exactDate
          );
        }
        if (parsedFilters.lastAttemptedDate?.fromDate) {
          parsedFilters.lastAttemptedDate.fromDate = dayjs(
            parsedFilters.lastAttemptedDate.fromDate
          );
        }
        if (parsedFilters.lastAttemptedDate?.toDate) {
          parsedFilters.lastAttemptedDate.toDate = dayjs(
            parsedFilters.lastAttemptedDate.toDate
          );
        }
        return parsedFilters;
      }
      return getDefaultFilterState();
    } catch (error) {
      sessionStorage.removeItem(DASHBOARD_FILTERS_STORAGE_KEY);
      return getDefaultFilterState();
    }
  };
  const storedFilters = getInitialFilterState();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.up("sm"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const [openTreeView, setOpenTreeView] = useState(false);
  const [languageModelOpen, setLanguageModalOpen] = useState(false);
  const [educationalLanguage, setEducationalLanguage] = useState("");
  const [selectedTags, setSelectedTags] = useState(
    storedFilters?.selectedTags ?? []
  );
  const [otherLanguageValue, setOtherLanguageValue] = useState("");
  const [userId, setUserId] = useState(null);
  const [userRM, setUserRM] = useState(null);
  const navigate = useNavigate();
  const [userDesignation, setUserDesignation] = useState("");
  const [page, setPage] = useState(storedFilters?.page ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(
    storedFilters?.rowsPerPage ?? 25
  );
  const [order, setOrder] = useState(storedFilters?.order ?? "asc");
  const [orderBy, setOrderBy] = useState(storedFilters?.orderBy ?? "full_name");
  const [isTreeView, setIsTreeView] = useState(
    storedFilters?.isTreeView ?? false
  );
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPM, setIsPM] = useState(false);
  const [filters, setFilters] = useState({});

  const [filterOpen, setFilterOpen] = useState(false);
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);

  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editUserData, setEditUserData] = useState(null);

  const [editTagsModalOpen, setEditTagsModalOpen] = useState(false);
  const [editTagsData, setEditTagsData] = useState(null);

  const [currentUserId, setCurrentUserId] = useState(0);

  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  // Filters
  const [searchName, setSearchName] = useState(storedFilters?.searchName ?? "");
  const [selectedDesignation, setSelectedDesignation] = useState(
    storedFilters?.selectedDesignation ?? []
  );
  const [selectedExperience, setSelectedExperience] = useState(
    storedFilters?.selectedExperience ?? { type: "EQUALS", value: "" }
  );
  const [selectedReportingPerson, setSelectedReportingPerson] = useState(
    storedFilters?.selectedReportingPerson ?? []
  );
  const [selectedMediumOfEducation, setSelectedMediumOfEducation] = useState(
    storedFilters?.selectedMediumOfEducation ?? []
  );
  const [selectedStatus, setSelectedStatus] = useState(
    storedFilters?.selectedStatus ?? null
  );
  const [selectedAttempts, setSelectedAttempts] = useState(
    storedFilters?.selectedAttempts ?? { type: "EQUALS", value: "" }
  );
  const [tagsList, setTagsList] = useState([]);
  const [lastAttemptedDate, setLastAttemptedDate] = useState(
    storedFilters?.lastAttemptedDate ?? {
      exactDate: null,
      fromDate: null,
      toDate: null,
    }
  );

  const [designationList, setDesignationList] = useState([]);
  const [reportingPersonList, setReportingPersonList] = useState([]);
  const [languageList, setLanguageList] = useState([]);
  const [clearTriggered, setClearTriggered] = useState(false);

  const saveFilterStateToSession = useCallback((currentFilters) => {
    const serializableFilters = {
      ...currentFilters,
      lastAttemptedDate: {
        exactDate:
          currentFilters.lastAttemptedDate?.exactDate?.toString() || null,
        fromDate:
          currentFilters.lastAttemptedDate?.fromDate?.toString() || null,
        toDate: currentFilters.lastAttemptedDate?.toDate?.toString() || null,
      },
    };
    sessionStorage.setItem(
      DASHBOARD_FILTERS_STORAGE_KEY,
      JSON.stringify(serializableFilters)
    );
  }, []);

  // Menu handlers
  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleViewClick = () => {
    if (selectedRow) {
      navigate(`/user-practices/${selectedRow.user_id}`);
    }
    handleMenuClose();
  };

  const handleEditUserClick = () => {
    if (selectedRow) {
      setEditUserData(selectedRow);
      setEditUserModalOpen(true);
    }
    handleMenuClose();
  };

  const handleEditTagsClick = () => {
    if (selectedRow) {
      setEditTagsData({
        user_id: selectedRow.user_id,
        name: selectedRow.full_name,
        tags: selectedRow.tags || [],
      });
      setEditTagsModalOpen(true);
    }
    handleMenuClose();
  };

  const setValuesToStates = () => {
    const updatedFilterState = {
      searchName: searchName,
      selectedDesignation: selectedDesignation,
      selectedExperience: selectedExperience,
      selectedReportingPerson: selectedReportingPerson,
      selectedTags: selectedTags,
      selectedMediumOfEducation: selectedMediumOfEducation,
      selectedStatus: selectedStatus,
      selectedAttempts: selectedAttempts,
      lastAttemptedDate: lastAttemptedDate,
      page: page,
      rowsPerPage: rowsPerPage,
      order: order,
      orderBy: orderBy,
      totalCount: totalCount,
      isTreeView: isTreeView,
    };
    saveFilterStateToSession(updatedFilterState);
    return updatedFilterState;
  };
  const isEndUser = decodeToken()?.isEndUser ?? true;
  const fetchData = async () => {
    try {
      const currentValues = setValuesToStates();
      const payload = {
        isTreeView: currentValues.isTreeView,
      };

      if (!isTreeView) {
        payload.limit = currentValues.rowsPerPage;
        payload.offset = currentValues.page * currentValues.rowsPerPage;
        payload.order = [
          [currentValues.orderBy, currentValues.order.toUpperCase()],
        ];
      }

      if (currentValues.searchName?.trim())
        payload.full_name = currentValues.searchName.trim();
      if (currentValues.selectedDesignation?.length > 0)
        payload.designation_ids = currentValues.selectedDesignation;
      if (currentValues.selectedExperience?.value)
        payload.experience = currentValues.selectedExperience;
      if (currentValues.selectedReportingPerson?.length > 0)
        payload.reporting_persons_ids = currentValues.selectedReportingPerson;
      if (currentValues.selectedTags?.length > 0)
        payload.tags_filter = currentValues.selectedTags;
      if (currentValues.selectedMediumOfEducation?.length > 0)
        payload.education_medium = currentValues.selectedMediumOfEducation.map(
          (item) => item.toLowerCase()
        );
      if (currentValues.selectedAttempts?.value)
        payload.attempts = currentValues.selectedAttempts;

      const dateFilter = currentValues.lastAttemptedDate;
      if (
        currentValues.lastAttemptedDate?.exactDate ||
        currentValues.lastAttemptedDate?.fromDate ||
        currentValues.lastAttemptedDate?.toDate
      ) {
        payload.last_communication_date = currentValues.lastAttemptedDate;
      }
      payload.active_status = currentValues.selectedStatus;

      setLoading(true);
      const currentUserId = decodeToken()?.sub;
      setCurrentUserId(currentUserId);
      const designation = decodeToken()?.designation;
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

  const fetchDataRef = useRef(fetchData);

  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  const debouncedSearch = useMemo(
    () =>
      debounce(() => {
        setPage(0);
        fetchDataRef.current();
      }, 1000),
    []
  );

  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchName, selectedDesignation]);

  useEffect(() => {
    const decodedToken = decodeToken();
    if (decodedToken?.designation)
      setUserDesignation(decodedToken.designation?.name);
    if (decodedToken?.sub) setUserId(decodedToken.sub);
    if (decodedToken?.reportingPerson) setUserRM(decodedToken?.reportingPerson);
    fetchDesignations();
    fetchReportingPersons();
    fetchEducationMedium();
    fetchTagsList();
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
        toast.error(err.message || "Failed to fetch reporting officers");
      } else {
        setLanguageModalOpen(true);
      }
    }
  };

  const fetchEducationMedium = async () => {
    try {
      const res = await getEducationMedium();
      setLanguageList(res.data || []);
    } catch (err) {
      if (err.status != 409) {
        toast.error(err.message || "Failed to fetch education medium");
      } else {
        setLanguageModalOpen(true);
      }
    }
  };
  const fetchTagsList = async () => {
    try {
      const response = await getTags();
      const formattedTags = (response.data || []).map((tag) => tag);
      setTagsList(formattedTags);
    } catch (error) {
      console.error("Failed to load tags list:", error);
    }
  };
  useEffect(() => {
    if (clearTriggered) {
      fetchData();
      setClearTriggered(false);
    }
  }, [clearTriggered]);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    fetchData(newFilters);
  };

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
      fetchEducationMedium();
      fetchTagsList();
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
    setSelectedMediumOfEducation([]);
    setSelectedStatus(true);
    setSelectedTags([]);
    setSelectedAttempts({ type: "EQUALS", value: "" });
    setLastAttemptedDate({
      exactDate: null,
      fromDate: null,
      toDate: null,
    });
    setPage(0);
    setClearTriggered(true);
    sessionStorage.removeItem(DASHBOARD_FILTERS_STORAGE_KEY);
  };

  const isManager = ["PM", "APM", "STL", "TL"].includes(userDesignation);

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
            justifyContent: {
              xs: "space-between",
              sm: "center",
              md: "flex-end",
            },
            alignItems: { xs: "stretch" },
            flexWrap: "wrap",
            gap: 2,
            width: isSmallScreen ? "auto" : "100%",
          }}
        >
          {/* Left Side: Filters */}
          {isEndUser && (
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

              <FormControl
                sx={{ width: { xs: "100%", sm: "47%", lg: "240px" } }}
                size="small"
              >
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
                          const d = designationList.find(
                            (item) => item.id === id
                          );
                          return (
                            <Chip key={id} label={d?.name ?? id} size="small" />
                          );
                        })}
                        {extraCount > 0 && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              whiteSpace: "nowrap",
                            }}
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
          )}

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
            {isEndUser && (
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

            {isManager && (
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

            {isEndUser && (
              <Box position="relative" display="inline-block">
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

                {(selectedExperience.length > 0 ||
                  selectedReportingPerson.length > 0 ||
                  selectedMediumOfEducation.length > 0 ||
                  selectedAttempts.length > 0 ||
                  lastAttemptedDate.exactDate != null ||
                  lastAttemptedDate.fromDate != null ||
                  lastAttemptedDate.toDate != null) && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.primary.main,
                    }}
                  />
                )}
              </Box>
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
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          selectedMediumOfEducation={selectedMediumOfEducation}
          setSelectedMediumOfEducation={setSelectedMediumOfEducation}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedAttempts={selectedAttempts}
          setSelectedAttempts={setSelectedAttempts}
          lastAttemptedDate={lastAttemptedDate}
          setLastAttemptedDate={setLastAttemptedDate}
          reportingPersonList={reportingPersonList}
          tagsList={tagsList}
          languageList={languageList}
          onClear={handleClearFilters}
          onApply={handleApplyFilters}
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
        <UserTreeView
          key={JSON.stringify(rows)}
          treeData={Array.isArray(rows) ? rows : [rows]}
          userId={userId}
          userRM={userRM}
          designation={userDesignation}
          fetchData={fetchData}
        />
      ) : (
        <Paper sx={{ width: "100%", mb: 2, mt: 2, p: "8px 16px", pb: 0 }}>
          <TableContainer>
            <Table sx={{ minWidth: 750 }} size="small">
              <DashboardTableHead
                order={order}
                orderBy={orderBy}
                onRequestSort={handleRequestSort}
                setPage={setPage}
                designation={userDesignation}
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
                      <TableCell
                        align="left"
                        sx={{ pl: "5px", width: "250px" }}
                      >
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
                      {isManager && (
                        <TableCell align="left">
                          {row.tags?.length > 0 ? (
                            <Tooltip
                              title={
                                <Box sx={{ p: 1 }}>
                                  {row.tags.map((tag) => (
                                    <Typography key={tag} variant="body2">
                                      • {tag}
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
                                {row.tags.slice(0, 1).map((tag) => (
                                  <Chip
                                    key={tag}
                                    label={tag}
                                    sx={{
                                      mr: 0.5,
                                      fontSize: "11px",
                                    }}
                                  />
                                ))}

                                {row.tags.length > 1 && (
                                  <Chip
                                    label={`+${row.tags.length - 1} more`}
                                    size="small"
                                    sx={{
                                      bgcolor: "grey.200",
                                      cursor: "pointer",
                                      fontSize: "10px",
                                    }}
                                  />
                                )}
                              </Box>
                            </Tooltip>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      )}
                      <TableCell sx={{ pl: "5px", width: "200px" }}>
                        {row.designation?.name ?? "-"}
                      </TableCell>
                      <TableCell sx={{ pl: "5px", width: "200px" }}>
                        {row.experience ?? "-"}
                      </TableCell>
                      <TableCell sx={{ pl: "5px", width: "250px" }}>
                        {row.reporting_person?.name
                          ? row.reporting_person?.name
                              .split(" ")
                              .map((word, idx, arr) =>
                                idx > 0 && idx < arr.length - 1 ? "" : word
                              )
                              .join(" ")
                          : "-"}
                      </TableCell>
                      <TableCell sx={{ pl: "5px", width: "220px" }}>
                        {row.education_medium
                          ? row.education_medium.charAt(0).toUpperCase() +
                            row.education_medium.slice(1)
                          : "-"}
                      </TableCell>
                      <TableCell sx={{ pl: "5px", width: "200px" }}>
                        <Chip
                          label={
                            row.active_status == true ? "Active" : "In Active"
                          }
                          sx={{
                            backgroundColor: ratingColor[row.active_status],
                            color: "white",
                            fontWeight: "bold",
                            width: "120px",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ pl: "5px", width: "300px" }}>
                        {row.last_communication_date ? (
                          <Link
                            href={row.link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="none"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              color: "#000000de",
                              transition: "color 0.2s ease",
                              "&:hover": {
                                color: theme.palette.primary.main,
                                textDecoration: "underline",
                              },
                              cursor: row.link ? "pointer" : "default",
                            }}
                          >
                            <LinkSharpIcon fontSize="small" sx={{ mr: 0.3 }} />
                            {dayjs(row.last_communication_date).format(
                              "DD/MM/YYYY\u00A0\u00A0hh:mm A"
                            )}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell sx={{ pl: "5px" }}>
                        {row.attempts ?? "-"}
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Tooltip title="Actions">
                            <IconButton
                              id="action-button"
                              aria-label="actions"
                              aria-controls={
                                Boolean(anchorEl) ? "action-menu" : undefined
                              }
                              aria-haspopup="true"
                              aria-expanded={
                                Boolean(anchorEl) ? "true" : undefined
                              }
                              onClick={(e) => handleMenuOpen(e, row)}
                              size="small"
                            >
                              <MoreVertIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
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

          {/* Actions Menu */}
          <Menu
            id="action-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            MenuListProps={{
              "aria-labelledby": "action-button",
            }}
          >
            <MenuItem onClick={handleViewClick}>
              <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
              View
            </MenuItem>
            {isManager &&
              (selectedRow?.user_id !== currentUserId || userRM === null) && (
                <>
                  <MenuItem onClick={handleEditUserClick}>
                    <EditIcon sx={{ mr: 1, fontSize: 20 }} />
                    Edit User
                  </MenuItem>
                  <MenuItem onClick={handleEditTagsClick}>
                    <LabelIcon sx={{ mr: 1, fontSize: 20 }} />
                    Edit Tags
                  </MenuItem>
                </>
              )}
          </Menu>

          {/* Edit User Modal */}
          <EditUserModal
            open={editUserModalOpen}
            onClose={() => setEditUserModalOpen(false)}
            userData={editUserData}
            languageList={languageList}
            currentUserId={userId}
            onUpdated={fetchData}
          />

          {/* Edit Tags Modal */}
          <EditTagsModal
            open={editTagsModalOpen}
            onClose={() => {
              setEditTagsModalOpen(false);
              fetchData();
            }}
            userData={editTagsData}
          />

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
