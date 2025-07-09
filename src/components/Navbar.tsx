"use client";

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem,
  Box,
  Avatar,
  useTheme
} from "@mui/material";
import { 
  Brightness4, 
  Brightness7, 
  SettingsBrightness,
  AccountCircle,
  ExitToApp,
  Add
} from "@mui/icons-material";
import { useSession, signOut } from "next-auth/react";
import { useTheme as useCustomTheme } from "@/components/ThemeProvider";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();
  const { mode, setMode } = useCustomTheme();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleThemeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchor(event.currentTarget);
  };

  const handleThemeMenuClose = () => {
    setThemeMenuAnchor(null);
  };

  const handleSignOut = () => {
    signOut();
    handleUserMenuClose();
  };

  const getThemeIcon = () => {
    switch (mode) {
      case "light": return <Brightness7 />;
      case "dark": return <Brightness4 />;
      case "system": return <SettingsBrightness />;
    }
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
        backdropFilter: "blur(8px)",
        borderBottom: `1px solid ${theme.palette.primary.main}33`,
        mb: 0
      }}
    >
      <Toolbar sx={{ minHeight: 80, px: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            T3 Stack Dashboard
          </Link>
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Theme Toggle */}
          <IconButton 
            color="inherit" 
            onClick={handleThemeMenuOpen}
            sx={{ 
              color: theme.palette.text.primary,
              transition: "all 0.2s ease-in-out",
              "&:hover": { transform: "scale(1.1)" }
            }}
          >
            {getThemeIcon()}
          </IconButton>
          <Menu
            anchorEl={themeMenuAnchor}
            open={Boolean(themeMenuAnchor)}
            onClose={handleThemeMenuClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <MenuItem 
              onClick={() => { setMode("light"); handleThemeMenuClose(); }}
              sx={{ gap: 1.5, minWidth: 120 }}
            >
              <Brightness7 sx={{ fontSize: 20 }} /> Light
            </MenuItem>
            <MenuItem 
              onClick={() => { setMode("dark"); handleThemeMenuClose(); }}
              sx={{ gap: 1.5, minWidth: 120 }}
            >
              <Brightness4 sx={{ fontSize: 20 }} /> Dark
            </MenuItem>
            <MenuItem 
              onClick={() => { setMode("system"); handleThemeMenuClose(); }}
              sx={{ gap: 1.5, minWidth: 120 }}
            >
              <SettingsBrightness sx={{ fontSize: 20 }} /> System
            </MenuItem>
          </Menu>

          {session ? (
            <>
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                component={Link}
                href="/posts/create"
                sx={{ 
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                }}
              >
                Create Post
              </Button>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  display: { xs: "none", sm: "block" },
                  maxWidth: 150,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {session.user?.name || session.user?.email}
              </Typography>
              
              <IconButton 
                color="inherit" 
                onClick={handleUserMenuOpen}
                sx={{ 
                  color: theme.palette.text.primary,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": { transform: "scale(1.1)" }
                }}
              >
                {session.user?.image ? (
                  <Avatar src={session.user.image} sx={{ width: 32, height: 32 }} />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                PaperProps={{
                  sx: {
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <MenuItem 
                  component={Link} 
                  href="/posts" 
                  onClick={handleUserMenuClose}
                  sx={{ gap: 1.5, minWidth: 140 }}
                >
                  My Posts
                </MenuItem>
                <MenuItem 
                  component={Link} 
                  href="/posts/create" 
                  onClick={handleUserMenuClose}
                  sx={{ gap: 1.5, minWidth: 140 }}
                >
                  Create Post
                </MenuItem>
                <MenuItem 
                  onClick={handleSignOut}
                  sx={{ gap: 1.5, minWidth: 140, color: theme.palette.error.main }}
                >
                  <ExitToApp sx={{ fontSize: 20 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button 
                variant="outlined" 
                component={Link} 
                href="/auth/signin"
                sx={{ 
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 }
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained" 
                component={Link} 
                href="/auth/signup"
                sx={{ 
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
