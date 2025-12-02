import { useState, useEffect } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, Users, ArrowRight, GitBranch, CheckCircle, Search } from 'lucide-react';

export default function StartApprovalWorkflow({ fileId, fileName, accountId, onClose, onSuccess }) {
  const [mode, setMode] = useState('serial');
  const [resolutionText, setResolutionText] = useState('');
  const [approvers, setApprovers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/v2/rbac/users', {
        headers: { 'X-Account-Id': accountId }
      });
      setAvailableUsers(response.data || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const addApprover = (user) => {
    if (approvers.find(a => a.user_id === user.id)) {
      toast.error('User already added');
      return;
    }
    setApprovers([...approvers, {
      approver_user_id: user.id,
      order_index: approvers.length,
      username: user.username,
      email: user.email
    }]);
    setSearchQuery('');
  };

  const removeApprover = (index) => {
    const newApprovers = approvers.filter((_, i) => i !== index);
    // Reindex
    setApprovers(newApprovers.map((a, i) => ({ ...a, order_index: i })));
  };

  const moveApprover = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === approvers.length - 1) return;
    
    const newApprovers = [...approvers];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newApprovers[index], newApprovers[swapIndex]] = [newApprovers[swapIndex], newApprovers[index]];
    setApprovers(newApprovers.map((a, i) => ({ ...a, order_index: i })));
  };

  const handleSubmit = async () => {
    if (approvers.length === 0) {
      toast.error('Please add at least one approver');
      return;
    }

    try {
      setLoading(true);
      await api.post('/v2/dms/approvals/workflows', {
        file_id: fileId,
        mode,
        resolution_text: resolutionText || `Approval required for ${fileName}`,
        approvers: approvers.map(a => ({
          approver_user_id: a.approver_user_id,
          order_index: a.order_index
        }))
      }, {
        headers: { 'X-Account-Id': accountId }
      });

      toast.success('Approval workflow started');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to start workflow');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = availableUsers.filter(user =>
    (user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     user.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
    !approvers.find(a => a.approver_user_id === user.id)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Start Approval Workflow</h2>
            <p className="text-sm text-gray-500 mt-1">{fileName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Workflow Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Approval Mode</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMode('serial')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  mode === 'serial'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <ArrowRight className={mode === 'serial' ? 'text-blue-600' : 'text-gray-400'} size={20} />
                  <span className="font-medium">Serial</span>
                </div>
                <p className="text-sm text-gray-500">
                  Approvers review one after another in order. Next approver is notified only after previous approves.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setMode('parallel')}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  mode === 'parallel'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <GitBranch className={mode === 'parallel' ? 'text-blue-600' : 'text-gray-400'} size={20} />
                  <span className="font-medium">Parallel</span>
                </div>
                <p className="text-sm text-gray-500">
                  All approvers are notified at once. All must approve for workflow to complete.
                </p>
              </button>
            </div>
          </div>

          {/* Resolution Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instructions / Comments (Optional)
            </label>
            <textarea
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="Add any instructions or context for approvers..."
              rows={2}
              className="input-field"
            />
          </div>

          {/* Add Approvers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approvers {mode === 'serial' && '(in order)'}
            </label>
            
            {/* Search Users */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search users to add..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Search Results */}
            {searchQuery && (
              <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {loadingUsers ? (
                  <div className="p-4 text-center text-gray-500">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No users found</div>
                ) : (
                  filteredUsers.slice(0, 5).map(user => (
                    <button
                      key={user.id}
                      onClick={() => addApprover(user)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Plus size={18} className="text-blue-600" />
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected Approvers */}
            {approvers.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Users className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-500">No approvers added yet</p>
                <p className="text-sm text-gray-400">Search and add users above</p>
              </div>
            ) : (
              <div className="space-y-2">
                {approvers.map((approver, index) => (
                  <div
                    key={approver.approver_user_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {mode === 'serial' && (
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{approver.username}</p>
                        <p className="text-sm text-gray-500">{approver.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {mode === 'serial' && (
                        <>
                          <button
                            onClick={() => moveApprover(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveApprover(index, 'down')}
                            disabled={index === approvers.length - 1}
                            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            ↓
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => removeApprover(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || approvers.length === 0}
            className="btn-primary flex items-center space-x-2"
          >
            <CheckCircle size={18} />
            <span>{loading ? 'Starting...' : 'Start Workflow'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
