import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useNavigate } from "react-router-dom";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { decodeToken } from "../util/commonFunction";
import { useState, useEffect } from "react";

export const Header = () => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const decodedToken = decodeToken();
    if (decodedToken?.name) {
      setUsername(decodedToken.name);
    }
    if (decodedToken?.role) {
      setUserRole(decodedToken.role);
    }
  }, []);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar
      position="sticky"
      elevation={2}
      sx={{
        backgroundColor: "#1976d2",
        borderBottom: "1px solid #1565c0",
      }}
    >
      <Container maxWidth={false}>
        <Toolbar
          disableGutters
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "64px",
            // px: { xs: 2, md: 3 }
          }}
        >
          {/* Logo Section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              transition: "opacity 0.2s ease",
              "&:hover": {
                opacity: 0.9,
              },
            }}
            onClick={() => {
              navigate("/dashboard");
            }}
          >
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "6px",
                p: 1,
                mr: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AssessmentIcon
                sx={{
                  color: "white",
                  fontSize: "28px",
                }}
              />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: "white",
                  fontSize: "1.25rem",
                  lineHeight: 1.2,
                  fontFamily: "'Roboto', sans-serif",
                }}
              >
                InterviewAce
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "0.75rem",
                  fontWeight: 400,
                  display: "block",
                }}
              >
                Performance Assessment Portal
              </Typography>
            </Box>
          </Box>

          {/* User Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* User Info */}
            <Box
              sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}
            >
              <Typography
                sx={{
                  color: "white",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                {username || "User"}
              </Typography>
              {userRole && (
                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    textTransform: "capitalize",
                  }}
                >
                  {userRole}
                </Typography>
              )}
            </Box>

            <IconButton
              onClick={handleOpenUserMenu}
              sx={{
                p: 0,
                transition: "transform 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <Avatar
                alt="User Avatar"
                src="/static/images/avatar/2.jpg"
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: "1rem",
                  fontWeight: 600,
                  backgroundColor: "#1565c0",
                  color: "white",
                  border: "2px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                {username ? username.charAt(0).toUpperCase() : "U"}
              </Avatar>
            </IconButton>

            <Menu
              sx={{
                mt: "45px",
                "& .MuiPaper-root": {
                  borderRadius: "8px",
                  minWidth: "200px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                  border: "1px solid rgba(0, 0, 0, 0.1)",
                },
              }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {/* User Info in Menu */}
              <Box sx={{ px: 3, py: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, color: "#1976d2" }}
                >
                  {username || "User"}
                </Typography>
                {userRole && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.8rem",
                      textTransform: "capitalize",
                    }}
                  >
                    {userRole}
                  </Typography>
                )}
              </Box>

              <Divider />

              <MenuItem
                onClick={() => {
                  handleCloseUserMenu();
                  navigate("/profile");
                }}
                sx={{
                  py: 1.5,
                  px: 3,
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                  },
                }}
              >
                <PersonIcon sx={{ mr: 2, color: "#666", fontSize: "20px" }} />
                <Typography sx={{ fontSize: "0.9rem" }}>Profile</Typography>
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/");
                  handleCloseUserMenu();
                }}
                sx={{
                  py: 1.5,
                  px: 3,
                  "&:hover": {
                    backgroundColor: "rgba(211, 47, 47, 0.04)",
                  },
                }}
              >
                <LogoutIcon
                  sx={{ mr: 2, color: "#d32f2f", fontSize: "20px" }}
                />
                <Typography sx={{ fontSize: "0.9rem", color: "#d32f2f" }}>
                  Sign Out
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
