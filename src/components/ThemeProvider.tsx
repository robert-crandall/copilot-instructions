"use client";

import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  actualMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

interface CustomThemeProviderProps {
  children: ReactNode;
}

export default function CustomThemeProvider({ children }: CustomThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [actualMode, setActualMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") as ThemeMode;
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);

  useEffect(() => {
    const updateActualMode = () => {
      if (mode === "system") {
        const systemPreference = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setActualMode(systemPreference ? "dark" : "light");
      } else {
        setActualMode(mode);
      }
    };

    updateActualMode();

    if (mode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateActualMode);
      return () => mediaQuery.removeEventListener("change", updateActualMode);
    }
  }, [mode]);

  const handleSetMode = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem("theme-mode", newMode);
  };

  const theme = createTheme({
    palette: {
      mode: actualMode,
      primary: {
        main: actualMode === "dark" ? "#3b82f6" : "#1976d2", // Blue for main actions
      },
      secondary: {
        main: actualMode === "dark" ? "#8b5cf6" : "#7c3aed", // Purple for secondary actions
      },
      background: {
        default: actualMode === "dark" ? "#0f1419" : "#f8fafc", // base-200 equivalent
        paper: actualMode === "dark" ? "#1e293b" : "#ffffff", // base-100 equivalent
      },
      text: {
        primary: actualMode === "dark" ? "#f1f5f9" : "#0f172a",
        secondary: actualMode === "dark" ? "#94a3b8" : "#64748b",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
        background: actualMode === "dark" 
          ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
          : "linear-gradient(135deg, #1976d2 0%, #7c3aed 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: "0.5rem",
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 600,
        marginBottom: "1rem",
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 600,
        marginBottom: "0.75rem",
      },
      h6: {
        fontSize: "1.125rem",
        fontWeight: 600,
        marginBottom: "0.5rem",
      },
      body1: {
        fontSize: "1rem",
        lineHeight: 1.6,
      },
      body2: {
        fontSize: "0.875rem",
        lineHeight: 1.5,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: actualMode === "dark" ? "#0f1419" : "#f8fafc",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: actualMode === "dark" ? "1px solid #334155" : "1px solid #e2e8f0",
            boxShadow: actualMode === "dark" 
              ? "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)"
              : "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: actualMode === "dark"
                ? "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)"
                : "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            fontWeight: 600,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
            },
          },
          contained: {
            background: actualMode === "dark" 
              ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
              : "linear-gradient(135deg, #1976d2 0%, #7c3aed 100%)",
            color: "white",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            "&:hover": {
              background: actualMode === "dark" 
                ? "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)"
                : "linear-gradient(135deg, #1565c0 0%, #6d28d9 100%)",
              boxShadow: "0 8px 12px -2px rgba(0, 0, 0, 0.15), 0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            },
          },
          outlined: {
            borderWidth: 2,
            "&:hover": {
              borderWidth: 2,
              backgroundColor: actualMode === "dark" ? "rgba(59, 130, 246, 0.1)" : "rgba(25, 118, 210, 0.1)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.02)",
              },
              "&.Mui-focused": {
                transform: "scale(1.02)",
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: actualMode === "dark"
              ? "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)"
              : "linear-gradient(135deg, rgba(25, 118, 210, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)",
            backdropFilter: "blur(8px)",
            borderBottom: actualMode === "dark" ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid rgba(25, 118, 210, 0.2)",
            boxShadow: "none",
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, setMode: handleSetMode, actualMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
