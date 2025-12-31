import { useState, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

function DevAccountManager() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [accounts, setAccounts] = useState([])
  const [isLoadingTable, setIsLoadingTable] = useState(true)
  const [tableError, setTableError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, accountId: null, email: null })

  const DEFAULT_PASSWORD = 'ChangeP@sswordNow!!!'

  // Column definitions for ag-grid
  const colDefs = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'createdAt', headerName: 'Created At', width: 180, valueFormatter: (params) => {
      return params.value ? new Date(params.value).toLocaleDateString() : 'N/A'
    }},
    { field: 'lastLogin', headerName: 'Last Login', width: 180, valueFormatter: (params) => {
      return params.value ? new Date(params.value).toLocaleDateString() : 'Never'
    }},
    { field: 'status', headerName: 'Status', width: 120, cellStyle: (params) => {
      return params.value === 'active' 
        ? { color: '#4ade80', fontWeight: 'bold' }
        : { color: '#ef4444', fontWeight: 'bold' }
    }},
    {
      headerName: 'Permission Set',
      width: 240,
      cellRenderer: (params) => (
        <div className="flex items-center gap-3 pt-2">
          {['T1','T2','T3'].map((label) => (
            <label key={label} className="flex items-center gap-1 text-slate-300">
              <input
                type="checkbox"
                checked={Boolean(params.data.permissions?.[label])}
                onChange={(e) => handleTogglePermission(params.data.id, label, e.target.checked)}
                className="accent-blue-500"
                aria-label={`Toggle ${label} permission`}
              />
              <span className="text-xs">{label}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      headerName: 'Actions',
      width: 300,
      cellRenderer: (params) => {
        const isActive = params.data.status === 'active'
        const isLoading = actionLoading === `${params.data.id}-${params.data.status === 'active' ? 'deactivate' : 'activate'}`
        const isDeleting = actionLoading === `${params.data.id}-delete`
        
        return (
          <div className="flex gap-2 h-full items-center">
            <button
              onClick={() => setConfirmDialog({
                open: true,
                action: isActive ? 'deactivate' : 'activate',
                accountId: params.data.id,
                email: params.data.email
              })}
              disabled={isLoading || isDeleting}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                isActive
                  ? 'bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-400 disabled:opacity-50'
                  : 'bg-green-600/30 hover:bg-green-600/50 text-green-400 disabled:opacity-50'
              }`}
            >
              {isLoading ? '...' : (isActive ? 'Deactivate' : 'Activate')}
            </button>
            <button
              onClick={() => setConfirmDialog({
                open: true,
                action: 'delete',
                accountId: params.data.id,
                email: params.data.email
              })}
              disabled={isLoading || isDeleting}
              className="px-3 py-1 rounded text-sm font-medium bg-red-600/30 hover:bg-red-600/50 text-red-400 transition-all disabled:opacity-50"
            >
              {isDeleting ? '...' : 'Delete'}
            </button>
          </div>
        )
      }
    }
  ]

  // Fetch accounts on component mount
  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoadingTable(true)
      setTableError('')
      try {
        const response = await fetch('/api/accounts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch accounts`)
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server returned invalid response format (not JSON)')
        }

        const data = await response.json()
        const list = Array.isArray(data) ? data : (data.accounts || [])
        setAccounts(list.map(acc => ({
          ...acc,
          permissions: acc.permissions || { T1: false, T2: false, T3: false }
        })))
      } catch (err) {
        console.error('Fetch error:', err)
        // Fallback to mock data for development
        console.warn('Using mock data. Backend /api/accounts not available.')
        setAccounts([
          { id: 1, email: 'admin@example.com', createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), status: 'active', permissions: { T1: true, T2: true, T3: false } },
          { id: 2, email: 'user@example.com', createdAt: new Date().toISOString(), lastLogin: null, status: 'active', permissions: { T1: true, T2: false, T3: false } },
        ])
        setTableError(null) // Don't show error if using mock data
      } finally {
        setIsLoadingTable(false)
      }
    }

    fetchAccounts()
  }, [])

  const handleCreateAccount = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: DEFAULT_PASSWORD,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to create account')
      }

      setSuccess(`Account created successfully for ${email}. Default password sent to email.`)
      setEmail('')
      setIsModalOpen(false)
      
      // Refresh accounts table
      const refreshResponse = await fetch('/api/accounts')
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        setAccounts(refreshData.accounts || [])
      }
    } catch (err) {
      setError(err.message || 'Account creation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEmail('')
    setError('')
    setSuccess('')
  }

  const handleAccountAction = async (action, accountId) => {
    const loadingKey = `${accountId}-${action}`
    setActionLoading(loadingKey)
    setTableError('')

    try {
      let endpoint = ''
      let method = 'POST'
      let body = {}

      if (action === 'deactivate' || action === 'activate') {
        endpoint = `/api/accounts/${accountId}/status`
        body = { status: action === 'activate' ? 'active' : 'inactive' }
      } else if (action === 'delete') {
        endpoint = `/api/accounts/${accountId}`
        method = 'DELETE'
      }

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method !== 'DELETE' ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data?.message || `Failed to ${action} account`)
      }

      // Update local state
      setAccounts(accounts.map(acc =>
        acc.id === accountId
          ? action === 'delete'
            ? null
            : { ...acc, status: action === 'activate' ? 'active' : 'inactive' }
          : acc
      ).filter(Boolean))

      const actionText = action === 'delete' ? 'deleted' : (action === 'activate' ? 'activated' : 'deactivated')
      setSuccess(`Account ${actionText} successfully`)
    } catch (err) {
      setTableError(err.message || `Failed to ${action} account`)
    } finally {
      setActionLoading(null)
      setConfirmDialog({ open: false, action: null, accountId: null, email: null })
    }
  }

  const handleTogglePermission = async (accountId, label, enabled) => {
    setTableError('')

    // Compute updated permissions from current state for the specific account
    const current = accounts.find(a => a.id === accountId)
    const updatedPermissions = {
      T1: Boolean(current?.permissions?.T1),
      T2: Boolean(current?.permissions?.T2),
      T3: Boolean(current?.permissions?.T3),
      [label]: enabled
    }

    // Optimistic local update
    setAccounts(prev => prev.map(acc => (
      acc.id === accountId
        ? { ...acc, permissions: { ...updatedPermissions } }
        : acc
    )))

    // Optional backend sync
    try {
      const response = await fetch(`/api/accounts/${accountId}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: updatedPermissions })
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.message || 'Failed to update permissions')
      }
    } catch (err) {
      // Revert on error
      setAccounts(prev => prev.map(acc => (
        acc.id === accountId
          ? { ...acc, permissions: { ...acc.permissions, [label]: !enabled } }
          : acc
      )))
      setTableError(err.message || 'Failed to update permissions')
    }
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Accounts Table Section */}
      <div className="flex-1 p-6 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Accounts</h2>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email..."
              className="w-64 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
              aria-label="Search users by email"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-200"
                aria-label="Clear search"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              + Create Account
            </button>
          </div>
        </div>
        
        {tableError && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-400">{tableError}</p>
          </div>
        )}

        {isLoadingTable ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-slate-400">Loading accounts...</p>
          </div>
        ) : (
          <div className="flex-1 rounded-lg overflow-hidden border border-slate-700">
            <AgGridReact
              rowData={accounts.filter(acc => (acc.email || '').toLowerCase().includes(searchQuery.toLowerCase()))}
              columnDefs={colDefs}
              theme={themeQuartz.withParams({
                accentColor: '#3b82f6',
                backgroundColor: '#1e293b',
                foregroundColor: '#e2e8f0',
              })}
              defaultColDef={{
                sortable: true,
                filter: true,
                resizable: true,
              }}
              pagination={true}
              paginationPageSize={20}
              domLayout="normal"
            />
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Create Account</h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                  required
                />
              </div>

              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                <p className="text-xs font-semibold text-slate-300 mb-1">Default Password</p>
                <p className="text-sm font-mono text-slate-400 break-all">{DEFAULT_PASSWORD}</p>
                <p className="text-xs text-slate-500 mt-2">
                  ℹ️ User will be prompted to change this on first login
                </p>
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-3">
                  <p className="text-sm text-green-400">{success}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              {confirmDialog.action === 'delete' 
                ? 'Delete Account?' 
                : confirmDialog.action === 'deactivate'
                ? 'Deactivate Account?'
                : 'Activate Account?'}
            </h3>
            
            <p className="text-slate-300 mb-6">
              {confirmDialog.action === 'delete'
                ? `Permanently delete account for ${confirmDialog.email}? This action cannot be undone.`
                : confirmDialog.action === 'deactivate'
                ? `Deactivate ${confirmDialog.email}? They will not be able to log in.`
                : `Activate ${confirmDialog.email}? They will be able to log in again.`}
            </p>

            {tableError && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-400">{tableError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ open: false, action: null, accountId: null, email: null })}
                disabled={actionLoading !== null}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAccountAction(confirmDialog.action, confirmDialog.accountId)}
                disabled={actionLoading !== null}
                className={`flex-1 px-4 py-3 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 ${
                  confirmDialog.action === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : confirmDialog.action === 'deactivate'
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {actionLoading === `${confirmDialog.accountId}-${confirmDialog.action}` ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DevAccountManager
