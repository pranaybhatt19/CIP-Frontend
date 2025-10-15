import React, { useCallback, useEffect, useState } from "react";
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Tooltip,
  Link,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import FilterListIcon from "@mui/icons-material/FilterList";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LinkSharpIcon from "@mui/icons-material/LinkSharp";
import { useTheme } from "@mui/material/styles";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";

import PracticeFilterDrawer from "./filter";
import {
  deletePractice,
  getPracticeDetailsByUserId,
} from "../../services/authentication";
import AddPracticeModal from "../../components/addPractice";
import CommunicationTableHead from "../../components/communicationListTableHead";
import { decodeToken } from "../../util/commonFunction";

const renderWithTooltip = (text, limit = 40) => {
  if (!text) return "—";
  const isTruncated = text.length > limit;
  const displayText = isTruncated ? text.slice(0, limit) + "..." : text;
  return isTruncated ? (
    <Tooltip title={text} placement="bottom-start" arrow>
      <span>{displayText}</span>
    </Tooltip>
  ) : (
    <span>{displayText}</span>
  );
};

const renderLink = (url) => {
  if (!url) return "N/A";
  const maxLength = 35;
  const isTruncated = url.length > maxLength;
  const displayText = isTruncated ? url.slice(0, maxLength) + "..." : url;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      sx={{ display: "flex", alignItems: "center", gap: "6px" }}
    >
      <LinkSharpIcon fontSize="small" />
      {isTruncated ? (
        <Tooltip title={url} placement="bottom-start" arrow>
          <span>{displayText}</span>
        </Tooltip>
      ) : (
        <span>{displayText}</span>
      )}
    </Link>
  );
};

