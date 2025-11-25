import { Plus, Upload, FolderPlus, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function FloatingActionButton({ onUpload }) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const actions = [
    {
      icon: Upload,
      label: 'Upload Document',
      onClick: () => {
        setIsOpen(false)
        if (onUpload) onUpload()
      },
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: FolderPlus,
      label: 'New Folder',
      onClick: () => {
        setIsOpen(false)
        navigate('/storage-paths?new=true')
      },
      color: 'bg-purple-600 hover:bg-purple-700'
    }
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Action Menu */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-50 space-y-3 md:hidden">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <div
                key={index}
                className="flex items-center justify-end space-x-3 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span className="bg-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700">
                  {action.label}
                </span>
                <button
                  onClick={action.onClick}
                  className={`${action.color} text-white p-4 rounded-full shadow-lg transition-all`}
                >
                  <Icon size={20} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all md:hidden ${
          isOpen ? 'rotate-45' : ''
        }`}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>
    </>
  )
}
