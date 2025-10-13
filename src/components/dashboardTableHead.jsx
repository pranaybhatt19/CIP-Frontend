import React from "react";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";

const headCells = [
  { id: "full_name", numeric: false, disablePadding: false, label: "Name" },
  {
    id: "designation_name",
    numeric: false,
    disablePadding: false,
    label: "Designation",
  },
  {
    id: "experience_years",
    numeric: false,
    disablePadding: false,
    label: "Experience",
  },
  {
    id: "reporting_person_name",
    numeric: false,
    disablePadding: false,
    label: "Reporting Manager",
  },
  {
    id: "education_medium",
    numeric: false,
    disablePadding: false,
    label: "Medium",
  },
  {
    id: "last_communication_date",
    numeric: false,
    disablePadding: false,
    label: "Last Attempted On",
  },
  {
    id: "attempts_count",
    numeric: false,
    disablePadding: false,
    label: "Attempts",
  },
  { id: "actions", numeric: false, disablePadding: false, label: "Actions" },
];

export function DashboardTableHead(props) {
  const { order, orderBy, onRequestSort, setPage } = props;
  const createSortHandler = (property) => (event) => {
    setPage(0);
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={
              headCell.id === "actions"
                ? "center"
                : headCell.numeric
                ? "right"
                : "left"
            }
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={{
              padding: "5px",
              fontWeight: "bold",
              fontSize: "16px",
              ...(headCell.id === "full_name" && { width: 260 }),
            }}
          >
            {headCell.id === "actions" ||
            headCell.id === "full_name" ||
            headCell.id === "reporting_person_name" ? (
              headCell.label
            ) : (
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
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
