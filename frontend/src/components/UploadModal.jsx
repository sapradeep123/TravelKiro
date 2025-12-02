import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { api } from '../services/api'
import { Upload, X, File, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

export default function UploadModal({ onClose, onSuccess, defaultFolder = null }) {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [tags, setTags] = useState('')
  
  // Section and Folder state
  const [section, setSection] = useState('')
  const [sections, setSections] = useState([])
  const [folder, setFolder] = useState(defaultFolder || '')
  const [folders, setFolders] = useState([])
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  
  const [customMetadata, setCustomMetadata] = useState({})
  const [newMetadataKey, setNewMetadataKey] = useState('')
  const [newMetadataValue, setNewMetadataValue] = useState('')

  useEffect(() => {
    loadSections()
  }, [])
  
  useEffect(() => {
    // Load folders when section changes
    if (section) {
      loadFoldersForSection(section)
    } else {
      setFolders([])
      setFolder('')
    }
  }, [section])

  useEffect(() => {
    // Set default folder if provided (separate effect to handle updates)
    if (defaultFolder) {
      console.log('Setting default folder in UploadModal:', defaultFolder)
      setFolder(defaultFolder)
      // Also add to folders list if it doesn't exist
      setFolders(prev => {
        if (!prev.includes(defaultFolder)) {
          return [...prev, defaultFolder].sort()
        }
        return prev
      })
    }
  }, [defaultFolder])

  const getAccountId = () => {
    return user?.default_account_id || user?.accounts?.[0]?.id
  }

  const loadSections = async () => {
    try {
      // Load sections from DMS
      const accountId = getAccountId()
      if (accountId) {
        const sectionsResponse = await api.get('/v2/dms/sections', {
          headers: { 'X-Account-Id': accountId }
        })
        setSections(sectionsResponse.data || [])
      }
    } catch (error) {
      console.error('Failed to load sections:', error)
    }
  }
  
  const loadFoldersForSection = async (sectionId) => {
    try {
      const accountId = getAccountId()
      if (!accountId) return
      
      const response = await api.get('/v2/dms/folders-dms', {
        params: { section_id: sectionId },
        headers: { 'X-Account-Id': accountId }
      })
      setFolders(response.data || [])
    } catch (error) {
      console.error('Failed to load folders for section:', error)
      setFolders([])
    }
  }

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(2, 11)
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

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Please enter a folder name')
      return
    }
    
    if (!section) {
      toast.error('Please select a section first')
      return
    }
    
    try {
      const accountId = getAccountId()
      const folderData = {
        name: newFolderName.trim(),
        account_id: accountId,
        section_id: section,
        parent_folder_id: folder || null
      }
      
      const response = await api.post('/v2/dms/folders-dms', folderData, {
        headers: { 'X-Account-Id': accountId }
      })
      
      // Reload folders for this section
      await loadFoldersForSection(section)
      setFolder(response.data.id)
      setNewFolderName('')
      setShowNewFolder(false)
      toast.success('Folder created successfully')
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create folder')
    }
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file')
      return
    }

    if (!section) {
      toast.error('Please select a section')
      return
    }

    if (!folder) {
      toast.error('Please select a folder')
      return
    }

    setUploading(true)

    try {
      const accountId = getAccountId()
      const formData = new FormData()
      
      // Add all files to the form data
      files.forEach(({ file }) => {
        formData.append('files', file)
      })
      
      // Upload to DMS system
      const response = await api.post(`/v2/dms/files-dms/upload?folder_id=${folder}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-Account-Id': accountId
        },
      })

      // Update metadata with tags if specified
      if (tags && response.data.uploaded) {
        const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
        for (const uploadedFile of response.data.uploaded) {
          try {
            await api.patch(`/v2/dms/files-dms/${uploadedFile.file_id}`, {
              tags: tagList
            }, {
              headers: { 'X-Account-Id': accountId }
            })
          } catch (err) {
            console.error('Failed to update tags:', err)
          }
        }
      }

      const folderName = folders.find(f => f.id === folder)?.name || 'selected folder'
      const sectionName = sections.find(s => s.id === section)?.name || 'selected section'
      
      toast.success(`Successfully uploaded ${response.data.success_count} file(s) to ${sectionName} / ${folderName}`)
      
      if (response.data.fail_count > 0) {
        toast.error(`${response.data.fail_count} file(s) failed to upload`)
      }
      
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

          {/* Section - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section <span className="text-red-500">*</span>
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="input-field w-full"
              required
            >
              <option value="">Select a section...</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
            {section && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: <strong>{sections.find(s => s.id === section)?.name}</strong>
              </p>
            )}
          </div>

          {/* Folder - Required */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Folder <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-2">
              <select
                value={folder}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setShowNewFolder(true)
                  } else {
                    setFolder(e.target.value)
                    setShowNewFolder(false)
                  }
                }}
                className="input-field flex-1"
                disabled={!section}
                required
              >
                <option value="">Select a folder...</option>
                {folders.map((fold) => (
                  <option key={fold.id} value={fold.id}>{fold.name}</option>
                ))}
                <option value="__new__">+ Create New Folder</option>
              </select>
            </div>
            {!section && (
              <p className="text-xs text-gray-500 mt-1">Please select a section first</p>
            )}
            {showNewFolder && (
              <div className="mt-2 flex space-x-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder name"
                  className="input-field flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                />
                <button
                  onClick={handleAddFolder}
                  className="btn-secondary whitespace-nowrap"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowNewFolder(false)
                    setNewFolderName('')
                  }}
                  className="btn-secondary"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            {folder && !showNewFolder && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-700">
                  <strong>📁 Folder:</strong> {folders.find(f => f.id === folder)?.name}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Files will be uploaded to this folder
                </p>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated, optional)
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
            disabled={uploading || files.length === 0 || !section || !folder}
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

