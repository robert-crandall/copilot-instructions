import { useState } from 'react'

interface PostFormProps {
  onSubmit: (content: string) => Promise<void>
  initialContent?: string
  submitLabel?: string
  isLoading?: boolean
}

export function PostForm({ 
  onSubmit, 
  initialContent = '', 
  submitLabel = 'Post', 
  isLoading = false 
}: PostFormProps) {
  const [content, setContent] = useState(initialContent)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      setError('Content is required')
      return
    }
    
    if (trimmedContent.length > 280) {
      setError('Content must be less than 280 characters')
      return
    }

    try {
      await onSubmit(trimmedContent)
      if (!initialContent) {
        setContent('') // Clear form only if it's a new post
      }
      setError('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save post')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
    if (error) {
      setError('')
    }
  }

  const remainingChars = 280 - content.length

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          What's on your mind?
        </label>
        <textarea
          id="content"
          value={content}
          onChange={handleChange}
          className={`form-input ${error ? 'error' : ''} resize-none`}
          rows={4}
          placeholder="Share your thoughts..."
          disabled={isLoading}
          maxLength={280}
        />
        <div className="mt-1 flex justify-between items-center">
          <span className={`text-sm ${remainingChars < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {remainingChars} characters remaining
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !content.trim() || remainingChars < 0}
        className="btn btn-primary"
      >
        {isLoading ? 'Saving...' : submitLabel}
      </button>
    </form>
  )
}
