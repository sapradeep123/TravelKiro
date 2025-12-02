import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import FileAccessControl from '../components/FileAccessControl';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  Folder,
  FileText,
  Users,
  Settings,
  Edit2,
  Trash2,
  FolderPlus,
  Upload,
  CheckCircle,
  GitBranch,
  ArrowRight,
  Search,
  Plus,
  X,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

const FolderDetailDMS = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [folder, setFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [subfolders, setSubfolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contents');
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  // Approval rule state
  const [approvalRule, setApprovalRule] = useState(null);
  const [loadingRule, setLoadingRule] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalMode, setApprovalMode] = useState('parallel');
  const [approvalResolution, setApprovalResolution] = useState('');
  const [applyToSubfolders, setApplyToSubfolders] = useState(false);
  const [ruleApprovers, setRuleApprovers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingRule, setSavingRule] = useState(false);
  
  const accountId = user?.default_account_id || user?.accounts?.[0]?.id;

  useEffect(() => {
    if (accountId && folderId) {
      fetchFolderDetails();
      fetchApprovalRule();
    }
  }, [folderId, accountId]);

  const fetchApprovalRule = async () => {
    try {
      setLoadingRule(true);
      const headers = { 'X-Account-Id': accountId };
      const response = await api.get(`/v2/dms/approvals/folder-rules?folder_id=${folderId}`, { headers });
      const rules = response.data || [];
      if (rules.length > 0) {
        setApprovalRule(rules[0]);
        // Load rule details with approvers
        const ruleDetail = await api.get(`/v2/dms/approvals/folder-rules/${rules[0].id}`, { headers });
        setApprovalRule(ruleDetail.data);
      }
    } catch (err) {
      console.error('Failed to load approval rule:', err);
    } finally {
      setLoadingRule(false);
    }
  };

  const loadAvailableUsers = async () => {
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

  const openApprovalModal = () => {
    if (approvalRule) {
      setApprovalMode(approvalRule.mode || 'parallel');
      setApprovalResolution(approvalRule.resolution_text || '');
      setApplyToSubfolders(approvalRule.apply_to_subfolders || false);
      // Load approvers from rule
      if (approvalRule.approvers) {
        setRuleApprovers(approvalRule.approvers.map(a => ({
          user_id: a.user_id,
          order_index: a.order_index,
          username: a.username || 'User',
          email: a.email || ''
        })));
      }
    } else {
      setApprovalMode('parallel');
      setApprovalResolution('');
      setApplyToSubfolders(false);
      setRuleApprovers([]);
    }
    loadAvailableUsers();
    setShowApprovalModal(true);
  };

  const addRuleApprover = (user) => {
    if (ruleApprovers.find(a => a.user_id === user.id)) {
      toast.error('User already added');
      return;
    }
    setRuleApprovers([...ruleApprovers, {
      user_id: user.id,
      order_index: ruleApprovers.length,
      username: user.username,
      email: user.email
    }]);
    setUserSearchQuery('');
  };

  const removeRuleApprover = (index) => {
    const newApprovers = ruleApprovers.filter((_, i) => i !== index);
    setRuleApprovers(newApprovers.map((a, i) => ({ ...a, order_index: i })));
  };

  const moveRuleApprover = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === ruleApprovers.length - 1) return;
    
    const newApprovers = [...ruleApprovers];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newApprovers[index], newApprovers[swapIndex]] = [newApprovers[swapIndex], newApprovers[index]];
    setRuleApprovers(newApprovers.map((a, i) => ({ ...a, order_index: i })));
  };

  const handleSaveApprovalRule = async () => {
    if (ruleApprovers.length === 0) {
      toast.error('Please add at least one approver');
      return;
    }

    try {
      setSavingRule(true);
      const headers = { 'X-Account-Id': accountId };
      
      if (approvalRule) {
        // Update existing rule
        await api.patch(`/v2/dms/approvals/folder-rules/${approvalRule.id}`, {
          mode: approvalMode,
          resolution_text: approvalResolution,
          apply_to_subfolders: applyToSubfolders,
          approvers: ruleApprovers.map(a => ({
            user_id: a.user_id,
            order_index: a.order_index
          }))
        }, { headers });
        toast.success('Approval rule updated');
      } else {
        // Create new rule
        await api.post('/v2/dms/approvals/folder-rules', {
          folder_id: folderId,
          mode: approvalMode,
          resolution_text: approvalResolution,
          apply_to_subfolders: applyToSubfolders,
          approvers: ruleApprovers.map(a => ({
            user_id: a.user_id,
            order_index: a.order_index
          }))
        }, { headers });
        toast.success('Approval rule created');
      }
      
      setShowApprovalModal(false);
      fetchApprovalRule();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save approval rule');
    } finally {
      setSavingRule(false);
    }
  };

  const handleToggleRuleActive = async () => {
    if (!approvalRule) return;
    
    try {
      const headers = { 'X-Account-Id': accountId };
      await api.patch(`/v2/dms/approvals/folder-rules/${approvalRule.id}`, {
        is_active: !approvalRule.is_active
      }, { headers });
      toast.success(approvalRule.is_active ? 'Approval rule disabled' : 'Approval rule enabled');
      fetchApprovalRule();
    } catch (err) {
      toast.error('Failed to update rule status');
    }
  };

  const handleDeleteApprovalRule = async () => {
    if (!approvalRule) return;
    if (!window.confirm('Delete this approval rule? Files uploaded to this folder will no longer require approval.')) return;
    
    try {
      const headers = { 'X-Account-Id': accountId };
      await api.delete(`/v2/dms/approvals/folder-rules/${approvalRule.id}`, { headers });
      toast.success('Approval rule deleted');
      setApprovalRule(null);
    } catch (err) {
      toast.error('Failed to delete approval rule');
    }
  };

  const filteredAvailableUsers = availableUsers.filter(user =>
    (user.username?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
     user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())) &&
    !ruleApprovers.find(a => a.user_id === user.id)
  );

  const fetchFolderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const headers = { 'X-Account-Id': accountId };
      
      // Fetch folder details
      const folderRes = await api.get(`/v2/dms/folders-dms/${folderId}`, { headers });
      setFolder(folderRes.data);
      setEditName(folderRes.data.name);
      setEditDescription(folderRes.data.description || '');
      
      // Fetch files in folder
      const filesRes = await api.get(`/v2/dms/files-dms?folder_id=${folderId}`, { headers });
      setFiles(filesRes.data || []);
      
      // Fetch subfolders
      try {
        const subfoldersRes = await api.get(`/v2/dms/folders-dms?parent_folder_id=${folderId}`, { headers });
        setSubfolders(subfoldersRes.data || []);
      } catch (err) {
        setSubfolders([]);
      }
    } catch (err) {
      setError('Failed to load folder details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFolder = async () => {
    try {
      const headers = { 'X-Account-Id': accountId };
      await api.patch(`/v2/dms/folders-dms/${folderId}`, {
        name: editName,
        description: editDescription
      }, { headers });
      
      toast.success('Folder updated');
      setShowEditModal(false);
      fetchFolderDetails();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update folder');
    }
  };

  const handleDeleteFolder = async () => {
    if (!window.confirm('Delete this folder and all its contents? This cannot be undone.')) return;
    
    try {
      const headers = { 'X-Account-Id': accountId };
      await api.delete(`/v2/dms/folders-dms/${folderId}`, { headers });
      toast.success('Folder deleted');
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete folder');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const tabs = [
    { id: 'contents', label: 'Contents', icon: Folder },
    { id: 'access', label: 'Access Control', icon: Users },
    { id: 'approvals', label: 'Auto Approvals', icon: CheckCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  if (!accountId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          No account assigned. Please contact your administrator.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !folder) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error || 'Folder not found'}
        </div>
        <button 
          className="btn-secondary flex items-center space-x-2" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          <span>Go Back</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center space-x-2">
            <Folder size={24} className="text-yellow-500" />
            <span className="break-words">{folder.name}</span>
          </h1>
          {folder.description && (
            <p className="text-gray-600 mt-1">{folder.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowEditModal(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Edit2 size={18} />
            <span>Edit</span>
          </button>
          <button 
            onClick={handleDeleteFolder}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Trash2 size={18} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Folder Info Card */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Files</p>
            <p className="text-2xl font-bold text-gray-900">{files.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Subfolders</p>
            <p className="text-2xl font-bold text-gray-900">{subfolders.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-gray-900 text-sm">{formatDate(folder.created_at)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Updated</p>
            <p className="text-gray-900 text-sm">{formatDate(folder.updated_at)}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'contents' && (
          <div className="space-y-6">
            {/* Subfolders */}
            {subfolders.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FolderPlus size={20} />
                  <span>Subfolders</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subfolders.map((subfolder) => (
                    <Link
                      key={subfolder.id}
                      to={`/folders/${subfolder.id}`}
                      className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Folder className="text-yellow-500" size={24} />
                      <div>
                        <p className="font-medium text-gray-900">{subfolder.name}</p>
                        <p className="text-sm text-gray-500">{formatDate(subfolder.created_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FileText size={20} />
                <span>Files ({files.length})</span>
              </h3>
              {files.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">No files in this folder</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <Link
                      key={file.id}
                      to={`/files/${file.id}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="text-blue-500" size={20} />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatSize(file.size_bytes)} • {file.mime_type || 'Unknown type'}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{formatDate(file.created_at)}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'access' && (
          <FileAccessControl fileId={folderId} accountId={accountId} resourceType="folder" />
        )}

        {activeTab === 'approvals' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Automated Approval Workflow</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Files uploaded to this folder will automatically require approval
                </p>
              </div>
              {!approvalRule && (
                <button onClick={openApprovalModal} className="btn-primary flex items-center space-x-2">
                  <Plus size={18} />
                  <span>Create Rule</span>
                </button>
              )}
            </div>

            {loadingRule ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : approvalRule ? (
              <div className="space-y-4">
                {/* Rule Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <button onClick={handleToggleRuleActive} className="text-gray-600 hover:text-gray-900">
                      {approvalRule.is_active ? (
                        <ToggleRight size={28} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={28} className="text-gray-400" />
                      )}
                    </button>
                    <div>
                      <p className="font-medium text-gray-900">
                        {approvalRule.is_active ? 'Active' : 'Disabled'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {approvalRule.is_active 
                          ? 'New files will require approval' 
                          : 'Approval workflow is disabled'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    approvalRule.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {approvalRule.is_active ? 'Enabled' : 'Disabled'}
                  </span>
                </div>

                {/* Rule Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      {approvalRule.mode === 'serial' ? (
                        <ArrowRight className="text-blue-600" size={20} />
                      ) : (
                        <GitBranch className="text-blue-600" size={20} />
                      )}
                      <span className="font-medium">Mode: {approvalRule.mode}</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {approvalRule.mode === 'serial' 
                        ? 'Approvers review in sequence' 
                        : 'All approvers review simultaneously'}
                    </p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FolderPlus className="text-blue-600" size={20} />
                      <span className="font-medium">Subfolders</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {approvalRule.apply_to_subfolders 
                        ? 'Applies to all subfolders' 
                        : 'This folder only'}
                    </p>
                  </div>
                </div>

                {/* Resolution Text */}
                {approvalRule.resolution_text && (
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Instructions</p>
                    <p className="text-gray-600">{approvalRule.resolution_text}</p>
                  </div>
                )}

                {/* Approvers */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Approvers ({approvalRule.approvers?.length || 0})
                  </p>
                  {approvalRule.approvers?.length > 0 ? (
                    <div className="space-y-2">
                      {approvalRule.approvers.map((approver, index) => (
                        <div key={approver.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                          {approvalRule.mode === 'serial' && (
                            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">
                              {index + 1}
                            </span>
                          )}
                          <Users size={18} className="text-gray-400" />
                          <span className="text-gray-900">User ID: {approver.user_id}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No approvers configured</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button onClick={openApprovalModal} className="btn-secondary flex items-center space-x-2">
                    <Edit2 size={18} />
                    <span>Edit Rule</span>
                  </button>
                  <button 
                    onClick={handleDeleteApprovalRule}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <Trash2 size={18} />
                    <span>Delete Rule</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <CheckCircle className="mx-auto text-gray-400 mb-3" size={48} />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Approval Rule</h4>
                <p className="text-gray-500 mb-4">
                  Create an automated approval workflow for files uploaded to this folder
                </p>
                <button onClick={openApprovalModal} className="btn-primary">
                  Create Approval Rule
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Folder Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Folder Name</label>
                <p className="text-gray-900">{folder.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900">{folder.description || 'No description'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                <p className="text-gray-900">{folder.section_name || folder.section_id || 'Unknown'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                <p className="text-gray-900">{folder.created_by || 'Unknown'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Edit Folder</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="input-field"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleUpdateFolder} className="flex-1 btn-primary">
                Save
              </button>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Rule Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {approvalRule ? 'Edit Approval Rule' : 'Create Approval Rule'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">{folder.name}</p>
              </div>
              <button onClick={() => setShowApprovalModal(false)} className="text-gray-400 hover:text-gray-600">
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
                    onClick={() => setApprovalMode('serial')}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      approvalMode === 'serial'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <ArrowRight className={approvalMode === 'serial' ? 'text-blue-600' : 'text-gray-400'} size={20} />
                      <span className="font-medium">Serial</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Approvers review one after another in order
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setApprovalMode('parallel')}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${
                      approvalMode === 'parallel'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <GitBranch className={approvalMode === 'parallel' ? 'text-blue-600' : 'text-gray-400'} size={20} />
                      <span className="font-medium">Parallel</span>
                    </div>
                    <p className="text-sm text-gray-500">
                      All approvers are notified at once
                    </p>
                  </button>
                </div>
              </div>

              {/* Apply to Subfolders */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Apply to Subfolders</p>
                  <p className="text-sm text-gray-500">Also require approval for files in subfolders</p>
                </div>
                <button
                  onClick={() => setApplyToSubfolders(!applyToSubfolders)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {applyToSubfolders ? (
                    <ToggleRight size={28} className="text-blue-600" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-400" />
                  )}
                </button>
              </div>

              {/* Resolution Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions (Optional)
                </label>
                <textarea
                  value={approvalResolution}
                  onChange={(e) => setApprovalResolution(e.target.value)}
                  placeholder="Add instructions for approvers..."
                  rows={2}
                  className="input-field"
                />
              </div>

              {/* Add Approvers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approvers {approvalMode === 'serial' && '(in order)'}
                </label>
                
                {/* Search Users */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search users to add..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>

                {/* Search Results */}
                {userSearchQuery && (
                  <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {loadingUsers ? (
                      <div className="p-4 text-center text-gray-500">Loading users...</div>
                    ) : filteredAvailableUsers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No users found</div>
                    ) : (
                      filteredAvailableUsers.slice(0, 5).map(user => (
                        <button
                          key={user.id}
                          onClick={() => addRuleApprover(user)}
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
                {ruleApprovers.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Users className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">No approvers added yet</p>
                    <p className="text-sm text-gray-400">Search and add users above</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ruleApprovers.map((approver, index) => (
                      <div
                        key={approver.user_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {approvalMode === 'serial' && (
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
                          {approvalMode === 'serial' && (
                            <>
                              <button
                                onClick={() => moveRuleApprover(index, 'up')}
                                disabled={index === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                ↑
                              </button>
                              <button
                                onClick={() => moveRuleApprover(index, 'down')}
                                disabled={index === ruleApprovers.length - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                              >
                                ↓
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => removeRuleApprover(index)}
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
              <button onClick={() => setShowApprovalModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSaveApprovalRule}
                disabled={savingRule || ruleApprovers.length === 0}
                className="btn-primary flex items-center space-x-2"
              >
                <CheckCircle size={18} />
                <span>{savingRule ? 'Saving...' : 'Save Rule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderDetailDMS;
