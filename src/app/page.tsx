"use client";

import { 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Box, 
  Chip,
  useTheme,
  Stack,
  Divider
} from "@mui/material";
import { Edit, Delete, TrendingUp, Timeline, Group } from "@mui/icons-material";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  const { data: posts, isLoading } = trpc.post.getAll.useQuery();
  const theme = useTheme();

  const sidebar = (
    <Stack spacing={3}>
      {/* Welcome Card */}
      <Card 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
          border: `1px solid ${theme.palette.primary.main}33`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            T3 Stack Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            A modern productivity interface built with the T3 stack principles.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label="Next.js 14" size="small" variant="outlined" />
            <Chip label="tRPC" size="small" variant="outlined" />
            <Chip label="Prisma" size="small" variant="outlined" />
            <Chip label="Material UI" size="small" variant="outlined" />
          </Stack>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Platform Stats
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TrendingUp sx={{ color: theme.palette.primary.main }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {posts?.length || 0} Total Posts
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Published content
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Timeline sx={{ color: theme.palette.secondary.main }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Clean Design
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Material Dashboard
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Group sx={{ color: theme.palette.primary.main }} />
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Type-Safe
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  End-to-end TypeScript
                </Typography>
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Quick Actions (if signed in) */}
      {session && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Quick Actions
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="contained"
                component={Link}
                href="/posts/create"
                fullWidth
                sx={{ justifyContent: "flex-start", textTransform: "none" }}
              >
                Create New Post
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/posts"
                fullWidth
                sx={{ justifyContent: "flex-start", textTransform: "none" }}
              >
                Manage Posts
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );

  return (
    <Layout variant="dashboard" sidebar={sidebar}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom>
          Latest Posts
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.125rem" }}>
          Discover the latest content from our community
        </Typography>
      </Box>

      {/* Welcome Message for Non-Authenticated Users */}
      {!session && (
        <Card 
          sx={{ 
            mb: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
            border: `1px solid ${theme.palette.primary.main}20`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              Welcome to T3 Stack Dashboard!
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              A modern productivity interface that demonstrates the power of type-safe full-stack development.
              Sign in to create and manage your posts.
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button 
                variant="contained" 
                component={Link} 
                href="/auth/signin"
                size="large"
              >
                Sign In
              </Button>
              <Button 
                variant="outlined" 
                component={Link} 
                href="/auth/signup"
                size="large"
              >
                Create Account
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Posts Grid */}
      {isLoading ? (
        <Box sx={{ 
          display: "grid", 
          gap: 3, 
          gridTemplateColumns: { xs: "1fr", md: "repeat(auto-fit, minmax(350px, 1fr))" } 
        }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ 
                  height: 20, 
                  bgcolor: "action.hover", 
                  borderRadius: 1, 
                  mb: 2,
                  animation: "pulse 1.5s ease-in-out infinite"
                }} />
                <Box sx={{ 
                  height: 60, 
                  bgcolor: "action.hover", 
                  borderRadius: 1,
                  animation: "pulse 1.5s ease-in-out infinite"
                }} />
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : posts && posts.length > 0 ? (
        <Box sx={{ 
          display: "grid", 
          gap: 3, 
          gridTemplateColumns: { xs: "1fr", md: "repeat(auto-fit, minmax(350px, 1fr))" } 
        }}>
          {posts.map((post: any) => (
            <Card key={post.id}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  {post.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
                >
                  By {post.author.name || post.author.email} • 
                  {new Date(post.createdAt).toLocaleDateString()}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body1" sx={{ 
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.6
                }}>
                  {post.content}
                </Typography>
              </CardContent>
              {session && session.user.id === post.authorId && (
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button 
                    size="small" 
                    startIcon={<Edit />}
                    component={Link}
                    href={`/posts/${post.id}/edit`}
                    sx={{ textTransform: "none" }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    startIcon={<Delete />}
                    sx={{ textTransform: "none" }}
                  >
                    Delete
                  </Button>
                </CardActions>
              )}
            </Card>
          ))}
        </Box>
      ) : (
        <Card>
          <CardContent sx={{ p: 4, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              No posts yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {session 
                ? "Be the first to create a post and share your thoughts with the community!" 
                : "Sign in to see and create posts."}
            </Typography>
            {session && (
              <Button 
                variant="contained" 
                component={Link} 
                href="/posts/create"
                size="large"
                sx={{ mt: 2 }}
              >
                Create First Post
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </Layout>
  );
}
