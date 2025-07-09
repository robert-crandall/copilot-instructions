"use client";

import { Container, Box, useTheme } from "@mui/material";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
  variant?: "default" | "dashboard" | "form";
}

export default function Layout({ 
  children, 
  sidebar, 
  maxWidth = "xl",
  variant = "default" 
}: LayoutProps) {
  const theme = useTheme();

  // Dashboard layout: 4-column grid (3 for content, 1 for sidebar)
  if (variant === "dashboard") {
    return (
      <Box sx={{ 
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}>
        <Navbar />
        <Container maxWidth={maxWidth} sx={{ py: 4 }}>
          <Box sx={{ 
            display: "grid", 
            gap: 4, 
            gridTemplateColumns: { 
              xs: "1fr", 
              lg: sidebar ? "3fr 1fr" : "1fr" 
            } 
          }}>
            <Box sx={{ minWidth: 0 }}>
              {children}
            </Box>
            {sidebar && (
              <Box sx={{ 
                minWidth: 0,
                position: { lg: "sticky" },
                top: { lg: 32 },
                height: "fit-content"
              }}>
                {sidebar}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    );
  }

  // Form layout: 2/3 + 1/3 split
  if (variant === "form") {
    return (
      <Box sx={{ 
        minHeight: "100vh",
        backgroundColor: theme.palette.background.default,
      }}>
        <Navbar />
        <Container maxWidth={maxWidth} sx={{ py: 4 }}>
          <Box sx={{ 
            display: "grid", 
            gap: 4, 
            gridTemplateColumns: { 
              xs: "1fr", 
              lg: sidebar ? "2fr 1fr" : "1fr" 
            } 
          }}>
            <Box sx={{ minWidth: 0 }}>
              {children}
            </Box>
            {sidebar && (
              <Box sx={{ 
                minWidth: 0,
                position: { lg: "sticky" },
                top: { lg: 32 },
                height: "fit-content"
              }}>
                {sidebar}
              </Box>
            )}
          </Box>
        </Container>
      </Box>
    );
  }

  // Default layout: flexible content
  return (
    <Box sx={{ 
      minHeight: "100vh",
      backgroundColor: theme.palette.background.default,
    }}>
      <Navbar />
      <Container maxWidth={maxWidth} sx={{ py: 4 }}>
        <Box sx={{ 
          display: "flex", 
          gap: 4, 
          flexDirection: { xs: "column", md: sidebar ? "row" : "column" } 
        }}>
          <Box sx={{ flex: sidebar ? 2 : 1, minWidth: 0 }}>
            {children}
          </Box>
          {sidebar && (
            <Box sx={{ 
              flex: 1, 
              minWidth: 0,
              position: { md: "sticky" },
              top: { md: 32 },
              height: "fit-content"
            }}>
              {sidebar}
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
