import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  Upload, 
  Download, 
  Trash2, 
  Eye, 
  Tag,
  Grid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  X,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import UploadModal from '../components/UploadModal'
import DocumentThumbnail from '../components/DocumentThumbnail'

export default function Documents() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [showUpload, setShowUpload] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedTags, setSelectedTags] = useState([])
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || '')
  const [selectedFolder, setSelectedFolder] = useState('')
  const [sections, setSections] = useState([])
  const [folders, setFolders] = useState([])
  const [sortBy, setSortBy] = useState('created')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalDocs, setTotalDocs] = useState(0)
  const itemsPerPage = 20

  const getAccountId = () => {
    return user?.default_account_id || user?.accounts?.[0]?.id
  }

  useEffect(() => {
    loadSectionsAndFolders()
  }, [user])

  // Update URL when section changes
  useEffect(() => {
    if (selectedSection) {
      searchParams.set('section', selectedSection)
    } else {
      searchParams.delete('section')
    }
    setSearchParams(searchParams, { replace: true })
  }, [selectedSection])

  const loadSectionsAndFolders = async () => {
    try {
      const accountId = getAccountId()
      if (!accountId) return
      
      // Load sections
      const sectionsResponse = await api.get('/v2/dms/sections', {
        headers: { 'X-Account-Id': accountId }
      })
      setSections(sectionsResponse.data || [])
      
      // Load all folders
      const foldersResponse = await api.get('/v2/dms/folders-dms', {
        headers: { 'X-Account-Id': accountId }
      })
      const loadedFolders = foldersResponse.data || []
      setFolders(loadedFolders)
      
      // Return folders for immediate use
      return loadedFolders
    } catch (error) {
      console.error('Failed to load sections and folders:', error)
      return []
    }
  }

  useEffect(() => {
    // Only load documents after folders are loaded (needed for section filtering)
    if (folders.length > 0 || !selectedSection) {
      loadDocuments(folders)
    }
  }, [currentPage, sortBy, sortOrder, selectedSection, selectedFolder, user, folders])

  const loadDocuments = async (currentFolders = folders) => {
    try {
      setLoading(true)
      const accountId = getAccountId()
      if (!accountId) {
        setDocuments([])
        setTotalDocs(0)
        setLoading(false)
        return
      }
      
      // Build query params for DMS files API
      const params = new URLSearchParams()
      
      if (selectedFolder) {
        params.append('folder_id', selectedFolder)
      }
      
      params.append('skip', ((currentPage - 1) * itemsPerPage).toString())
      params.append('limit', itemsPerPage.toString())
      
      const response = await api.get(`/v2/dms/files-dms?${params.toString()}`, {
        headers: { 'X-Account-Id': accountId }
      })
      
      let files = response.data || []
      console.log('DMS Files Response:', files)
      
      // Filter by section if selected (files don't have section_id directly, need to filter via folder)
      if (selectedSection && !selectedFolder && currentFolders.length > 0) {
        const sectionFolderIds = currentFolders
          .filter(f => f.section_id === selectedSection)
          .map(f => f.id)
        files = files.filter(f => sectionFolderIds.includes(f.folder_id))
      }
      
      // Sort documents
      const sorted = [...files].sort((a, b) => {
        let aVal, bVal
        switch (sortBy) {
          case 'created':
            aVal = new Date(a.created_at)
            bVal = new Date(b.created_at)
            break
          case 'name':
            aVal = (a.name || '').toLowerCase()
            bVal = (b.name || '').toLowerCase()
            break
          case 'size':
            aVal = a.size_bytes || 0
            bVal = b.size_bytes || 0
            break
          default:
            aVal = new Date(a.created_at)
            bVal = new Date(b.created_at)
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
      
      setDocuments(sorted)
      setTotalDocs(sorted.length)
    } catch (error) {
      console.error('Failed to load documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (doc) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      const accountId = getAccountId()
      await api.delete(`/v2/dms/files-dms/${doc.id}`, {
        headers: { 'X-Account-Id': accountId }
      })
      toast.success('Document moved to trash')
      loadDocuments()
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }

  const handleDownload = async (doc) => {
    try {
      const accountId = getAccountId()
      const response = await api.get(`/v2/dms/files-dms/${doc.id}/download`, {
        headers: { 'X-Account-Id': accountId },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', doc.name || doc.original_filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Download started')
    } catch (error) {
      toast.error('Failed to download document')
    }
  }

  const allTags = [...new Set(documents.flatMap(doc => doc.tags || []))]

  const filteredDocuments = documents.filter((doc) => {
    // Filter by tags
    if (selectedTags.length > 0) {
      const hasTag = selectedTags.some(tag => doc.tags && doc.tags.includes(tag))
      if (!hasTag) return false
    }
    
    return true
  })

  const totalPages = Math.ceil(totalDocs / itemsPerPage)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Documents</h1>
            <p className="text-sm text-gray-600 mt-1">{totalDocs} documents</p>
          </div>
          <button 
            onClick={() => setShowUpload(true)} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Upload size={18} />
            <span>Upload</span>
          </button>
        </div>

        {/* Filter and Sort Bar */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <button className="px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1 md:space-x-2">
                <span className="hidden sm:inline">Title & content</span>
                <span className="sm:hidden">Title</span>
                <ChevronLeft size={14} className="rotate-[-90deg]" />
              </button>
              
              <button className="px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1 md:space-x-2">
                <Tag size={14} className="md:w-4 md:h-4" />
                <span className="hidden sm:inline">Tags</span>
              </button>
              
              <button className="px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1 md:space-x-2">
                <span>Created</span>
              </button>
              
              <button className="px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1 md:space-x-2">
                <span>Added</span>
              </button>

              {/* Section Filter */}
              <select
                value={selectedSection}
                onChange={(e) => {
                  setSelectedSection(e.target.value)
                  setSelectedFolder('') // Reset folder when section changes
                }}
                className="px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Sections</option>
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>{sec.name}</option>
                ))}
              </select>

              {/* Folder Filter */}
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="">All Folders</option>
                {folders
                  .filter(f => !selectedSection || f.section_id === selectedSection)
                  .map((fold) => (
                    <option key={fold.id} value={fold.id}>{fold.name}</option>
                  ))}
              </select>

              {(selectedTags.length > 0 || selectedSection || selectedFolder) && (
                <button
                  onClick={() => {
                    setSelectedTags([])
                    setSelectedSection('')
                    setSelectedFolder('')
                  }}
                  className="px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-1 md:space-x-2 text-red-600"
                >
                  <X size={14} />
                  <span className="hidden sm:inline">Reset filters</span>
                  <span className="sm:hidden">Reset</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <ListIcon size={18} />
              </button>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-')
                  setSortBy(by)
                  setSortOrder(order)
                }}
                className="px-2 md:px-3 py-1.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="created-desc">Newest first</option>
                <option value="created-asc">Oldest first</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="size-desc">Largest first</option>
                <option value="size-asc">Smallest first</option>
              </select>
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag) 
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center space-x-1 ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Tag size={14} />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 mb-4">
            {(selectedTags.length > 0 || selectedSection || selectedFolder)
              ? 'No documents match your filters'
              : 'No documents yet'}
          </p>
          {(selectedTags.length === 0 && !selectedSection && !selectedFolder) && (
            <button onClick={() => setShowUpload(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Upload your first document
            </button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onDownload={() => handleDownload(doc)}
                  onDelete={() => handleDelete(doc)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <DocumentListItem
                  key={doc.id}
                  doc={doc}
                  onDownload={() => handleDownload(doc)}
                  onDelete={() => handleDelete(doc)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 md:mt-6 flex items-center justify-center space-x-1 md:space-x-2 overflow-x-auto pb-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex-shrink-0"
              >
                <ChevronLeft size={18} className="md:w-5 md:h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 md:px-4 py-2 text-sm md:text-base border rounded-lg ${
                      currentPage === pageNum
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex-shrink-0"
              >
                <ChevronRight size={18} className="md:w-5 md:h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            loadDocuments()
            setShowUpload(false)
          }}
        />
      )}
    </div>
  )
}

// Document Card Component
function DocumentCard({ doc, onDownload, onDelete }) {
  // Get file extension from mime_type or name
  const getFileType = () => {
    if (doc.mime_type) {
      const parts = doc.mime_type.split('/')
      return parts[parts.length - 1]
    }
    if (doc.name) {
      const parts = doc.name.split('.')
      return parts.length > 1 ? parts[parts.length - 1] : ''
    }
    return ''
  }

  const fileType = getFileType()
  const displayName = doc.name || doc.original_filename || 'Unnamed'
  const fileSize = doc.size_bytes || doc.size || 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Thumbnail */}
      <Link to={`/files/${doc.id}`} className="block relative aspect-[3/4] bg-gray-100">
        <DocumentThumbnail document={doc} className="absolute inset-0 w-full h-full" />
        {fileType && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            {fileType.toUpperCase()}
          </div>
        )}
        {/* Action buttons on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              onDownload()
            }}
            className="p-2 bg-white rounded-lg hover:bg-gray-100"
            title="Download"
          >
            <Download size={18} />
          </button>
          <Link
            to={`/files/${doc.id}`}
            className="p-2 bg-white rounded-lg hover:bg-gray-100"
            title="View"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault()
              onDelete()
            }}
            className="p-2 bg-white rounded-lg hover:bg-gray-100 text-red-600"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        <Link to={`/files/${doc.id}`}>
          <h3 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">
            {displayName}
          </h3>
        </Link>
        
        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {doc.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {doc.tags.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{doc.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy') : '-'}</span>
          {fileSize > 0 && (
            <span>{(fileSize / 1024).toFixed(1)} KB</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Document List Item Component
function DocumentListItem({ doc, onDownload, onDelete }) {
  // Get file extension from mime_type or name
  const getFileType = () => {
    if (doc.mime_type) {
      const parts = doc.mime_type.split('/')
      return parts[parts.length - 1]
    }
    if (doc.name) {
      const parts = doc.name.split('.')
      return parts.length > 1 ? parts[parts.length - 1] : ''
    }
    return ''
  }

  const fileType = getFileType()
  const displayName = doc.name || doc.original_filename || 'Unnamed'
  const fileSize = doc.size_bytes || doc.size || 0

  return (
    <div className="p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        {/* Thumbnail */}
        <div className="w-16 h-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
          <FileText className="text-gray-400" size={24} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <Link to={`/files/${doc.id}`}>
                <h3 className="font-medium text-gray-900 hover:text-blue-600 mb-1">
                  {displayName}
                </h3>
              </Link>
              
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>Created: {doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy') : '-'}</span>
                {fileSize > 0 && <span>{(fileSize / 1024).toFixed(1)} KB</span>}
                {fileType && <span>{fileType.toUpperCase()}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={onDownload}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Download"
              >
                <Download size={18} />
              </button>
              <Link
                to={`/files/${doc.id}`}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="View"
              >
                <Eye size={18} />
              </Link>
              <button
                onClick={onDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
