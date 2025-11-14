import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { FileText, Image, File } from 'lucide-react'

export default function DocumentThumbnail({ document, className = '' }) {
  const [thumbnailUrl, setThumbnailUrl] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadThumbnail()
  }, [document])

  const loadThumbnail = async () => {
    try {
      // Try to get preview for images and PDFs
      if (document.file_type && ['jpg', 'jpeg', 'png', 'gif', 'pdf'].includes(document.file_type.toLowerCase())) {
        try {
          const response = await api.get(`/v2/preview/${document.id}`, {
            responseType: 'blob',
          })
          const url = URL.createObjectURL(response.data)
          setThumbnailUrl(url)
        } catch {
          // Preview not available, use default icon
        }
      }
    } catch (error) {
      // Ignore errors, use default icon
    } finally {
      setLoading(false)
    }
  }

  const getIcon = () => {
    if (document.file_type) {
      const type = document.file_type.toLowerCase()
      if (['jpg', 'jpeg', 'png', 'gif'].includes(type)) {
        return <Image className="text-gray-400" size={48} />
      }
    }
    return <FileText className="text-gray-400" size={48} />
  }

  if (loading) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="animate-pulse">
          {getIcon()}
        </div>
      </div>
    )
  }

  if (thumbnailUrl) {
    return (
      <img
        src={thumbnailUrl}
        alt={document.name}
        className={`object-cover w-full h-full ${className}`}
        onError={() => setThumbnailUrl(null)}
      />
    )
  }

  return (
    <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
      {getIcon()}
    </div>
  )
}

