"use client";

import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#8B3D1F",
      light: "#BC5A36",
      dark: "#5C2611",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#D97736",
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#FBF8F5",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#251A14",
      secondary: "#765F52",
    },
    success: {
      main: "#176B3A",
      light: "#DDF3E4",
    },
    warning: {
      main: "#B86200",
      light: "#FEF3D6",
    },
    error: {
      main: "#BA1A1A",
      light: "#FFDAD6",
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
            boxShadow: "0 2px 8px rgba(139, 61, 31, 0.2)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(37, 26, 20, 0.06)",
          border: "1px solid rgba(139, 61, 31, 0.08)",
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

