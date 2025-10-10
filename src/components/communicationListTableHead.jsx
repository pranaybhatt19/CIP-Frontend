import React from "react";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";

const headCells = [
  { id: "date", label: "Date", sortable: true },
  { id: "time", label: "Time" },
  { id: "link", label: "Link" },
  { id: "feedback", label: "Feedback" },
  { id: "actions", label: "Actions" },
];

export default function CommunicationTableHead({
  order,
  orderBy,
  onRequestSort,
  setPage,
}) {
  const createSortHandler = (property) => (event) => {
    setPage(0);
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => {
          const isSortable = headCell.sortable;

          return (
            <TableCell
              key={headCell.id}
              align={
                headCell.id === "actions"
                  ? "center"
                  : headCell.numeric
                  ? "right"
                  : "left"
              }
              sortDirection={orderBy === headCell.id ? order : false}
              sx={{
                padding: "5px 10px",
                fontWeight: "bold",
                fontSize: "16px",
                textTransform: "capitalize",
              }}
            >
              {isSortable ? (
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={createSortHandler(headCell.id)}
                  sx={{
                    display: "flex",
                    justifyContent:
                      headCell.id === "actions" ? "center" : "flex-start",
                    "& .MuiTableSortLabel-icon": {
                      opacity: 0.3,
                    },
                    "&:hover .MuiTableSortLabel-icon, &.Mui-active .MuiTableSortLabel-icon":
                      {
                        opacity: 1,
                      },
                  }}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              ) : (
                headCell.label
              )}
            </TableCell>
          );
        })}
      </TableRow>
    </TableHead>
  );
}
