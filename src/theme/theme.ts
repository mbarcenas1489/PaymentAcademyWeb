"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0F766E",
      light: "#14B8A6",
      dark: "#094E48",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#10B981",
      light: "#34D399",
      dark: "#059669",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F0FDF4",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F2F28",
      secondary: "#4A6B63",
    },
    success: {
      main: "#10B981",
      light: "#D1FAE5",
    },
    warning: {
      main: "#F59E0B",
      light: "#FEF3C7",
    },
    error: {
      main: "#EF4444",
      light: "#FEE2E2",
    },
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          padding: "8px 20px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(15, 118, 110, 0.25)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(15, 47, 40, 0.05)",
          border: "1px solid rgba(15, 118, 110, 0.1)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
        },
      },
    },
  },
});
