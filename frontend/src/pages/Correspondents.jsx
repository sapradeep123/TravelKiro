import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Users, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Correspondents() {
  const [correspondents, setCorrespondents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCorrespondents()
  }, [])

  const loadCorrespondents = async () => {
    try {
      setLoading(true)
      // Get all documents and extract unique owners/correspondents
      const response = await api.get('/v2/metadata?limit=99&offset=0')
      const data = response.data
      console.log('Correspondents API Response:', data) // Debug log
      
      // Find the key that starts with "documents of "
      const docsKey = Object.keys(data).find(key => key.startsWith('documents of '))
      console.log('Correspondents - Found docsKey:', docsKey) // Debug log
      const docs = docsKey ? (data[docsKey] || []) : []
      console.log('Correspondents - Documents array:', docs) // Debug log
      
      // Group by owner_id and access_to to get all correspondents
      const correspondentMap = new Map()
      
      docs.forEach(doc => {
        // Add document owner
        if (doc.owner_id) {
          if (!correspondentMap.has(doc.owner_id)) {
            correspondentMap.set(doc.owner_id, {
              id: doc.owner_id,
              name: doc.owner_id, // Display ID for now, can be enhanced with user lookup
              email: null,
              documentCount: 0,
              isOwner: true
            })
          }
          correspondentMap.get(doc.owner_id).documentCount++
        }
        
        // Add users who have access to the document
        if (doc.access_to && Array.isArray(doc.access_to)) {
          doc.access_to.forEach(userId => {
            if (userId && userId !== doc.owner_id) {
              if (!correspondentMap.has(userId)) {
                // Check if it looks like an email
                const isEmail = userId.includes('@')
                correspondentMap.set(userId, {
                  id: userId,
                  name: isEmail ? userId.split('@')[0] : userId,
                  email: isEmail ? userId : null,
                  documentCount: 0,
                  isOwner: false
                })
              }
              correspondentMap.get(userId).documentCount++
            }
          })
        }
      })
      
      // Convert to array and sort by document count (descending)
      const correspondentsList = Array.from(correspondentMap.values())
        .sort((a, b) => b.documentCount - a.documentCount)
      
      setCorrespondents(correspondentsList)
    } catch (error) {
      console.error('Correspondents load error:', error) // Debug log
      toast.error('Failed to load correspondents: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }

  const filteredCorrespondents = correspondents.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 md:mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Correspondents</h1>
            <p className="text-sm text-gray-600 mt-1">{correspondents.length} correspondents</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search correspondents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {filteredCorrespondents.map((correspondent) => (
          <div key={correspondent.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`p-2 rounded-lg flex-shrink-0 ${correspondent.isOwner ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  <Users className={correspondent.isOwner ? 'text-blue-600' : 'text-gray-600'} size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {correspondent.email || correspondent.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {correspondent.documentCount} {correspondent.documentCount === 1 ? 'document' : 'documents'}
                  </p>
                  {correspondent.isOwner && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                      Owner
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCorrespondents.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">No correspondents found</p>
        </div>
      )}
    </div>
  )
}

