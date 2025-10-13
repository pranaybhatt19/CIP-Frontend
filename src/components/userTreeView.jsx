import React from "react";
import { Table } from "rsuite";
import { Box, IconButton, Typography } from "@mui/material";
import "rsuite/dist/rsuite.min.css";
import dayjs from "dayjs";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";

const { Column, HeaderCell, Cell } = Table;

// Recursive transformer
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
  education_medium: node.medium_of_education
    ? node.medium_of_education.charAt(0).toUpperCase() +
      node.medium_of_education.slice(1)
    : "-",
  last_attempt_date: node.last_communication_date
    ? dayjs(node.last_communication_date).format("DD/MM/YYYY hh:mm A")
    : "-",
  attempts: node.attempts ?? "-",
  children: Array.isArray(node.childrens)
    ? node.childrens.map(transformToTree)
    : [],
});

export default function UserTreeView({ treeData }) {
  const navigate = useNavigate();

  // Ensure treeData is always an array
  const dataArray = Array.isArray(treeData)
    ? treeData
    : Array.isArray(treeData?.data)
    ? treeData.data
    : [];

  // Transform data to RSuite tree structure
  const tableData = dataArray.map(transformToTree);

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
      <Table
        isTree
        rowKey="id"
        data={tableData}
        autoHeight
        rowHeight={60}
        headerHeight={34.5}
        virtualized
        hover
        shouldUpdateScroll={false}
        renderTreeToggle={(expandIcon, rowData) =>
          rowData.children?.length ? (
            expandIcon
          ) : (
            <span style={{ marginLeft: 16 }} />
          )
        }
        style={{
          width: "100%",
          minWidth: "max(100%, 1200px)", // scroll appears if viewport < 1200px
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
          />
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
            Medium of Education
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
            dataKey="last_attempt_date"
            style={{
              padding: "16px 8px",
              display: "flex",
              alignItems: "center",
            }}
          />
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
