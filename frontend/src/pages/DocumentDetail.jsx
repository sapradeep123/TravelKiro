import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../services/api'
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Share2, 
  Eye, 
  Tag, 
  MessageSquare,
  Plus,
  Edit2,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function DocumentDetail() {
  const { id } = useParams()
  const [document, setDocument] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [newTag, setNewTag] = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [customMetadata, setCustomMetadata] = useState({})
  const [newMetadataKey, setNewMetadataKey] = useState('')
  const [newMetadataValue, setNewMetadataValue] = useState('')

  useEffect(() => {
    loadDocument()
    loadComments()
  }, [id])

  const loadDocument = async () => {
    try {
      const response = await api.get(`/v2/metadata/${id}/detail`)
      const doc = response.data
      setDocument(doc)
      setCustomMetadata(doc.custom_metadata || {})
    } catch (error) {
      toast.error('Failed to load document')
    } finally {
      setLoading(false)
    }
  }

  const loadComments = async () => {
    try {
      const response = await api.get(`/v2/documents/${id}/comments`)
      setComments(response.data)
    } catch (error) {
      // Comments might not be available
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await api.post(`/v2/documents/${id}/comments`, {
        comment: newComment,
      })
      setComments(prev => [response.data, ...prev])
      setNewComment('')
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const handleUpdateComment = async (commentId, comment) => {
    try {
      const response = await api.put(`/v2/documents/comments/${commentId}`, {
        comment,
      })
      setComments(prev => prev.map(c => c.id === commentId ? response.data : c))
      setEditingComment(null)
      toast.success('Comment updated')
    } catch (error) {
      toast.error('Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/v2/documents/comments/${commentId}`)
      setComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Comment deleted')
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleAddTag = async () => {
    if (!newTag.trim()) return

    try {
      const currentTags = document.tags || []
      const updatedTags = [...currentTags, newTag.trim()]
      await api.put(`/v2/metadata/${document.name}`, {
        tags: updatedTags,
      })
      setDocument(prev => ({ ...prev, tags: updatedTags }))
      setNewTag('')
      toast.success('Tag added')
    } catch (error) {
      toast.error('Failed to add tag')
    }
  }

  const handleRemoveTag = async (tagToRemove) => {
    try {
      const updatedTags = (document.tags || []).filter(t => t !== tagToRemove)
      await api.put(`/v2/metadata/${document.name}`, {
        tags: updatedTags,
      })
      setDocument(prev => ({ ...prev, tags: updatedTags }))
      toast.success('Tag removed')
    } catch (error) {
      toast.error('Failed to remove tag')
    }
  }

  const handleAddCustomMetadata = async () => {
    if (!newMetadataKey || !newMetadataValue) return

    try {
      const updated = { ...customMetadata, [newMetadataKey]: newMetadataValue }
      await api.put(`/v2/metadata/${document.name}`, {
        custom_metadata: updated,
      })
      setCustomMetadata(updated)
      setNewMetadataKey('')
      setNewMetadataValue('')
      toast.success('Custom metadata added')
    } catch (error) {
      toast.error('Failed to add custom metadata')
    }
  }

  const handleRemoveCustomMetadata = async (key) => {
    try {
      const updated = { ...customMetadata }
      delete updated[key]
      await api.put(`/v2/metadata/${document.name}`, {
        custom_metadata: updated,
      })
      setCustomMetadata(updated)
      toast.success('Custom metadata removed')
    } catch (error) {
      toast.error('Failed to remove custom metadata')
    }
  }

  const handleDownload = async () => {
    try {
      const response = await api.get(`/v2/file/${document.name}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', document.name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Download started')
    } catch (error) {
      toast.error('Failed to download')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Document not found</p>
        <Link to="/documents" className="btn-primary mt-4 inline-block">
          Back to Documents
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link to="/documents" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm md:text-base">
          <ArrowLeft size={18} className="md:w-5 md:h-5" />
          <span>Back to Documents</span>
        </Link>
        <div className="flex items-center space-x-2">
          <button onClick={handleDownload} className="btn-secondary flex items-center space-x-2 text-sm md:text-base">
            <Download size={18} />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 break-words">{document.name}</h1>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="text-gray-900">
                  {format(new Date(document.created_at), 'MMMM dd, yyyy HH:mm')}
                </p>
              </div>
              {document.size && (
                <div>
                  <p className="text-sm text-gray-500">Size</p>
                  <p className="text-gray-900">{(document.size / 1024).toFixed(2)} KB</p>
                </div>
              )}
              {document.file_type && (
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="text-gray-900">{document.file_type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Tag size={20} />
              <span>Tags</span>
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {document.tags && document.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center space-x-2"
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-900"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add a tag"
                className="input-field flex-1"
              />
              <button onClick={handleAddTag} className="btn-primary">
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Custom Metadata */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Metadata</h2>
            {Object.keys(customMetadata).length > 0 && (
              <div className="space-y-2 mb-4">
                {Object.entries(customMetadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <strong className="text-gray-900">{key}:</strong>
                      <span className="text-gray-700 ml-2">{value}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveCustomMetadata(key)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMetadataKey}
                onChange={(e) => setNewMetadataKey(e.target.value)}
                placeholder="Key"
                className="input-field flex-1"
              />
              <input
                type="text"
                value={newMetadataValue}
                onChange={(e) => setNewMetadataValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomMetadata()}
                placeholder="Value"
                className="input-field flex-1"
              />
              <button onClick={handleAddCustomMetadata} className="btn-primary">
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Comments */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <MessageSquare size={20} />
              <span>Comments ({comments.length})</span>
            </h2>
            <div className="space-y-4 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                  {editingComment?.id === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingComment.comment}
                        onChange={(e) => setEditingComment({ ...editingComment, comment: e.target.value })}
                        className="input-field"
                        rows={3}
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateComment(comment.id, editingComment.comment)}
                          className="btn-primary text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingComment(null)}
                          className="btn-secondary text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900 mb-2">{comment.comment}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingComment(comment)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="input-field flex-1"
                rows={3}
              />
              <button onClick={handleAddComment} className="btn-primary self-start">
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <button onClick={handleDownload} className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Download size={18} />
                <span>Download</span>
              </button>
              <a
                href={`/api/v2/preview/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Eye size={18} />
                <span>Preview</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

