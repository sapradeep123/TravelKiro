import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { Trash2, RotateCcw, X, FileText } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Trash() {
  const [trash, setTrash] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrash()
  }, [])

  const loadTrash = async () => {
    try {
      const response = await api.get('/v2/trash')
      const data = response.data
      setTrash(data.response || [])
    } catch (error) {
      toast.error('Failed to load trash')
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (fileName) => {
    try {
      await api.post(`/v2/restore/${fileName}`)
      toast.success('Document restored')
      loadTrash()
    } catch (error) {
      toast.error('Failed to restore document')
    }
  }

  const handlePermanentDelete = async (fileName) => {
    if (!confirm('Are you sure you want to permanently delete this document? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/v2/trash/${fileName}`)
      toast.success('Document permanently deleted')
      loadTrash()
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }

  const handleEmptyTrash = async () => {
    if (!confirm('Are you sure you want to empty the trash? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete('/v2/trash')
      toast.success('Trash emptied')
      loadTrash()
    } catch (error) {
      toast.error('Failed to empty trash')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trash</h1>
          <p className="text-gray-600 mt-1">Deleted documents</p>
        </div>
        {trash.length > 0 && (
          <button onClick={handleEmptyTrash} className="btn-secondary flex items-center space-x-2 text-red-600 hover:bg-red-50">
            <Trash2 size={20} />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {trash.length === 0 ? (
        <div className="card text-center py-12">
          <Trash2 className="mx-auto text-gray-400" size={48} />
          <p className="text-gray-500 mt-4">Trash is empty</p>
        </div>
      ) : (
        <div className="card">
          <div className="space-y-4">
            {trash.map((doc) => (
              <div
                key={doc.id || doc.name}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="text-gray-400" size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{doc.name}</h3>
                    <p className="text-sm text-gray-500">
                      Deleted on {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRestore(doc.name)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Restore"
                  >
                    <RotateCcw size={18} />
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(doc.name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Permanently Delete"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

