import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#63a4ff",
      dark: "#004ba0",
    },
    secondary: {
      main: "#f06292",
      light: "#ff94c2",
      dark: "#c63f6f",
    },
    background: {
      default: "#ffffff",
      paper: "rgba(255, 255, 255, 0.9)",
    },
    text: {
      primary: "#333333",
      secondary: "#666666",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.5px",
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontWeight: 400,
      letterSpacing: "0.2px",
    },
    body2: {
      fontWeight: 300,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            transition: "all 0.4s ease",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#63a4ff",
              boxShadow: "0 0 6px rgba(25, 118, 210, 0.2)",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#1976d2",
              borderWidth: "2px",
              boxShadow: "0 0 10px rgba(25, 118, 210, 0.4)",
            },
          },
          "& .MuiOutlinedInput-input": {
            color: "#333333",
            padding: "16px",
            fontSize: "1rem",
          },
          "& .MuiInputLabel-root": {
            color: "#666666",
            fontSize: "1rem",
            // transition: "all 0.3s ease",
            // "&.Mui-focused": {
            //   color: "#1976d2",
            //   transform: "translate(14px, -9px) scale(0.75)",
            // },
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
          backgroundColor: "#1976d2",
          color: "#fff",
          // transition: "all 0.3s ease",
          // "&:hover": {
          //   backgroundColor: "#1565c0",
          //   transform: "scale(1.05)",
          //   boxShadow: "0 6px 12px rgba(25, 118, 210, 0.4)",
          // },
          // "&:disabled": {
          //   backgroundColor: "rgba(0, 0, 0, 0.1)",
          //   color: "rgba(0, 0, 0, 0.3)",
          // },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8))",
          backdropFilter: "blur(15px)",
          border: "1px solid rgba(25, 118, 210, 0.15)",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          // transition: "all 0.4s ease",
          // "&:hover": {
          //   transform: "translateY(-6px)",
          //   boxShadow: "0 14px 40px rgba(0, 0, 0, 0.12)",
          // },
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
