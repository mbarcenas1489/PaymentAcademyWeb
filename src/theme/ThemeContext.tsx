"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export type AppThemeMode = "light" | "dark" | "blue";

interface ThemeContextType {
  mode: AppThemeMode;
  setMode: (mode: AppThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: "light",
  setMode: () => {},
  toggleTheme: () => {},
});

export const useAppTheme = () => useContext(ThemeContext);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppThemeMode>("light");

  useEffect(() => {
    const saved = localStorage.getItem("payment_academy_theme") as AppThemeMode;
    if (saved === "light" || saved === "dark" || saved === "blue") {
      setModeState(saved);
    }
  }, []);

  const setMode = (newMode: AppThemeMode) => {
    setModeState(newMode);
    localStorage.setItem("payment_academy_theme", newMode);
  };

  const toggleTheme = () => {
    const next: Record<AppThemeMode, AppThemeMode> = {
      light: "dark",
      dark: "blue",
      blue: "light",
    };
    setMode(next[mode]);
  };

  const muiTheme = useMemo(() => {
    if (mode === "dark") {
      return createTheme({
        palette: {
          mode: "dark",
          primary: {
            main: "#E88960",
            light: "#FFB08E",
            dark: "#B85B33",
            contrastText: "#1A0E08",
          },
          secondary: {
            main: "#EAA66D",
            contrastText: "#1A0E08",
          },
          background: {
            default: "#121214",
            paper: "#1E1E22",
          },
          text: {
            primary: "#F5ECE6",
            secondary: "#B8A398",
          },
          success: {
            main: "#4CAF50",
            light: "#1B3B22",
          },
          warning: {
            main: "#FFB74D",
            light: "#3E2B14",
          },
          error: {
            main: "#EF5350",
            light: "#3E1A1A",
          },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          button: { textTransform: "none", fontWeight: 600 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: 24, padding: "8px 20px" },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backgroundImage: "none",
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: { borderRadius: 20, backgroundImage: "none" },
            },
          },
        },
      });
    }

    if (mode === "blue") {
      return createTheme({
        palette: {
          mode: "light",
          primary: {
            main: "#0B5ED7",
            light: "#3D8BFD",
            dark: "#0A4AB2",
            contrastText: "#FFFFFF",
          },
          secondary: {
            main: "#00A8FF",
            contrastText: "#FFFFFF",
          },
          background: {
            default: "#F0F5FA",
            paper: "#FFFFFF",
          },
          text: {
            primary: "#0A1E3F",
            secondary: "#475D7B",
          },
          success: {
            main: "#198754",
            light: "#D1E7DD",
          },
          warning: {
            main: "#FFC107",
            light: "#FFF3CD",
          },
          error: {
            main: "#DC3545",
            light: "#F8D7DA",
          },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          button: { textTransform: "none", fontWeight: 600 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: 24, padding: "8px 20px" },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                border: "1px solid rgba(11, 94, 215, 0.12)",
                boxShadow: "0 4px 14px rgba(11, 94, 215, 0.06)",
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: { borderRadius: 20 },
            },
          },
        },
      });
    }

    // Default: Light mode
    return createTheme({
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
      shape: { borderRadius: 12 },
      typography: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        button: { textTransform: "none", fontWeight: 600 },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: { borderRadius: 24, padding: "8px 20px" },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              border: "1px solid rgba(139, 61, 31, 0.08)",
              boxShadow: "0 2px 12px rgba(37, 26, 20, 0.06)",
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: { borderRadius: 20 },
          },
        },
      },
    });
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, setMode, toggleTheme }}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

