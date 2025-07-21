import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

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

interface PostItemProps {
  post: Post
  onUpdate: (id: string, content: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function PostItem({ post, onUpdate, onDelete }: PostItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const isOwner = user?.id === post.userId
  const wasEdited = post.createdAt !== post.updatedAt

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(post.content)
    setError('')
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(post.content)
    setError('')
  }

  const handleSaveEdit = async () => {
    const trimmedContent = editContent.trim()
    if (!trimmedContent) {
      setError('Content is required')
      return
    }
    
    if (trimmedContent.length > 280) {
      setError('Content must be less than 280 characters')
      return
    }

    setIsLoading(true)
    try {
      await onUpdate(post.id, trimmedContent)
      setIsEditing(false)
      setError('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update post')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return

    setIsLoading(true)
    try {
      await onDelete(post.id)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete post')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const remainingChars = 280 - editContent.length

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{post.user.name}</h3>
          <p className="text-sm text-gray-500">
            {formatDate(post.createdAt)}
            {wasEdited && <span className="italic"> (edited)</span>}
          </p>
        </div>
        
        {isOwner && !isEditing && (
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="text-red-600 hover:text-red-500 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className={`form-input resize-none ${error ? 'error' : ''}`}
            rows={4}
            disabled={isLoading}
            maxLength={280}
          />
          <div className="flex justify-between items-center">
            <span className={`text-sm ${remainingChars < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {remainingChars} characters remaining
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="btn btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isLoading || !editContent.trim() || remainingChars < 0}
                className="btn btn-primary text-sm"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
      )}
    </div>
  )
}
