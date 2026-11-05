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
            main: "#2DD4BF",
            light: "#5EEAD4",
            dark: "#0F766E",
            contrastText: "#042F2C",
          },
          secondary: {
            main: "#34D399",
            contrastText: "#042F2C",
          },
          background: {
            default: "#0B1715",
            paper: "#132522",
          },
          text: {
            primary: "#F0FDF9",
            secondary: "#85A8A0",
          },
          success: {
            main: "#34D399",
            light: "#064E3B",
          },
          warning: {
            main: "#FBBF24",
            light: "#451A03",
          },
          error: {
            main: "#F87171",
            light: "#450A0A",
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
                border: "1px solid rgba(45, 212, 191, 0.12)",
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

    // Default: Opción 2 - Verde Teal & Esmeralda Deportivo
    return createTheme({
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
      shape: { borderRadius: 12 },
      typography: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        button: { textTransform: "none", fontWeight: 600 },
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
              border: "1px solid rgba(15, 118, 110, 0.1)",
              boxShadow: "0 2px 12px rgba(15, 47, 40, 0.05)",
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
