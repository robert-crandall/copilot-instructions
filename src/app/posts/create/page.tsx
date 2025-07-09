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
  FormControlLabel,
  Switch,
  Stack,
  Chip
} from "@mui/material";
import { Save, Preview, Article } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const { data: session, status } = useSession();
  const router = useRouter();

  const createPostMutation = trpc.post.create.useMutation({
    onSuccess: () => {
      router.push("/posts");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  if (status === "loading") {
    return (
      <Layout>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6">Loading...</Typography>
        </Box>
      </Layout>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    createPostMutation.mutate({ title, content, published });
  };

  const sidebar = (
    <Stack spacing={3}>
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Writing Tips
          </Typography>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              • Keep your title clear and descriptive
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Use proper formatting for readability
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Save as draft first to review later
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Publish when you're ready to share
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Live Preview */}
      {(title || content) && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Preview sx={{ fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Preview
              </Typography>
            </Box>
            {title && (
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {content && (
              <Typography 
                variant="body1" 
                sx={{ 
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                  maxHeight: 200,
                  overflow: "auto"
                }}
              >
                {content.slice(0, 500)}{content.length > 500 ? "..." : ""}
              </Typography>
            )}
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={published ? "Will be published" : "Will be saved as draft"} 
                color={published ? "success" : "default"}
                size="small"
              />
            </Box>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Post Stats
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Title length: {title.length}/100 characters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Content length: {content.length} characters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Words: ~{content.split(' ').filter(w => w.length > 0).length}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );

  return (
    <Layout variant="form" sidebar={sidebar}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" gutterBottom>
          Create New Post
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: "1.125rem" }}>
          Share your thoughts and ideas with the community
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Post Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                variant="outlined"
                placeholder="Enter a compelling title for your post"
                helperText={`${title.length}/100 characters`}
                inputProps={{ maxLength: 100 }}
                InputProps={{
                  startAdornment: <Article sx={{ mr: 1, color: "text.secondary" }} />,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

              <TextField
                fullWidth
                label="Content"
                multiline
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                variant="outlined"
                placeholder="Write your post content here... You can use line breaks and basic formatting."
                helperText={`${content.length} characters`}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  }
                }}
              />

              <Box sx={{ 
                p: 3, 
                bgcolor: "action.hover", 
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Publication Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {published 
                      ? "This post will be published and visible to everyone" 
                      : "This post will be saved as a draft for later"}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      size="medium"
                    />
                  }
                  label={published ? "Publish" : "Draft"}
                  labelPlacement="start"
                />
              </Box>
            </Stack>
          </form>
        </CardContent>

        <CardActions sx={{ p: 4, pt: 0, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => router.back()}
            disabled={createPostMutation.isPending}
            size="large"
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={createPostMutation.isPending}
            onClick={handleSubmit}
            size="large"
            startIcon={<Save />}
            sx={{ 
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            {createPostMutation.isPending 
              ? "Saving..." 
              : published 
                ? "Publish Post" 
                : "Save Draft"}
          </Button>
        </CardActions>
      </Card>
    </Layout>
  );
}
