import React, { useEffect, useState, useCallback } from "react";
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
import Header from "../../components/header";
import PracticeFilterDrawer from "./filter";
import dayjs from "dayjs";
import {
  deletePractice,
  getPracticeDetailsByUserId,
} from "../../services/authentication";
import AddPracticeModal from "../../components/addPractice";
import CommunicationTableHead from "../../components/communicationListTableHead";

// ---------------- Helper renderers ----------------
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
      <LinkSharpIcon fontSize="small" color="#1976d2" />
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

export const CommunicationListDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("date");
  const [filterOpen, setFilterOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Filter state
  const [exactDate, setExactDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [clearTriggered, setClearTriggered] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const fetchData = useCallback(async (filters = {}) => {
    try {
      setLoading(true);

      const payload = {
        id: +id,
        ...filters,
        ...(filters.order ? {} : { order: [["date", order.toUpperCase()]]  }),
      };

      const response = await getPracticeDetailsByUserId(payload);
      if (response?.payload?.practices) {
        const { practices, total } = response.payload;
        const formatted = practices.map((p) => ({
          id: +p.id,
          date_of_practice: p.date,
          link: p.link,
          feedback: p.feedback || "—",
        }));
        setRows(formatted);
        setTotalCount(total || formatted.length);
      } else {
        toast.info("No communication practices found.");
        setRows([]);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Failed to fetch practices");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sorting, pagination handlers
  const handleRequestSort = (event, property) => {
    if (property !== "date_of_practice") return; // only allow sorting by date

    const isAsc = orderBy === property && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    setOrder(newOrder);
    setOrderBy(property);

    // Call API with sorting info
    const sortPayload = {
      order: [["date", newOrder.toUpperCase()]],
    };
    fetchData(sortPayload);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);

    // Fetch new page data from API
    fetchData({
      offset: newPage * rowsPerPage,
      limit: rowsPerPage,
      order: [[orderBy, order.toUpperCase()]],
    });
  };
  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);

    // Fetch first page of new page size
    fetchData({
      offset: 0,
      limit: newRowsPerPage,
      order: [[orderBy, order.toUpperCase()]],
    });
  };

  // Delete logic
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
      if (selectedDeleteId) {
        await deletePractice(selectedDeleteId);

        setRows((prev) => prev.filter((row) => row.id !== selectedDeleteId));
        setTotalCount((prev) => prev - 1);

        toast.success("Practice deleted successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete practice");
    } finally {
      handleDeleteClose();
    }
  };
  const handleOpenModal = () => setAddModalOpen(true);

  useEffect(() => {
    if (clearTriggered) {
      fetchData();
      setClearTriggered(false);
    }
  }, [clearTriggered]);

  const handleClearFilters = () => {
    setExactDate(null);
    setToDate(null);
    setFromDate(null);
    setPage(0);
    setClearTriggered(true);
  };

  // Filtering and sorting
  const filteredRows = rows.filter((row) => {
    const rowDate = dayjs(row.date_of_practice);
    if (exactDate && !rowDate.isSame(dayjs(exactDate), "day")) return false;
    if (fromDate && rowDate.isBefore(dayjs(fromDate), "day")) return false;
    if (toDate && rowDate.isAfter(dayjs(toDate), "day")) return false;
    return true;
  });

  const sortedRows = [...filteredRows].sort((a, b) => {
    let comparison = 0;
    if (orderBy === "date" || orderBy === "date_of_practice") {
      comparison =
        new Date(a.date_of_practice).getTime() -
        new Date(b.date_of_practice).getTime();
    } else if (orderBy === "feedback") {
      comparison = a.feedback.localeCompare(b.feedback);
    }
    return order === "asc" ? comparison : -comparison;
  });

  return (
    <div style={{ width: "100%" }}>
      {/* Top Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          padding: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ArrowBackIosIcon
            onClick={() => navigate(-1)}
            sx={{
              fontSize: "1.8rem",
              height: 48,
              fontWeight: "bold",
              cursor: "pointer",
              color: theme.palette.primary.main,
            }}
          />
          <Typography
            variant="h4"
            sx={{ fontWeight: "bold", color: theme.palette.primary.main }}
          >
            Communication List
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              fontWeight: "bold",
            }}
            onClick={handleOpenModal}
          >
            Add Practice
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

        {/* Fixed Filter Drawer usage */}
        <PracticeFilterDrawer
          open={filterOpen}
          onClose={() => {
            setFilterOpen(false);
          }}
          exactDate={exactDate}
          setExactDate={setExactDate}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          onClear={handleClearFilters}
          onApply={(filters) => {
            const { exactDate, fromDate, toDate } = filters;
            setExactDate(exactDate);
            setFromDate(fromDate);
            setToDate(toDate);

            const payload = {};
            if (exactDate) payload.exactDate = exactDate;
            if (fromDate) payload.fromDate = fromDate;
            if (toDate) payload.toDate = toDate;

            fetchData(payload);
            setFilterOpen(false);
          }}
        />
      </Box>

      {/* Data Table */}
      <Paper sx={{ width: "100%", p: "8px 16px", pb: 0 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <CommunicationTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              setPage={setPage}
            />
            <TableBody>
              {sortedRows.length > 0 ? (
                sortedRows.map((row) => (
                  <TableRow
                    hover
                    key={row.id}
                    sx={{
                      height: "60px",
                      "& .MuiTableCell-root": {
                        py: 1,
                      },
                    }}
                  >
                    <TableCell>
                      {dayjs(row.date_of_practice).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>
                      {dayjs(row.date_of_practice).format("hh:mm A")}
                    </TableCell>
                    <TableCell>{renderLink(row.link)}</TableCell>
                    <TableCell>{renderWithTooltip(row.feedback)}</TableCell>
                    <TableCell align="center">
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
      <AddPracticeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmitSuccess={() => {
          fetchData();
          setAddModalOpen(false);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle sx={{ fontWeight: "bold" }}>
          <h3 style={{ color: "#2a9d8f", marginBottom: 0 }}>
            Delete Confirmation
          </h3>
        </DialogTitle>

        <Divider
          sx={{ borderColor: "rgba(0,0,0,0.6)", borderBottomWidth: 1 }}
        />

        <DialogContent
          sx={{ borderRadius: 0, p: 3, m: 2, fontFamily: "Roboto" }}
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
            sx={{ textAlign: "center" }}
          >
            <InfoOutlinedIcon
              sx={{ fontSize: 80, fontWeight: 300, color: "#2a9d8f" }}
            />
            <DialogContentText sx={{ fontSize: "1.1rem", fontWeight: 500 }}>
              Are you sure you want to delete this practice record? <br />
              This action cannot be undone.
            </DialogContentText>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, display: "flex", justifyContent: "center" }}>
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
