import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { api } from '../services/api'
import { Upload, X, File, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UploadModal({ onClose, onSuccess }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [tags, setTags] = useState('')
  const [customMetadata, setCustomMetadata] = useState({})
  const [newMetadataKey, setNewMetadataKey] = useState('')
  const [newMetadataValue, setNewMetadataValue] = useState('')

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9)
    }))])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  })

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const addCustomMetadata = () => {
    if (newMetadataKey && newMetadataValue) {
      setCustomMetadata(prev => ({
        ...prev,
        [newMetadataKey]: newMetadataValue
      }))
      setNewMetadataKey('')
      setNewMetadataValue('')
    }
  }

  const removeCustomMetadata = (key) => {
    setCustomMetadata(prev => {
      const newMeta = { ...prev }
      delete newMeta[key]
      return newMeta
    })
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    
    files.forEach(({ file }) => {
      formData.append('files', file)
    })

    try {
      const response = await api.post('/v2/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // Update metadata with tags and custom metadata if provided
      if (tags || Object.keys(customMetadata).length > 0) {
        const uploadedDocs = Array.isArray(response.data) ? response.data : [response.data]
        for (const doc of uploadedDocs) {
          const updateData = {}
          if (tags) {
            updateData.tags = tags.split(',').map(t => t.trim())
          }
          if (Object.keys(customMetadata).length > 0) {
            updateData.custom_metadata = customMetadata
          }
          
          if (Object.keys(updateData).length > 0) {
            await api.put(`/v2/metadata/${doc.name}`, updateData)
          }
        }
      }

      toast.success(`Successfully uploaded ${files.length} file(s)`)
      onSuccess()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 mb-2">
              {isDragActive
                ? 'Drop files here'
                : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-sm text-gray-500">Supports multiple files</p>
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Selected Files ({files.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map(({ file, id }) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <File size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(id)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="input-field"
            />
          </div>

          {/* Custom Metadata */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Metadata
            </label>
            <div className="flex space-x-2 mb-2">
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
                placeholder="Value"
                className="input-field flex-1"
              />
              <button
                onClick={addCustomMetadata}
                className="btn-secondary whitespace-nowrap"
              >
                Add
              </button>
            </div>
            {Object.keys(customMetadata).length > 0 && (
              <div className="space-y-2">
                {Object.entries(customMetadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">
                      <strong>{key}:</strong> {value}
                    </span>
                    <button
                      onClick={() => removeCustomMetadata(key)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button onClick={onClose} className="btn-secondary" disabled={uploading}>
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader className="animate-spin" size={20} />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={20} />
                <span>Upload {files.length} file(s)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

