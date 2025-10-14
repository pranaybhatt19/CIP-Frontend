import { useState } from "react";
import { Table } from "rsuite";
import {
  Box,
  IconButton,
  Link,
  useTheme,
  Breadcrumbs,
  Typography,
} from "@mui/material";
import "rsuite/dist/rsuite.min.css";
import dayjs from "dayjs";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import LinkSharpIcon from "@mui/icons-material/LinkSharp";

const { Column, HeaderCell, Cell } = Table;

const transformToTree = (node) => ({
  id: node.user_id,
  label: node.full_name
    ? node.full_name
        .split(" ")
        .map((word, idx, arr) =>
          idx > 0 && idx < arr.length - 1 ? word[0] : word
        )
        .join(" ")
    : "-",
  designation: node.designation?.name ?? "-",
  experience: node.experience ?? "-",
  reporting_person: node.reporting_person?.name
    ? node.reporting_person?.name
        .split(" ")
        .map((word, idx, arr) => (idx > 0 && idx < arr.length - 1 ? "" : word))
        .join(" ")
    : "-",
  reporting_person_data: node.reporting_person,
  education_medium: node.education_medium
    ? node.education_medium.charAt(0).toUpperCase() +
      node.education_medium.slice(1)
    : "-",
  last_attempt_date: node.last_communication_date
    ? dayjs(node.last_communication_date).format("DD/MM/YYYY hh:mm A")
    : "-",
  link: node.link ?? "-",
  attempts: node.attempts ?? "-",
  children: Array.isArray(node.childrens)
    ? node.childrens.map(transformToTree)
    : [],
});

const formatName = (fullName) => {
  if (!fullName) return "-";
  return fullName
    .split(" ")
    .map((word, idx, arr) => (idx > 0 && idx < arr.length - 1 ? word[0] : word))
    .join(" ");
};

