import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { List, Search, FileText, Plus, X, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomFields() {
  const [customFields, setCustomFields] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedField, setSelectedField] = useState(null)
  const [documentsWithField, setDocumentsWithField] = useState([])
  const [showDocuments, setShowDocuments] = useState(false)

  useEffect(() => {
    loadCustomFields()
  }, [])

  const loadCustomFields = async () => {
    try {
      setLoading(true)
      // Get all documents to extract unique custom metadata fields
      const response = await api.get('/v2/metadata?limit=99&offset=0')
      const data = response.data
      console.log('CustomFields API Response:', data) // Debug log
      
      // Find the key that starts with "documents of "
      const docsKey = Object.keys(data).find(key => key.startsWith('documents of '))
      console.log('CustomFields - Found docsKey:', docsKey) // Debug log
      const docs = docsKey ? (data[docsKey] || []) : []
      console.log('CustomFields - Documents array:', docs) // Debug log
      
      // Extract all unique custom metadata keys and count usage
      const fieldMap = new Map()
      
      docs.forEach(doc => {
        if (doc.custom_metadata && typeof doc.custom_metadata === 'object') {
          Object.keys(doc.custom_metadata).forEach(key => {
            if (!fieldMap.has(key)) {
              fieldMap.set(key, {
                key: key,
                value: doc.custom_metadata[key],
                documentCount: 0,
                documents: [],
                sampleValues: new Set()
              })
            }
            const field = fieldMap.get(key)
            field.documentCount++
            field.documents.push({
              id: doc.id,
              name: doc.name,
              value: doc.custom_metadata[key]
            })
            // Store sample values (up to 5 unique values)
            if (field.sampleValues.size < 5) {
              field.sampleValues.add(String(doc.custom_metadata[key]))
            }
          })
        }
      })
      
      // Convert to array and sort by document count (descending)
      const fieldsList = Array.from(fieldMap.values())
        .map(field => ({
          ...field,
          sampleValues: Array.from(field.sampleValues)
        }))
        .sort((a, b) => b.documentCount - a.documentCount)
      
      setCustomFields(fieldsList)
    } catch (error) {
      console.error('CustomFields load error:', error) // Debug log
      toast.error('Failed to load custom fields: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleViewDocuments = (field) => {
    setSelectedField(field)
    setDocumentsWithField(field.documents)
    setShowDocuments(true)
  }

  const filteredFields = customFields.filter(field =>
    field.key.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (showDocuments && selectedField) {
    return (
      <div className="p-4 md:p-6">
        <div className="mb-4 md:mb-6">
          <button
            onClick={() => {
              setShowDocuments(false)
              setSelectedField(null)
              setDocumentsWithField([])
            }}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center space-x-2"
          >
            <X size={20} />
            <span>Back to Custom Fields</span>
          </button>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            Documents with "{selectedField.key}"
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {documentsWithField.length} {documentsWithField.length === 1 ? 'document' : 'documents'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {documentsWithField.map((doc) => (
            <Link
              key={doc.id}
              to={`/documents/${doc.id}`}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{doc.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      <strong>{selectedField.key}:</strong> {String(doc.value)}
                    </p>
                  </div>
                </div>
                <Eye className="text-gray-400 flex-shrink-0" size={20} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Custom Fields</h1>
            <p className="text-sm text-gray-600 mt-1">
              {customFields.length} {customFields.length === 1 ? 'field' : 'fields'} defined
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search custom fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {customFields.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <List className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 mb-4">No custom fields found</p>
          <p className="text-sm text-gray-400">
            Add custom metadata to your documents to see them here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredFields.map((field) => (
            <div key={field.key} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                    <List className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{field.key}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {field.documentCount} {field.documentCount === 1 ? 'document' : 'documents'}
                    </p>
                  </div>
                </div>
              </div>

              {field.sampleValues.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Sample values:</p>
                  <div className="flex flex-wrap gap-1">
                    {field.sampleValues.slice(0, 3).map((value, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full truncate max-w-[150px]"
                        title={value}
                      >
                        {value}
                      </span>
                    ))}
                    {field.sampleValues.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{field.sampleValues.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => handleViewDocuments(field)}
                className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
              >
                <Eye size={16} />
                <span>View Documents</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {filteredFields.length === 0 && customFields.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No custom fields match your search</p>
        </div>
      )}
    </div>
  )
}

