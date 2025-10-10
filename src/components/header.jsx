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
  Person as PersonIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import HeadsetMicIcon from '@mui/icons-material/HeadsetMic';
import { decodeToken } from "../util/commonFunction";
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";

export const Header = () => {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [username, setUsername] = useState("");
  const [userDesignation, setUserDesignation] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const decodedToken = decodeToken();
    if (decodedToken?.name) {
      const fullName = decodedToken.name.trim().split(" ");
      const firstName = fullName[0];
      const lastName = fullName.length > 1 ? fullName[fullName.length - 1] : "";
      setUsername(`${firstName} ${lastName}`.trim());
    }
    if (decodedToken?.designation) setUserDesignation(decodedToken.designation.name);
  }, []);

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] || "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
  };

  return (
    <AppBar position="sticky" elevation={2} color="primary">
      <Container maxWidth={false}>
        <Toolbar disableGutters sx={{ justifyContent: "space-between", minHeight: 64 }}>
          {/* Logo & Title */}
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
            <HeadsetMicIcon sx={{ fontSize: 40, color: theme.palette.common.white }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.common.white }}>
                Communication Ace
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
              {userDesignation && (
                <Typography
                  sx={{
                    color: theme.palette.grey[200],
                    fontSize: "0.75rem",
                    textTransform: "capitalize",
                  }}
                >
                  {userDesignation}
                </Typography>
              )}
            </Box>

            <IconButton onClick={handleOpenUserMenu}>
              <Avatar>{getInitials(username)}</Avatar>
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
                {userDesignation && (
                  <Typography
                    variant="body2"
                    sx={{ color: theme.palette.text.secondary, textTransform: "capitalize" }}
                  >
                    {userDesignation}
                  </Typography>
                )}
              </Box>

              <Divider />

              <MenuItem
                onClick={() => {
                  handleCloseUserMenu();
                  navigate("/profile");
                }}
              >
                <PersonIcon sx={{ mr: 2, color: theme.palette.text.secondary }} />
                Profile
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/");
                  handleCloseUserMenu();
                }}
              >
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
