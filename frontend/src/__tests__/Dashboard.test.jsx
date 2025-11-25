import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import Dashboard from '../pages/Dashboard'
import { api } from '../services/api'
import '@testing-library/jest-dom'

// Mock the API
jest.mock('../services/api')

// Mock toast
jest.mock('react-hot-toast', () => ({
  error: jest.fn(),
}))

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    api.get.mockImplementation(() => new Promise(() => {})) // Never resolves

    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    )

    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument()
  })

  it('renders dashboard with stats when data is loaded', async () => {
    const mockData = {
      'no_of_docs': 42,
      'documents of user': [
        {
          id: '1',
          name: 'Test Document.pdf',
          created_at: new Date().toISOString(),
          size: 1024,
          tags: ['important']
        }
      ]
    }

    api.get.mockResolvedValue({ data: mockData })

    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('42')).toBeInTheDocument() // Total documents
      expect(screen.getByText('Test Document.pdf')).toBeInTheDocument()
    })
  })

  it('shows empty state when no documents exist', async () => {
    const mockData = {
      'no_of_docs': 0,
      'documents of user': []
    }

    api.get.mockResolvedValue({ data: mockData })

    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('No documents yet')).toBeInTheDocument()
      expect(screen.getByText('Upload your first document')).toBeInTheDocument()
    })
  })
})
