"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardActions, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Box,
  Link as MuiLink,
  Stack,
  useTheme
} from "@mui/material";
import { Lock, Mail } from "@mui/icons-material";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import Link from "next/link";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sidebar = (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Sign in to access your dashboard and manage your posts.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Don't have an account yet? You can create one in just a few steps.
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Test Account
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You can use the seeded test account:
          </Typography>
          <Box sx={{ 
            p: 2, 
            bgcolor: theme.palette.action.hover, 
            borderRadius: 1,
            fontFamily: "monospace",
            fontSize: "0.875rem"
          }}>
            <div>Email: test@example.com</div>
            <div>Password: password123</div>
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );

  return (
    <Layout variant="form" sidebar={sidebar}>
      <Card sx={{ maxWidth: 500, mx: "auto" }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
              Sign In
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Access your T3 Stack Dashboard
            </Typography>
          </Box>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                InputProps={{
                  startAdornment: <Mail sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                size="large"
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem"
                }}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Stack>
          </form>
        </CardContent>

        <CardActions sx={{ p: 4, pt: 0, justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{" "}
            <MuiLink 
              component={Link} 
              href="/auth/signup"
              sx={{ 
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" }
              }}
            >
              Sign up here
            </MuiLink>
          </Typography>
        </CardActions>
      </Card>
    </Layout>
  );
}