export default function UserTreeView({ treeData }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const dataArray = Array.isArray(treeData)
    ? treeData
    : Array.isArray(treeData?.data)
    ? treeData.data
    : [];

  const fullTree = dataArray.map(transformToTree);

  let initialBreadcrumb = [];
  let initialData = fullTree;
  let isInitialSelfView = false;

  const referenceNode = fullTree[0];

  if (fullTree.length === 1 && referenceNode) {
    const hasReportingPerson = referenceNode.reporting_person !== "-";

    if (hasReportingPerson) {
      initialBreadcrumb = [
        { id: referenceNode.id, label: "Self", node: referenceNode },
      ];
      initialData = [referenceNode];
      isInitialSelfView = true;
    } else {
      initialBreadcrumb = [];
      initialData = referenceNode.children || [];
    }
  } else if (fullTree.length > 1 && referenceNode) {
    const reportingPersonData = referenceNode.reporting_person_data;

    if (reportingPersonData) {
      const syntheticRootNode = {
        id: reportingPersonData.id,
        label: formatName(reportingPersonData.name),
        children: fullTree,
        isSyntheticRoot: true,
      };

      initialBreadcrumb = [
        {
          id: syntheticRootNode.id,
          label: syntheticRootNode.label,
          node: syntheticRootNode,
        },
      ];
      initialData = fullTree;
    }
  }

  const [breadcrumb, setBreadcrumb] = useState(initialBreadcrumb);
  const [currentData, setCurrentData] = useState(initialData);
  const [isSelfViewMode] = useState(isInitialSelfView);

  const handleRowClick = (rowData) => {
    if (rowData.children && rowData.children.length > 0) {
      setCurrentData(rowData.children);
      setBreadcrumb((prev) => [
        ...prev,
        { id: rowData.id, label: rowData.label, node: rowData },
      ]);
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === breadcrumb.length - 1) return;

    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    const clickedCrumbNode = newBreadcrumb[newBreadcrumb.length - 1].node;

    const isFirstCrumb = index === 0;

    if (isFirstCrumb && clickedCrumbNode.isSyntheticRoot) {
      setCurrentData(clickedCrumbNode.children || []);
    } else if (isFirstCrumb && isSelfViewMode) {
      setCurrentData([clickedCrumbNode]);
    } else {
      setCurrentData(clickedCrumbNode.children || []);
    }

    setBreadcrumb(newBreadcrumb);
  };

  return (
    <Box
      sx={{
        width: "100%",
        p: "8px 16px",
        backgroundColor: "#fff",
        borderRadius: 2,
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        overflowX: "auto",
      }}
    >
      {breadcrumb.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            {breadcrumb.map((crumb, index) => {
              const isLast = index === breadcrumb.length - 1;
              const isClickable = !isLast && crumb.node.children?.length;

              return isLast ? (
                <Typography
                  key={crumb.id}
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main, // last crumb color
                  }}
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={crumb.id}
                  underline="hover"
                  sx={{
                    cursor: isClickable ? "pointer" : "default",
                    fontWeight: 500,
                    color: isClickable ? theme.palette.primary.main : "#000",
                    "&:hover": {
                      color: isClickable ? "#1c6a62" : "#000",
                    },
                  }}
                  onClick={() => isClickable && handleBreadcrumbClick(index)}
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        </Box>
      )}

      <Table
        rowKey="id"
        data={currentData}
        autoHeight
        rowHeight={60}
        headerHeight={34.5}
        virtualized
        hover
        shouldUpdateScroll={false}
        onRowClick={handleRowClick}
        style={{
          width: "100%",
          minWidth: "max(100%, 1200px)",
        }}
        sx={{
          "& .rs-table-cell-content": {
            padding: "5px !important",
          },
        }}
      >
        <Column flexGrow={1.2}>
          <HeaderCell
            style={{
              padding: "5px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "16px",
            }}
          >
            Name
          </HeaderCell>
          <Cell
            dataKey="label"
            style={{
              padding: "16px 8px",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
            }}
          >
            {(rowData) => {
              const isClickable =
                rowData.children && rowData.children.length > 0;
              return (
                <div
                  style={{
                    color: isClickable ? theme.palette.primary.main : "#000",
                    cursor: isClickable ? "pointer" : "default",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.color = "#1c6a62";
                      e.currentTarget.style.textDecoration = "underline";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.color = theme.palette.primary.main;
                      e.currentTarget.style.textDecoration = "none";
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isClickable) handleRowClick(rowData);
                  }}
                >
                  {rowData.label}
                </div>
              );
            }}
          </Cell>
        </Column>

        <Column flexGrow={0.6}>
          <HeaderCell
            style={{
              padding: "5px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "16px",
            }}
          >
            Designation
          </HeaderCell>
          <Cell
            dataKey="designation"
            style={{
              padding: "16px 8px",
              display: "flex",
              alignItems: "center",
            }}
          />
        </Column>

        <Column flexGrow={0.5}>
          <HeaderCell
            style={{
              padding: "5px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "16px",
            }}
          >
            Experience
          </HeaderCell>
          <Cell
            dataKey="experience"
            style={{
              padding: "16px 8px",
              display: "flex",
              alignItems: "center",
            }}
          />
        </Column>

        <Column flexGrow={0.8}>
          <HeaderCell
            style={{
              padding: "5px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "16px",
            }}
          >
            Reporting Manager
          </HeaderCell>
          <Cell
            dataKey="reporting_person"
            style={{
              padding: "16px 8px",
              display: "flex",
              alignItems: "center",
            }}
          />
        </Column>

        <Column flexGrow={0.8}>
          <HeaderCell
            style={{
              padding: "5px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "16px",
            }}
          >
            Medium
          </HeaderCell>
          <Cell
            dataKey="education_medium"
            style={{
              padding: "16px 8px",
              display: "flex",
              alignItems: "center",
            }}
          />
        </Column>

        <Column flexGrow={0.9}>
          <HeaderCell
            style={{
              padding: "5px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "16px",
            }}
          >
            Last Attempted On
          </HeaderCell>
          <Cell
            style={{
              padding: "16px 8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            {(rowData) =>
              rowData.last_attempt_date !== "-" ? (
                <Link
                  href={rowData.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    textDecoration: "underline",
                    cursor: rowData.link ? "pointer" : "default",
                    transition: "color 0.2s ease",
                    "&:hover": {
                      color: "#1c6a62",
                      textDecoration: "underline",
                    },
                  }}
                >
                  <LinkSharpIcon
                    fontSize="small"
                    sx={{ mr: 0.6, verticalAlign: "middle" }}
                  />
                  {rowData.last_attempt_date}
                </Link>
              ) : (
                "-"
              )
            }
          </Cell>
        </Column>

        <Column flexGrow={0.4} align="center">
          <HeaderCell
            style={{
              padding: "5px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "16px",
            }}
          >
            Attempts
          </HeaderCell>
          <Cell
            dataKey="attempts"
            style={{
              padding: "16px 8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          />
        </Column>

        <Column flexGrow={0.5} align="center">
          <HeaderCell
            style={{
              padding: "5px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "16px",
              textAlign: "center",
            }}
          >
            Actions
          </HeaderCell>
          <Cell
            style={{
              padding: "16px 8px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {(rowData) => (
              <IconButton
                aria-label="view"
                size="small"
                onClick={() => navigate(`/user-practices/${rowData.id}`)}
              >
                <VisibilityIcon color="primary" fontSize="small" />
              </IconButton>
            )}
          </Cell>
        </Column>
      </Table>
    </Box>
  );
}
