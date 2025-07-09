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
  Stack
} from "@mui/material";
import { Person, Mail, Lock } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import Link from "next/link";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      setSuccess("Account created successfully! Redirecting to sign in...");
      setError("");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    registerMutation.mutate({ name, email, password });
  };

  const sidebar = (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Join Our Community
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Create an account to start building with the T3 stack and share your content.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Already have an account? Sign in to access your dashboard.
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            What you'll get
          </Typography>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              • Create and manage your posts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Access to the full dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Type-safe development experience
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Modern Material UI interface
            </Typography>
          </Stack>
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
              Sign Up
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your T3 Stack Dashboard account
            </Typography>
          </Box>
          
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                {success}
              </Alert>
            )}

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

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
                autoComplete="new-password"
                helperText="Minimum 6 characters"
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
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
                disabled={registerMutation.isPending}
                size="large"
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem"
                }}
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </Stack>
          </form>
        </CardContent>

        <CardActions sx={{ p: 4, pt: 0, justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <MuiLink 
              component={Link} 
              href="/auth/signin"
              sx={{ 
                fontWeight: 600,
                textDecoration: "none",
                "&:hover": { textDecoration: "underline" }
              }}
            >
              Sign in here
            </MuiLink>
          </Typography>
        </CardActions>
      </Card>
    </Layout>
  );
}
