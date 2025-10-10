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
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const decodedToken = decodeToken();
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("date");

  const [filterOpen, setFilterOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const [exactDate, setExactDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  // ------------------ FETCH DATA ------------------
  const fetchData = async () => {
    try {
      setLoading(true);

      const payload = {
        id: +id,
        offset: page * rowsPerPage,
        limit: rowsPerPage,
        order: [[orderBy, order.toUpperCase()]],
        ...(exactDate && { dateExact: exactDate }),
        ...(fromDate && { dateFrom: fromDate }),
        ...(toDate && { dateTo: toDate }),
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
            variant="h4"
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
              }}
              onClick={() => setAddModalOpen(true)}
            >
              Add Practice
            </Button>
          ) : (
            ""
          )}
          <Button
            variant="outlined"
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              fontWeight: "bold",
            }}
            startIcon={<FilterListIcon />}
            onClick={() => setFilterOpen(true)}
          >
            Filters
          </Button>
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
          <h3 style={{ color: "#2a9d8f", marginBottom: 0 }}>
            Delete Confirmation
          </h3>
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
