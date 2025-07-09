"use client";

import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardActions, 
  TextField, 
  Button, 
  Typography, 
  Alert,
  Box,
  FormControlLabel,
  Switch
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";

interface EditPostProps {
  params: {
    id: string;
  };
}

export default function EditPost({ params }: EditPostProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: post, isLoading: postLoading } = trpc.post.getById.useQuery(
    { id: params.id },
    { enabled: !!session }
  );

  const updatePostMutation = trpc.post.update.useMutation({
    onSuccess: () => {
      router.push("/posts");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setPublished(post.published);
    }
  }, [post]);

  if (status === "loading" || postLoading) {
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

  if (!post) {
    return (
      <Layout>
        <Alert severity="error">Post not found</Alert>
      </Layout>
    );
  }

  if (post.authorId !== session.user.id) {
    return (
      <Layout>
        <Alert severity="error">You don't have permission to edit this post</Alert>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    updatePostMutation.mutate({ 
      id: params.id, 
      title, 
      content, 
      published 
    });
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Edit Post
        </Typography>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                margin="normal"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Content"
                multiline
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                margin="normal"
                variant="outlined"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                  />
                }
                label="Published"
                sx={{ mt: 2 }}
              />
            </CardContent>

            <CardActions sx={{ justifyContent: "flex-end", p: 3 }}>
              <Button
                variant="outlined"
                onClick={() => router.back()}
                disabled={updatePostMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={updatePostMutation.isPending}
              >
                {updatePostMutation.isPending ? "Updating..." : "Update Post"}
              </Button>
            </CardActions>
          </form>
        </Card>
      </Box>
    </Layout>
  );
}
