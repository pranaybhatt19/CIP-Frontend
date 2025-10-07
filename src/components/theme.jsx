// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#2a9d8f",
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
    },
    info: {
      main: "#2196f3",
    },
    background: {
      default: "#f5f5f5",
    },
  },

  typography: {
    fontFamily: "Poppins, Arial, sans-serif",
    h3: {
      fontWeight: 700,
      fontSize: "32px",
      color: "#2a9d8f",
    },
    h5: {
      fontWeight: 700,
      fontSize: "20px",
      color: "#2a9d8f",
    },
    body1: {
      color: "#6c757d",
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
    },
  },

  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          maxWidth: 480,
          margin: "auto",
          animation: "fadeIn 0.5s ease-in",
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#ffffff",
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        contained: {
          background: "linear-gradient(45deg, #2a9d8f, #27a192)",
          "&:hover": {
            background: "linear-gradient(45deg, #21867a, #1a8578)",
          },
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          color: "#1976d2",
          "&:hover": {
            textDecoration: "underline",
            color: "#1565c0",
          },
        },
      },
    },

    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: "#6c757d",
        },
      },
    },

    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
          fontSize: "1rem",
          fontWeight: 600,
          color: "#fff",
          background: "linear-gradient(135deg, #2a9d8f, #21867a)",
          border: "2px solid rgba(255,255,255,0.2)",
          boxShadow: "0 3px 6px rgba(0, 0, 0, 0.15)",
        },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          minWidth: 200,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(0,0,0,0.1)",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          paddingTop: "12px",
          paddingBottom: "12px",
          paddingLeft: "24px",
          paddingRight: "24px",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.04)",
          },
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: "#2a9d8f",
          fontWeight: 700,
          fontFamily: "Poppins, Arial, sans-serif",
        },
      },
    },
  },
});

export default theme;
