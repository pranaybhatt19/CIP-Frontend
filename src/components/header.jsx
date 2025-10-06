import * as React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  MenuItem,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Forum as ForumIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { decodeToken } from "../util/commonFunction";
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";

export const Header = () => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const decodedToken = decodeToken();
    if (decodedToken?.name) setUsername(decodedToken.name);
    if (decodedToken?.role) setUserRole(decodedToken.role);
  }, []);

  const handleOpenUserMenu = (event) =>
    setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  return (
    <AppBar position="sticky" elevation={2} color="primary">
      <Container maxWidth={false}>
        <Toolbar disableGutters sx={{ justifyContent: "space-between", minHeight: 64 }}>
          
          {/* Logo & Portal Name */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              gap: 2,
              "&:hover": { opacity: 0.9 },
            }}
            onClick={() => navigate("/dashboard")}
          >
            <ForumIcon sx={{ fontSize: 40, color: theme.palette.common.white }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.common.white }}>
                CommunicationAce
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.grey[200], display: "block" }}>
                Communication Improvement Portal
              </Typography>
            </Box>
          </Box>

          {/* User Section */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ color: theme.palette.common.white, fontWeight: 500 }}>
                {username || "User"}
              </Typography>
              {userRole && (
                <Typography sx={{ color: theme.palette.grey[200], fontSize: "0.75rem", textTransform: "capitalize" }}>
                  {userRole}
                </Typography>
              )}
            </Box>

            <IconButton onClick={handleOpenUserMenu}>
              <Avatar>{username ? username.charAt(0).toUpperCase() : "U"}</Avatar>
            </IconButton>

            <Menu
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <Box sx={{ px: 3, py: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                  {username || "User"}
                </Typography>
                {userRole && (
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textTransform: "capitalize" }}>
                    {userRole}
                  </Typography>
                )}
              </Box>

              <Divider />

              <MenuItem onClick={() => { handleCloseUserMenu(); navigate("/profile"); }}>
                <PersonIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                Profile
              </MenuItem>

              <Divider />

              <MenuItem onClick={() => { localStorage.removeItem("token"); navigate("/"); handleCloseUserMenu(); }}>
                <LogoutIcon sx={{ mr: 2, color: theme.palette.error.main }} />
                <Typography sx={{ color: theme.palette.error.main }}>Sign Out</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
