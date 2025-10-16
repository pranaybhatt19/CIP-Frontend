import { useState, useEffect, useRef } from "react";
import { Table } from "rsuite";
import {
  Box,
  IconButton,
  Link,
  useTheme,
  Breadcrumbs,
  Typography,
  Chip,
} from "@mui/material";
import "rsuite/dist/rsuite.min.css";
import dayjs from "dayjs";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import LinkSharpIcon from "@mui/icons-material/LinkSharp";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import LabelIcon from "@mui/icons-material/Label";
import { Menu, MenuItem, Tooltip } from "@mui/material";
import EditUserModal from "./editUser";
import EditTagsModal from "./editTags";

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
  tags: node.tags || [],
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

const calculateInitialState = (treeData, userId, userRM) => {
  const dataArray = Array.isArray(treeData)
    ? treeData
    : Array.isArray(treeData?.data)
      ? treeData.data
      : [];
  const fullTree = dataArray.map(transformToTree);
  const referenceNode = fullTree[0];

  let calculatedBreadcrumb = [];
  let calculatedData = fullTree;
  let calculatedSelfViewMode = false;
  let selfManagerNode = null;

  if (fullTree.length > 0) {
    if (fullTree.length === 1 && referenceNode.id === userId) {
      const hasChildren =
        referenceNode.children && referenceNode.children.length > 0;
      const hasReportingPerson = userRM !== null;

      if (hasChildren) {
        if (hasReportingPerson) {
          calculatedBreadcrumb = [
            {
              id: "self-root",
              label: "Self",
              node: {
                id: "self-root",
                label: "Self",
                children: [referenceNode],
              },
              isInitialRoot: true,
            },
          ];
          calculatedData = [referenceNode];
          selfManagerNode = referenceNode;
        } else {
          calculatedBreadcrumb = [
            {
              id: referenceNode.id,
              label: referenceNode.label,
              node: referenceNode,
              isInitialRoot: true,
            },
          ];
          calculatedData = [referenceNode];
          selfManagerNode = referenceNode;
        }

        calculatedSelfViewMode = true;
      } else {
        calculatedBreadcrumb = [];
        calculatedData = [referenceNode];
        calculatedSelfViewMode = true;
      }
    } else if (fullTree.length > 0 && referenceNode) {
      const isSynthetic = referenceNode.reporting_person_data;
      const rootLabel = isSynthetic
        ? formatName(referenceNode.reporting_person_data.name)
        : "Filtered List";
      const rootId = isSynthetic
        ? referenceNode.reporting_person_data.id
        : "filtered-list";

      const listRootNode = {
        id: rootId,
        label: rootLabel,
        children: fullTree,
        isSyntheticRoot: isSynthetic,
        isInitialRoot: true,
      };

      calculatedBreadcrumb = [
        {
          id: listRootNode.id,
          label: listRootNode.label,
          node: listRootNode,
          isInitialRoot: true,
        },
      ];
      calculatedData = fullTree;
    }
  }

  return {
    calculatedBreadcrumb,
    calculatedData,
    calculatedSelfViewMode,
    fullTree,
    selfManagerNode: selfManagerNode,
  };
};

