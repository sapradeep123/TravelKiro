import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { Tag, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Tags() {
  const { user } = useAuth()
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState(null)

  const accountId = user?.default_account_id || user?.accounts?.[0]?.id

  useEffect(() => {
    if (accountId) {
      loadTags()
    } else if (user) {
      // User loaded but no account - stop loading
      setLoading(false)
    }
  }, [accountId, user])

  const loadTags = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get files from DMS to extract tags
      const response = await api.get('/v2/dms/files-dms', {
        params: { limit: 500 },
        headers: { 'X-Account-Id': accountId }
      })
      
      const files = response.data || []
      
      // Extract unique tags and count
      const tagMap = new Map()
      files.forEach(file => {
        if (file.tags && Array.isArray(file.tags)) {
          file.tags.forEach(tag => {
            if (tag && tag.trim()) {
              if (!tagMap.has(tag)) {
                tagMap.set(tag, { name: tag, count: 0, files: [] })
              }
              tagMap.get(tag).count++
              tagMap.get(tag).files.push({ id: file.id, name: file.name })
            }
          })
        }
      })
      
      const tagsList = Array.from(tagMap.values()).sort((a, b) => b.count - a.count)
      setTags(tagsList)
    } catch (error) {
      console.error('Tags load error:', error)
      setError('Failed to load tags')
      toast.error('Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  if (!accountId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
          No account assigned. Please contact your administrator.
        </div>
      </div>
    )
  }

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Tags</h1>
            <p className="text-sm text-gray-600 mt-1">{tags.length} tags (read-only from files)</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex justify-between items-center">
            <span>{error}</span>
            <button onClick={loadTags} className="text-sm underline">Retry</button>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredTags.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Tag className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">{searchQuery ? 'No tags match your search' : 'No tags found'}</p>
          <p className="text-sm text-gray-400 mt-2">Tags are created when you add them to files</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredTags.map((tag) => (
            <div key={tag.name} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Tag className="text-blue-600" size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{tag.name}</h3>
                  <p className="text-sm text-gray-500">{tag.count} {tag.count === 1 ? 'file' : 'files'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

