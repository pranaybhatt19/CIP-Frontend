import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  deleteTestById,
  getSkills,
  getUserTests,
} from "../../services/authentication";
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
  Chip,
  IconButton,
  Typography,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  DialogActions,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import AddTestModal from "../../components/addCommunicationPractice";
import { UserTestTableHead } from "../../components/userTestsTableHead";
import Header from "../../components/header";
import { Roles } from "../../util/enum";
import { toast } from "react-toastify";
import { decodeToken } from "../../util/commonFunction";
import PostAddIcon from "@mui/icons-material/PostAdd";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterDrawer from "./filter";
import dayjs from "dayjs";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export const UserTestDashboard = () => {
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("date_of_interview");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [selectedTechStack, setSelectedTechStack] = useState([]);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [techStackList, setTechStackList] = useState([]);
  const [selectedInterviewType, setSelectedInterviewType] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTechnical, setSelectedTechnical] = useState({
    type: "EQUALS",
    value: "",
  });
  const [selectedSoftSkills, setSelectedSoftSkills] = useState({
    type: "EQUALS",
    value: "",
  });

  const [selectedProblemSolving, setSelectedProblemSolving] = useState({
    type: "EQUALS",
    value: "",
  });
  const [selectedCommunication, setSelectedCommunication] = useState({
    type: "EQUALS",
    value: "",
  });
  const [selectedProjectDomain, setSelectedProjectDomain] = useState({
    type: "EQUALS",
    value: "",
  });
  const [selectedOverall, setSelectedOverall] = useState({
    type: "EQUALS",
    value: "",
  });
  const [selectedExactDate, setSelectedExactDate] = useState(null);
  const [selectedToDate, setSelectedToDate] = useState(null);
  const [selectedFromDate, setSelectedFromDate] = useState(null);
  const [addTestModalOpen, setAddTestModalOpen] = useState(false);
  const [clearTriggered, setClearTriggered] = useState(false);
  const [role, setRole] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const interviewTypes = [
    { id: "technical", name: "Technical" },
    { id: "softSkill", name: "Soft Skill" },
    { id: "mixed", name: "Mixed" },
  ];

  const interviewTypeDisplay = [
    { id: "technical", name: "Technical" },
    { id: "soft-skill", name: "Soft Skill" },
    { id: "mixed", name: "Mixed" },
  ];

  const fetchSkills = async () => {
    try {
      const skills = await getSkills();
      setTechStackList(skills.skills || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch skills");
    }
  };

  const fetchData = async () => {
    try {
      const user = decodeToken();
      setRole(user.role);
      const payload = {
        id,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        order: [[orderBy, order.toUpperCase()]],
      };

      if (selectedTechStack?.length > 0) {
        payload.skill_ids = selectedTechStack;
      }

      if (selectedInterviewType?.length > 0) {
        payload.interviewType = selectedInterviewType;
      }

      if (selectedTechnical?.value) {
        payload.technical_score = {
          type: selectedTechnical.type,
          value: selectedTechnical.value,
        };
      }

      if (selectedSoftSkills?.value) {
        payload.soft_skill_score = {
          type: selectedSoftSkills.type,
          value: selectedSoftSkills.value,
        };
      }

      if (selectedProblemSolving?.value) {
        payload.problem_solving_score = {
          type: selectedProblemSolving.type,
          value: selectedProblemSolving.value,
        };
      }
      if (selectedCommunication?.value) {
        payload.communication_score = {
          type: selectedCommunication.type,
          value: selectedCommunication.value,
        };
      }
      if (selectedProjectDomain?.value) {
        payload.project_domain_score = {
          type: selectedProjectDomain.type,
          value: selectedProjectDomain.value,
        };
      }
      if (selectedOverall?.value) {
        payload.overall_score = {
          type: selectedOverall.type,
          value: selectedOverall.value,
        };
      }

      if (selectedExactDate) {
        payload.dateExact = dayjs(selectedExactDate).format("YYYY-MM-DD");
      }

      if (selectedFromDate) {
        payload.dateFrom = dayjs(selectedFromDate).format("YYYY-MM-DD");
      }

      if (selectedToDate) {
        payload.dateTo = dayjs(selectedToDate).format("YYYY-MM-DD");
      }
      setLoading(true);
      await getUserTests(payload).then((res) => {
        setRows(res.data.tests || []);
        setTotalCount(res.data.total || 0);
        setUsername(res.data.user || "");
      });
    } catch (err) {
      toast.error(err.message || "Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    if (clearTriggered) {
      fetchData();
      setClearTriggered(false);
    }
  }, [clearTriggered]);

  useEffect(() => {
    fetchData();
  }, [order, orderBy, page, rowsPerPage, addTestModalOpen]);

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
    setSelectedTechStack([]);
    setSelectedInterviewType([]);
    setSelectedTechnical({
      type: "EQUALS",
      value: "",
    });
    setSelectedSoftSkills({
      type: "EQUALS",
      value: "",
    });
    setSelectedProblemSolving({
      type: "EQUALS",
      value: "",
    });
    setSelectedCommunication({
      type: "EQUALS",
      value: "",
    });
    setSelectedProjectDomain({
      type: "EQUALS",
      value: "",
    });
    setSelectedOverall({
      type: "EQUALS",
      value: "",
    });
    setSelectedExactDate(null);
    setSelectedToDate(null);
    setSelectedFromDate(null);
    setPage(0);
    setClearTriggered(true);
  };

  const handleDeleteOpen = () => setDeleteOpen(true);
  const handleDeleteClose = () => setDeleteOpen(false);

  const handleDeleteConfirm = async () => {
    try {
      if (selectedDeleteId != null) {
        const res = await deleteTestById(selectedDeleteId);
        fetchData();
        setSelectedDeleteId(null);
        toast.success("Test deleted successfully!");
      } else {
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete test result");
    }
    setDeleteOpen(false);
  };

  return (
    <div sx={{ width: "100%", padding: 2, overflow: "hidden" }}>
      <Header />
      <AddTestModal
        open={addTestModalOpen}
        onClose={() => setAddTestModalOpen(false)}
      />

      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          <h3 style={{ color: "#1976d2", marginBottom: 0 }}>
            Delete Confirmation
          </h3>
        </DialogTitle>

        <Divider
          sx={{
            borderColor: "rgba(0,0,0,0.6)", // darker border
            borderBottomWidth: 1,
          }}
        />

        <DialogContent
          sx={{
            // border: "1px solid #1976d2", // blue border
            borderRadius: 0,
            p: 3, // padding inside content
            m: 2, // margin around content
            fontFamily: "Roboto",
          }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            sx={{ textAlign: "center" }}
          >
            <InfoOutlinedIcon
              sx={{
                fontFamily: "Roboto",
                fontSize: 80,
                fontWeight: 300,
                color: "#1976d2",
              }}
            />
            <DialogContentText
              sx={{ fontSize: "1.1rem", fontWeight: 500, fontFamily: "Roboto" }}
            >
              Are you sure you want to delete this test result? <br />
              This action cannot be undone.
            </DialogContentText>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <Button
            onClick={handleDeleteConfirm}
            color="primary"
            variant="contained"
            autoFocus
          >
            Yes, Delete
          </Button>
          <Button
            onClick={handleDeleteClose}
            color="primary"
            variant="outlined"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Paper sx={{ width: "100%", mb: 2, p: 2, pb: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            marginTop: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <Box sx={{ display: "flex" }}>
            <ArrowBackIosIcon
              onClick={() => navigate(-1)}
              sx={{
                fontSize: "1.8rem",
                height: 48,
                fontWeight: "bold",
                cursor: "pointer",
                color: "#1976d2",
              }}
            ></ArrowBackIosIcon>
            {/* Heading */}
            <Typography
              variant="h4"
              marginLeft={0}
              sx={{
                fontWeight: "bold",
                color: "#1976d2",
                margingBottom: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              Test Results
              {`${
                role === Roles.MANAGER
                  ? username.name
                    ? `- ${username.name}`
                    : ""
                  : ""
              }`}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "38px",
                marginRight: 2,
                marginTop: 0.2,
                marginBottom: 0.2,
                fontWeight: "bold",
                width: 170,
                border: "1px solid",
                borderColor: "#1976d2",
                borderRadius: 1,
                color: "#1976d2",
                backgroundColor: "background.paper",
                fontSize: "15px",
              }}
            >
              Total Attempts: {totalCount}
            </Box>

            {role === Roles.DEVELOPER && (
              <Button
                // variant="outlined"
                sx={{
                  height: "38px",
                  marginRight: 2,
                  marginTop: 0.2,
                  marginBottom: 0.2,
                  fontWeight: "bold",
                  width: 170,
                  border: "1px solid",
                  borderColor: "#1976d2",
                  borderRadius: 1,
                  color: "#1976d2",
                  textTransform: "none !important",
                  fontSize: "15px",
                }}
                onClick={() => setAddTestModalOpen(true)}
                startIcon={<PostAddIcon />}
              >
                Add Test Result
              </Button>
            )}

            <Button
              // variant="outlined"
              sx={{
                height: "38px",
                // marginRight: 2,
                marginTop: 0.2,
                marginBottom: 0.2,
                fontWeight: "bold",
                width: 100,
                border: "1px solid",
                borderColor: "#1976d2",
                borderRadius: 1,
                color: "#1976d2",
                textTransform: "none !important",
                fontSize: "15px",
              }}
              onClick={() => setFilterOpen(true)}
              startIcon={<FilterListIcon color="primary" />}
            >
              Filters
            </Button>

            <FilterDrawer
              open={filterOpen}
              onClose={() => {
                setFilterOpen(false);
                setPage(0);
              }}
              selectedTechStack={selectedTechStack}
              setSelectedTechStack={setSelectedTechStack}
              selectedInterviewType={selectedInterviewType}
              setSelectedInterviewType={setSelectedInterviewType}
              selectedTechnical={selectedTechnical}
              setSelectedTechnical={setSelectedTechnical}
              selectedSoftSkills={selectedSoftSkills}
              setSelectedSoftSkills={setSelectedSoftSkills}
              selectedProblemSolving={selectedProblemSolving}
              setSelectedProblemSolving={setSelectedProblemSolving}
              selectedCommunication={selectedCommunication}
              setSelectedCommunication={setSelectedCommunication}
              selectedProjectDomain={selectedProjectDomain}
              setSelectedProjectDomain={setSelectedProjectDomain}
              selectedOverall={selectedOverall}
              setSelectedOverall={setSelectedOverall}
              selectedExactDate={selectedExactDate}
              setSelectedExactDate={setSelectedExactDate}
              selectedToDate={selectedToDate}
              setSelectedToDate={setSelectedToDate}
              selectedFromDate={selectedFromDate}
              setSelectedFromDate={setSelectedFromDate}
              techStackList={techStackList}
              interviewTypes={interviewTypes}
              onClear={handleClearFilters}
              onApply={() => {
                fetchData();
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            margin: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        ></Box>

        {/* Table */}
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
            <UserTestTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              setPage={setPage}
            />
            <TableBody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell align="left">
                      {row.technical_skill?.length ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "nowrap",
                            alignItems: "center",
                          }}
                        >
                          {row.technical_skill
                            .slice(0, 1)
                            .map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill.name || skill}
                                sx={{ mr: 0.5, fontSize: "11px" }}
                              />
                            ))}

                          {row.technical_skill.length > 1 && (
                            <Tooltip
                              title={row.technical_skill
                                .slice(1)
                                .map((s) => (s.name ? s.name : s))
                                .join(", ")}
                              arrow
                            >
                              <Chip
                                label={`+${
                                  row.technical_skill.length - 1
                                } more`}
                                size="small"
                                sx={{
                                  bgcolor: "grey.200",
                                  cursor: "pointer",
                                  fontSize: "10px",
                                }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    <TableCell align="left">
                      {interviewTypeDisplay.find(
                        (t) => t.id === row.interviewType
                      )?.name ?? "-"}
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
                    <TableCell align="left">
                      {`${dayjs(row.date).format("DD/MM/YYYY")} (${dayjs(
                        row.date
                      ).format("hh:mm A")})` ?? "-"}
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
                        <IconButton
                          aria-label="view"
                          onClick={() =>
                            navigate(`/test-detail-view/${row.id}`)
                          }
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {role === Roles.MANAGER && (
                          <IconButton
                            aria-label="view"
                            onClick={() => {
                              handleDeleteOpen();
                              setSelectedDeleteId(row.id);
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={11}
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
                      "No records found"
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

export default UserTestDashboard;
