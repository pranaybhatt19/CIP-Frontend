import React from "react";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
import Box from "@mui/material/Box";

const headCells = [
  {
    id: "technology_stack",
    numeric: false,
    disablePadding: false,
    label: "Technology Stack",
  },
  {
    id: "interviewType",
    numeric: false,
    disablePadding: false,
    label: "Interview Type",
  },
  {
    id: "technical_score",
    numeric: false,
    disablePadding: false,
    label: "Technical",
  },
  {
    id: "problem_solving_score",
    numeric: false,
    disablePadding: false,
    label: "Problem Solving",
  },
  {
    id: "project_domain_score",
    numeric: false,
    disablePadding: false,
    label: "Project Domain",
  },
  {
    id: "communication_score",
    numeric: false,
    disablePadding: false,
    label: "Communication",
  },
  {
    id: "soft_skill_score",
    numeric: false,
    disablePadding: false,
    label: "Soft Skills",
  },
  {
    id: "overall_score",
    numeric: false,
    disablePadding: false,
    label: "Overall",
  },
  {
    id: "date_of_interview",
    numeric: false,
    disablePadding: false,
    label: "Date of Interview",
  },
  { id: "actions", numeric: false, disablePadding: false, label: "Actions" },
];

export function UserTestTableHead(props) {
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
              ...(headCell.id === "technology_stack" && {
                width: 200,
              }),
            }}
          >
            {headCell.id === "actions" || headCell.id === "technology_stack" ? (
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