const CommunicationListDashboard = () => {
  const COMMUNICATION_DASHBOARD_FILTERS_STORAGE_KEY =
    "cip_communication_dashboard_filters";

  const getDefaultFilterState = () => ({
    exactDate: null,
    fromDate: null,
    toDate: null,
    page: 0,
    rowsPerPage: 25,
    order: "asc",
    orderBy: "date",
    totalCount: 0,
  });
  const getInitialFilterState = () => {
    try {
      const savedFilters = sessionStorage.getItem(
        COMMUNICATION_DASHBOARD_FILTERS_STORAGE_KEY
      );
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        if (parsedFilters?.exactDate) {
          parsedFilters.exactDate = dayjs(parsedFilters.exactDate);
        }
        if (parsedFilters?.fromDate) {
          parsedFilters.fromDate = dayjs(parsedFilters.fromDate);
        }
        if (parsedFilters?.toDate) {
          parsedFilters.toDate = dayjs(parsedFilters.toDate);
        }
        return parsedFilters;
      }
      return getDefaultFilterState();
    } catch (error) {
      console.error(
        "Failed to parse saved filters from session storage",
        error
      );
      sessionStorage.removeItem(COMMUNICATION_DASHBOARD_FILTERS_STORAGE_KEY);
      return getDefaultFilterState();
    }
  };
  const saveFilterStateToSession = useCallback((currentFilters) => {
    const serializableFilters = {
      ...currentFilters,
      exactDate: currentFilters?.exactDate?.toString() || null,
      fromDate: currentFilters?.fromDate?.toString() || null,
      toDate: currentFilters?.toDate?.toString() || null,
    };
    sessionStorage.setItem(
      COMMUNICATION_DASHBOARD_FILTERS_STORAGE_KEY,
      JSON.stringify(serializableFilters)
    );
  }, []);
  const storedFilters = getInitialFilterState();
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const decodedToken = decodeToken();
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [page, setPage] = useState(storedFilters?.page ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(
    storedFilters?.rowsPerPage ?? 25
  );
  const [order, setOrder] = useState(storedFilters?.order ?? "asc");
  const [orderBy, setOrderBy] = useState(storedFilters?.orderBy ?? "date");

  const [filterOpen, setFilterOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [exactDate, setExactDate] = useState(storedFilters.exactDate);
  const [fromDate, setFromDate] = useState(storedFilters.fromDate);
  const [toDate, setToDate] = useState(storedFilters.toDate);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  // ------------------ FETCH DATA ------------------
  const fetchData = async () => {
    try {
      const currentValues = setValuesToStates();
      setLoading(true);

      const payload = {
        id: +id,
        offset: currentValues.page * currentValues.rowsPerPage,
        limit: currentValues.rowsPerPage,
        order: [[currentValues.orderBy, currentValues.order.toUpperCase()]],
        ...(currentValues.exactDate && { dateExact: currentValues.exactDate }),
        ...(currentValues.fromDate && { dateFrom: currentValues.fromDate }),
        ...(currentValues.toDate && { dateTo: currentValues.toDate }),
      };

      const response = await getPracticeDetailsByUserId(payload);
      if (response?.payload?.practices) {
        const { practices, total, user } = response.payload;
        const formatted = practices.map((p) => ({
          id: +p.id,
          date_of_practice: p.date,
          link: p.link,
          feedback: p.feedback || "—",
        }));
        setRows(formatted);
        setUser(user);
        setTotalCount(total ?? formatted.length);
      } else {
        setRows([]);
        setTotalCount(0);
      }
    } catch (err) {
      if (err.status === 409) {
        navigate("/dashboard");
      } else {
        toast.error(err?.message || "Failed to fetch practices");
      }
    } finally {
      setLoading(false);
    }
  };

  const setValuesToStates = () => {
    const updatedFilterState = {
      exactDate: exactDate,
      fromDate: fromDate,
      toDate: toDate,
      page: page,
      rowsPerPage: rowsPerPage,
      order: order,
      orderBy: orderBy,
      totalCount: totalCount,
    };
    saveFilterStateToSession(updatedFilterState);
    return updatedFilterState;
  };

  useEffect(() => {
    fetchData();
  }, [id, page, rowsPerPage, order, orderBy, exactDate, fromDate, toDate]);

  // ------------------ SORTING ------------------
  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // ------------------ PAGINATION ------------------
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // ------------------ DELETE HANDLERS ------------------
  const handleDeleteOpen = (id) => {
    setSelectedDeleteId(id);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedDeleteId(null);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (!selectedDeleteId) return;
      await deletePractice(selectedDeleteId);
      toast.success("Practice deleted successfully!");
      await fetchData();
    } catch (err) {
      if (err.status === 409) {
        navigate("/dashboard");
      } else {
        toast.error(
          err?.response?.data?.message || "Failed to delete practice"
        );
      }
    } finally {
      handleDeleteClose();
    }
  };

  // ------------------ FILTERS ------------------
  const handleClearFilters = () => {
    setExactDate(null);
    setFromDate(null);
    setToDate(null);
    setPage(0);
  };

  const handleApplyFilters = (filters) => {
    const { exactDate: e, fromDate: f, toDate: t } = filters;
    setExactDate(e ?? null);
    setFromDate(f ?? null);
    setToDate(t ?? null);
    setPage(0);
  };

  // ------------------ UI ------------------
  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          padding: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ArrowBackIosIcon
            onClick={() => navigate(-1)}
            sx={{
              fontSize: "1.8rem",
              height: 48,
              cursor: "pointer",
              color: theme.palette.primary.main,
            }}
          />
          <Typography
            variant="h3"
            sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
          >
            {`Communication List - ${
              user.name
                ? user.name
                    .split(" ")
                    .map((word, idx, arr) =>
                      idx > 0 && idx < arr.length - 1 ? word[0] : word
                    )
                    .join(" ")
                : "-"
            }`}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {decodedToken.sub === +id ? (
            <Button
              variant="outlined"
              sx={{
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                fontWeight: "bold",
                height: "40px",
                textWrap: "nowrap",
              }}
              onClick={() => setAddModalOpen(true)}
              startIcon={<AssignmentAddIcon />}
            >
              Add Practice
            </Button>
          ) : (
            ""
          )}
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

            {(exactDate != null || fromDate != null || toDate != null) && (
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
        </Box>

        <PracticeFilterDrawer
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          exactDate={exactDate}
          setExactDate={setExactDate}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          onClear={handleClearFilters}
          onApply={handleApplyFilters}
        />
      </Box>

      {/* Table */}
      <Paper sx={{ width: "100%", p: "8px 16px", pb: 0 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} size="small">
            <CommunicationTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              setPage={setPage}
            />
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    <CircularProgress
                      size="2rem"
                      sx={{ color: theme.palette.primary.main }}
                    />
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{
                      height: "50px",
                      "& .MuiTableCell-root": {
                        py: 0.45,
                        height: "50px",
                      },
                    }}
                  >
                    <TableCell sx={{ width: "250px" }}>
                      {dayjs(row.date_of_practice).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell sx={{ width: "250px" }}>
                      {dayjs(row.date_of_practice).format("hh:mm A")}
                    </TableCell>
                    <TableCell sx={{ width: "450px" }}>
                      {renderLink(row.link)}
                    </TableCell>
                    <TableCell sx={{ width: "450px" }}>
                      {renderWithTooltip(row.feedback)}
                    </TableCell>
                    <TableCell align="center" sx={{ width: "250px" }}>
                      <IconButton
                        aria-label="delete"
                        onClick={() => handleDeleteOpen(row.id)}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No data found
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

      <AddPracticeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmitSuccess={fetchData} // simply call the single fetchData function
      />

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          <Typography variant="h3" style={{ marginBottom: 0 }}>
            Delete Confirmation
          </Typography>
        </DialogTitle>

        <Divider
          sx={{ borderColor: "rgba(0,0,0,0.6)", borderBottomWidth: 1 }}
        />

        <DialogContent sx={{ p: 3, m: 2, textAlign: "center" }}>
          <InfoOutlinedIcon
            sx={{ fontSize: 80, fontWeight: 300, color: "#2a9d8f" }}
          />
          <DialogContentText sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
            Are you sure you want to delete this practice record? <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: "center" }}>
          <Button
            onClick={handleDeleteConfirm}
            color="primary"
            variant="contained"
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
    </div>
  );
};

export default CommunicationListDashboard;
