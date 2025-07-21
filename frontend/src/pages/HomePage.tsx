import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { PostForm } from '../components/PostForm'
import { PostItem } from '../components/PostItem'
import { api } from '../lib/trpc'

interface Post {
  id: string
  content: string
  userId: string
  user: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { user, logout } = useAuth()

  const fetchPosts = async () => {
    try {
      const data = await api.getPosts()
      setPosts(data as Post[])
      setError('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handleCreatePost = async (content: string) => {
    const newPost = await api.createPost({ content })
    setPosts(prev => [newPost as Post, ...prev])
  }

  const handleUpdatePost = async (id: string, content: string) => {
    const updatedPost = await api.updatePost(id, { content })
    setPosts(prev => prev.map(post => 
      post.id === id ? updatedPost as Post : post
    ))
  }

  const handleDeletePost = async (id: string) => {
    await api.deletePost(id)
    setPosts(prev => prev.filter(post => post.id !== id))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Microblog</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}!</span>
              <button
                onClick={logout}
                className="btn btn-secondary text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Post Form */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create a Post</h2>
          <PostForm onSubmit={handleCreatePost} />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button
              onClick={fetchPosts}
              className="ml-2 text-red-800 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Posts Feed */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Posts</h2>
          
          {posts.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg p-8 text-center">
              <p className="text-gray-500">No posts yet. Be the first to share something!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostItem
                  key={post.id}
                  post={post}
                  onUpdate={handleUpdatePost}
                  onDelete={handleDeletePost}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
