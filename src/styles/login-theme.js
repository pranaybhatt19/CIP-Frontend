import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2a9d8f", 
      light: "#52b7a4",
      dark: "#21867a",
    },
    secondary: {
      main: "#2196f3",
      light: "#64b5f6",
      dark: "#1976d2",
    },
    background: {
      default: "#f5f5f5",
      paper: "rgba(255, 255, 255, 0.9)",
    },
    text: {
      primary: "#333333",
      secondary: "#6c757d",
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
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(42, 157, 143, 0.2)",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
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
            borderRadius: "12px",
            transition: "all 0.3s ease",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#52b7a4",
              boxShadow: "0 0 6px rgba(42, 157, 143, 0.2)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2a9d8f",
              borderWidth: "2px",
              boxShadow: "0 0 10px rgba(42, 157, 143, 0.3)",
            },
          },
          "& .MuiOutlinedInput-input": {
            color: "#333333",
            padding: "16px",
            fontSize: "1rem",
          },
          "& .MuiInputLabel-root": {
            color: "#6c757d",
            fontSize: "1rem",
            "&.Mui-focused": {
              color: "#2a9d8f",
            },
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "1rem",
          padding: "14px 28px",
          background: "linear-gradient(45deg, #2a9d8f, #27a192)",
          color: "#fff",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "linear-gradient(45deg, #21867a, #1a8578)",
            transform: "translateY(-1px)",
            boxShadow: "0 6px 10px rgba(42, 157, 143, 0.3)",
          },
          "&:disabled": {
            backgroundColor: "rgba(0, 0, 0, 0.1)",
            color: "rgba(0, 0, 0, 0.3)",
          },
        },
      },
    },

    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          color: "#2196f3",
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

    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          color: "#d32f2f",
          fontWeight: 500,
        },
      },
    },
  },
});
