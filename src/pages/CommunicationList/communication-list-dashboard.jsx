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
import dayjs from "dayjs";

import {
  deletePractice,
  getPracticeDetailsByUserId,
} from "../../services/authentication";
import AddPracticeModal from "../../components/addPractice";
import CommunicationTableHead from "../../components/communicationListTableHead";
import PracticeFilterDrawer from "./filter";

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

  // ====================== State ======================
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("date");

  const [filterOpen, setFilterOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    exactDate: null,
    fromDate: null,
    toDate: null,
  });

  // Delete Dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  // ====================== Fetch Data ======================
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const payload = {
        id: +id,
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        order: [[orderBy, order.toUpperCase()]],
      };

      // Attach date filters if available
      if (filters.exactDate) payload.exact_date = filters.exactDate;
      if (filters.fromDate) payload.from_date = filters.fromDate;
      if (filters.toDate) payload.to_date = filters.toDate;

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
  }, [id, rowsPerPage, page, order, orderBy, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ====================== Handlers ======================
  const handleRequestSort = (_, property) => {
    if (property !== "date_of_practice") return; // only allow sorting by date
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Delete
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

  // ====================== Render ======================
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
            onClick={() => setAddModalOpen(true)}
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

        <PracticeFilterDrawer
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          exactDate={filters.exactDate}
          setExactDate={(val) => setFilters((prev) => ({ ...prev, exactDate: val }))}
          fromDate={filters.fromDate}
          setFromDate={(val) => setFilters((prev) => ({ ...prev, fromDate: val }))}
          toDate={filters.toDate}
          setToDate={(val) => setFilters((prev) => ({ ...prev, toDate: val }))}
          onApply={(newFilters) => {
            setFilters(newFilters);
            setFilterOpen(false);
          }}
        />
      </Box>

      {/* Table */}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size="2rem" sx={{ color: theme.palette.primary.main }} />
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((row) => (
                  <TableRow hover key={row.id}>
                    <TableCell>
                      {dayjs(row.date_of_practice).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>
                      {dayjs(row.date_of_practice).format("hh:mm A")}
                    </TableCell>
                    <TableCell>{renderLink(row.link)}</TableCell>
                    <TableCell>{renderWithTooltip(row.feedback)}</TableCell>
                    <TableCell align="center">
                      <IconButton onClick={() => handleDeleteOpen(row.id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
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

      <AddPracticeModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSubmitSuccess={fetchData}
      />

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle sx={{ fontWeight: "bold", color: "#2a9d8f" }}>
          Delete Confirmation
        </DialogTitle>
        <Divider sx={{ borderColor: "rgba(0,0,0,0.6)" }} />
        <DialogContent sx={{ p: 3 }}>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <InfoOutlinedIcon sx={{ fontSize: 80, color: "#2a9d8f" }} />
            <DialogContentText sx={{ fontSize: "1.1rem", fontWeight: 500, textAlign: "center" }}>
              Are you sure you want to delete this practice record?
              <br /> This action cannot be undone.
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={handleDeleteConfirm} variant="contained" color="primary">
            Yes, Delete
          </Button>
          <Button onClick={handleDeleteClose} variant="outlined" color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CommunicationListDashboard;