export default function UserTreeView({ treeData, userId, userRM, designation, fetchData }) {
  const navigate = useNavigate();
  const theme = useTheme();

  const isMounted = useRef(false);

  const initialState = useState(() =>
    calculateInitialState(treeData, userId, userRM)
  )[0];

  const [breadcrumb, setBreadcrumb] = useState(
    initialState.calculatedBreadcrumb
  );
  const [currentData, setCurrentData] = useState(initialState.calculatedData);
  const [isSelfViewMode] = useState(initialState.calculatedSelfViewMode);
  const [fullTreeData, setFullTreeData] = useState(initialState.fullTree);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [editTagsModalOpen, setEditTagsModalOpen] = useState(false);
  const selfManagerNode = useRef(initialState.selfManagerNode);
  const [editUserData, setEditUserData] = useState(null);
  const [languageList, setLanguageList] = useState([]);
  const [editTagsData, setEditTagsData] = useState(null);



  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const {
      calculatedBreadcrumb,
      calculatedData,
      fullTree,
      selfManagerNode: newSelfManagerNode,
    } = calculateInitialState(treeData, userId, userRM);

    if (JSON.stringify(fullTree) !== JSON.stringify(fullTreeData)) {
      setBreadcrumb(calculatedBreadcrumb);
      setCurrentData(calculatedData);
      setFullTreeData(fullTree);
      selfManagerNode.current = newSelfManagerNode;
    }
  }, [treeData, userId, userRM, fullTreeData]);

  const handleRowClick = (rowData) => {
    if (rowData.children && rowData.children.length > 0) {
      const isFirstDrillDownFromSelfManager =
        isSelfViewMode &&
        breadcrumb.length === 1 &&
        rowData.id === userId &&
        selfManagerNode.current &&
        breadcrumb[0].node.id === "self-root";

      if (isFirstDrillDownFromSelfManager) {
        setBreadcrumb((prev) => [
          ...prev,
          {
            id: rowData.id,
            label: rowData.label,
            node: rowData,
            isInitialRoot: false,
          },
        ]);
        setCurrentData(rowData.children);
      } else {
        setBreadcrumb((prev) => [
          ...prev,
          {
            id: rowData.id,
            label: rowData.label,
            node: rowData,
            isInitialRoot: false,
          },
        ]);
        setCurrentData(rowData.children);
      }
    }
  };
  const handleMenuOpen = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleViewClick = () => {
    if (selectedRow) navigate(`/user-practices/${selectedRow.id}`);
    handleMenuClose();
  };

  const handleEditUserClick = () => {
    if (selectedRow) {
      setEditUserData(selectedRow);
      setEditUserModalOpen(true);
    }
    handleMenuClose();
  };

  const handleEditTagsClick = () => {
    if (selectedRow) {
      setEditTagsData({
        user_id: selectedRow.id,
        name: selectedRow.label,
        tags: selectedRow.tags || [],
      });
      setEditTagsModalOpen(true);
    }
    handleMenuClose();
  };
  const handleBreadcrumbClick = (index) => {
    if (index === breadcrumb.length - 1) return;

    const newBreadcrumb = breadcrumb.slice(0, index + 1);
    const clickedCrumb = newBreadcrumb[newBreadcrumb.length - 1];
    const clickedCrumbNode = clickedCrumb.node;

    if (
      isSelfViewMode &&
      index === 0 &&
      clickedCrumb.isInitialRoot &&
      clickedCrumb.id === "self-root"
    ) {
      if (selfManagerNode.current) {
        setCurrentData([selfManagerNode.current]);
        setBreadcrumb(newBreadcrumb);
        return;
      }
    } else if (index === 0 && clickedCrumb.isInitialRoot) {
      setCurrentData(fullTreeData);
      setBreadcrumb(newBreadcrumb);
    } else {
      setCurrentData(clickedCrumbNode.children || []);
      setBreadcrumb(newBreadcrumb);
    }
  };
  const isManager = ["PM", "APM", "STL", "TL"].includes(designation);
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
              const isClickable = !isLast;

              return isLast ? (
                <Typography
                  key={crumb.id}
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                  }}
                >
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={crumb.id}
                  underline="hover"
                  aria-label={`Go to ${crumb.label}`}
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
        aria-label="User hierarchy table"
        data={currentData}
        autoHeight
        rowHeight={60}
        headerHeight={34.5}
        virtualized
        hover
        shouldUpdateScroll={false}
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
              const isSelfICView =
                isSelfViewMode &&
                !isClickable &&
                currentData.length === 1 &&
                rowData.id === userId;
              const removeIconCompletely = isSelfICView;

              const showIconVisible = isClickable;

              return (
                <div
                  role={isClickable ? "button" : "text"}
                  aria-label={
                    isClickable
                      ? `View subordinates of ${rowData.label}`
                      : `Name: ${rowData.label}`
                  }
                  tabIndex={isClickable ? 0 : -1}
                  style={{
                    color: isClickable ? theme.palette.primary.main : "#000",
                    cursor: isClickable ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.color = "#1c6a62";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.color = theme.palette.primary.main;
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isClickable) handleRowClick(rowData);
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && isClickable) {
                      e.preventDefault();
                      handleRowClick(rowData);
                    }
                  }}
                >
                  {!removeIconCompletely && (
                    <KeyboardArrowRightIcon
                      fontSize="small"
                      sx={{
                        mr: 0.5,
                        color: theme.palette.primary.main,
                        visibility: showIconVisible ? "visible" : "hidden",
                      }}
                    />
                  )}

                  <span
                    style={{
                      fontWeight: isClickable ? 600 : 500,
                    }}
                  >
                    {rowData.label}
                  </span>
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
        <Column flexGrow={0.8}>
          <HeaderCell
            style={{
              padding: "5px",
              fontWeight: "bold",
              color: "#333",
              fontSize: "16px",
            }}
          >
            Tags
          </HeaderCell>
          <Cell
            style={{
              padding: "16px 8px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flexWrap: "wrap",
            }}
          >
            {(rowData) =>
              rowData.tags && rowData.tags.length > 0 ? (
                <Tooltip
                  title={
                    <Box sx={{ p: 1 }}>
                      {rowData.tags.map((tag) => (
                        <Typography key={tag} variant="body2">
                          • {tag}
                        </Typography>
                      ))}
                    </Box>
                  }
                  arrow
                  placement="bottom-start"
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "nowrap",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    {/* Show first tag */}
                    <Chip
                      label={rowData.tags[0]}
                      size="small"
                      sx={{ fontSize: "0.75rem", mr: 0.5 }}
                    />

                    {/* Show +N more if there are extra tags */}
                    {rowData.tags.length > 1 && (
                      <Chip
                        label={`+${rowData.tags.length - 1} more`}
                        size="small"
                        sx={{
                          bgcolor: "grey.200",
                          fontSize: "0.65rem",
                        }}
                      />
                    )}
                  </Box>
                </Tooltip>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  -
                </Typography>
              )
            }
          </Cell>
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
            Reporting Officer
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
                  aria-label={
                    rowData.link
                      ? `Open last attempt link for ${rowData.label}`
                      : `Last attempt date for ${rowData.label}`
                  }
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
              <Box display="flex" justifyContent="center">
                <Tooltip title="Actions">
                  <IconButton
                    id="action-button"
                    aria-label="actions"
                    aria-controls={Boolean(anchorEl) ? "action-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={Boolean(anchorEl) ? "true" : undefined}
                    onClick={(e) => handleMenuOpen(e, rowData)}
                    size="small"
                  >
                    <MoreVertIcon color="primary" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Cell>
        </Column>

      </Table>
      <Menu
        id="action-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{ "aria-labelledby": "action-button" }}
      >
        <MenuItem onClick={handleViewClick}>
          <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
          View
        </MenuItem>
        {isManager && selectedRow && selectedRow.id !== userId && (
          <>
            <MenuItem onClick={handleEditUserClick}>
              <EditIcon sx={{ mr: 1, fontSize: 20 }} />
              Edit User
            </MenuItem>
            <MenuItem onClick={handleEditTagsClick}>
              <LabelIcon sx={{ mr: 1, fontSize: 20 }} />
              Edit Tags
            </MenuItem>
          </>
        )}
      </Menu>
      <EditUserModal
        open={editUserModalOpen}
        onClose={() => setEditUserModalOpen(false)}
        userData={editUserData}
        languageList={languageList}
        currentUserId={userId}
        onUpdated={fetchData}
      />

      {/* Edit Tags Modal */}
      <EditTagsModal
        open={editTagsModalOpen}
        onClose={() => {
          setEditTagsModalOpen(false);
          fetchData();
        }}
        userData={editTagsData}
      />

    </Box>
  );
}
