"use client";

import { Typography, Card, CardContent, CardActions, Button, Box, Chip } from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function MyPosts() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: posts, isLoading, refetch } = trpc.post.getMyPosts.useQuery(undefined, {
    enabled: !!session,
  });

  const deletePostMutation = trpc.post.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  if (status === "loading") {
    return (
      <Layout>
        <Typography>Loading...</Typography>
      </Layout>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const handleDelete = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate({ id: postId });
    }
  };

  return (
    <Layout>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h2" component="h1">
          My Posts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          component={Link}
          href="/posts/create"
        >
          Create Post
        </Button>
      </Box>

      {isLoading ? (
        <Typography>Loading your posts...</Typography>
      ) : posts && posts.length > 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {posts.map((post: any) => (
            <Card key={post.id}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography variant="h5" component="h2">
                    {post.title}
                  </Typography>
                  <Chip 
                    label={post.published ? "Published" : "Draft"} 
                    color={post.published ? "success" : "default"}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Created: {new Date(post.createdAt).toLocaleDateString()} • 
                  Updated: {new Date(post.updatedAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body1">
                  {post.content.length > 200 
                    ? `${post.content.slice(0, 200)}...` 
                    : post.content}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  startIcon={<Edit />}
                  component={Link}
                  href={`/posts/${post.id}/edit`}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => handleDelete(post.id)}
                  disabled={deletePostMutation.isPending}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No posts yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first post to get started!
            </Typography>
          </CardContent>
          <CardActions>
            <Button component={Link} href="/posts/create" variant="contained">
              Create First Post
            </Button>
          </CardActions>
        </Card>
      )}
    </Layout>
  );
}
