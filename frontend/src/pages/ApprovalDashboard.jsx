import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Filter,
  RefreshCw,
  Eye,
  MessageSquare,
  ArrowRight,
  GitBranch,
  Bell,
  BellOff,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

const ApprovalDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [approvals, setApprovals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [workflowDetail, setWorkflowDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [comment, setComment] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  const accountId = user?.default_account_id || user?.accounts?.[0]?.id;

  useEffect(() => {
    if (accountId) {
      fetchApprovals();
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [accountId]);

  useEffect(() => {
    calculateStats();
  }, [approvals]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v2/dms/approvals/my-approvals', {
        headers: { 'X-Account-Id': accountId }
      });
      setApprovals(response.data || []);
    } catch (err) {
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.get('/v2/dms/approvals/notifications/me', {
        headers: { 'X-Account-Id': accountId }
      });
      setNotifications(response.data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/v2/dms/approvals/notifications/me/unread-count', {
        headers: { 'X-Account-Id': accountId }
      });
      setUnreadCount(response.data?.count || 0);
    } catch (err) {
      console.error('Failed to load unread count:', err);
    }
  };

  const calculateStats = () => {
    const pending = approvals.filter(a => a.status === 'pending').length;
    const approved = approvals.filter(a => a.status === 'approved').length;
    const rejected = approvals.filter(a => a.status === 'rejected').length;
    setStats({ pending, approved, rejected });
  };

  const fetchWorkflowDetail = async (workflowId) => {
    try {
      setLoadingDetail(true);
      const response = await api.get(`/v2/dms/approvals/workflows/${workflowId}`, {
        headers: { 'X-Account-Id': accountId }
      });
      setWorkflowDetail(response.data);
    } catch (err) {
      toast.error('Failed to load workflow details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleViewDetail = (approval) => {
    setSelectedApproval(approval);
    setComment('');
    if (approval.workflow_id) {
      fetchWorkflowDetail(approval.workflow_id);
    }
  };

  const handleDecision = async (stepId, decision) => {
    try {
      setProcessingId(stepId);
      await api.post(`/v2/dms/approvals/steps/${stepId}/decision`, {
        decision,
        comment: comment || undefined
      }, {
        headers: { 'X-Account-Id': accountId }
      });
      
      toast.success(`Document ${decision === 'approve' ? 'approved' : 'rejected'}`);
      setSelectedApproval(null);
      setWorkflowDetail(null);
      setComment('');
      fetchApprovals();
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      toast.error(err.response?.data?.detail || `Failed to ${decision}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await api.patch(`/v2/dms/approvals/notifications/${notificationId}`, {}, {
        headers: { 'X-Account-Id': accountId }
      });
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/v2/dms/approvals/notifications/me/mark-all-read', {}, {
        headers: { 'X-Account-Id': accountId }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      skipped: { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle }
    };
    return badges[status] || badges.pending;
  };

  const filteredApprovals = approvals.filter(a => {
    if (activeTab === 'all') return true;
    return a.status === activeTab;
  });

  if (!accountId) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          No account assigned. Please contact your administrator.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Dashboard</h1>
          <p className="text-gray-600 mt-1">Review and manage document approvals</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loadingNotifications ? (
                    <div className="p-4 text-center text-gray-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <BellOff className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-gray-500">No notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map(notification => (
                      <div
                        key={notification.id}
                        onClick={() => !notification.is_read && handleMarkNotificationRead(notification.id)}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.is_read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => { fetchApprovals(); fetchNotifications(); fetchUnreadCount(); }}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={18} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-lg">
            <Clock className="text-yellow-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
        </div>
        <div className="card flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="text-green-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
            <p className="text-sm text-gray-500">Approved</p>
          </div>
        </div>
        <div className="card flex items-center space-x-4">
          <div className="p-3 bg-red-100 rounded-lg">
            <XCircle className="text-red-600" size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
            <p className="text-sm text-gray-500">Rejected</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'pending', label: 'Pending', icon: Clock },
            { id: 'approved', label: 'Approved', icon: CheckCircle },
            { id: 'rejected', label: 'Rejected', icon: XCircle },
            { id: 'all', label: 'All', icon: Filter }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.id !== 'all' && (
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {tab.id === 'pending' ? stats.pending : tab.id === 'approved' ? stats.approved : stats.rejected}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Approvals List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredApprovals.length === 0 ? (
        <div className="card text-center py-12">
          <CheckCircle2 className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab !== 'all' ? activeTab : ''} approvals
          </h3>
          <p className="text-gray-500">
            {activeTab === 'pending' 
              ? "You're all caught up! No pending approvals."
              : `No ${activeTab} approvals found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => {
            const statusBadge = getStatusBadge(approval.status);
            
            return (
              <div key={approval.id} className="card hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4">
                  {/* Top section with file info */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                      <FileText className="text-gray-600" size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base break-words">
                          {approval.workflow?.file_name || 'Document'}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${statusBadge.bg} ${statusBadge.text}`}>
                          {approval.status}
                        </span>
                      </div>
                      {approval.workflow?.document_id && (
                        <p className="text-xs text-gray-500 font-mono mb-1 truncate">
                          {approval.workflow.document_id}
                        </p>
                      )}
                      {approval.workflow?.resolution_text && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {approval.workflow.resolution_text}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <User size={12} />
                      <span>{approval.workflow?.initiator_username || 'Unknown'}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{formatRelativeTime(approval.created_at)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      {approval.workflow?.mode === 'serial' ? (
                        <ArrowRight size={12} />
                      ) : (
                        <GitBranch size={12} />
                      )}
                      <span>{approval.workflow?.mode || 'parallel'}</span>
                    </span>
                    {approval.workflow?.mode === 'serial' && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                        Step {approval.order_index + 1}
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    {approval.workflow?.file_id && (
                      <Link
                        to={`/files/${approval.workflow.file_id}`}
                        className="flex-1 btn-secondary text-sm flex items-center justify-center space-x-1 py-2"
                      >
                        <Eye size={16} />
                        <span>View File</span>
                      </Link>
                    )}
                    <button
                      onClick={() => handleViewDetail(approval)}
                      className="flex-1 btn-primary text-sm flex items-center justify-center space-x-1 py-2"
                    >
                      <MessageSquare size={16} />
                      <span>{approval.status === 'pending' ? 'Review' : 'Details'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail/Review Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">
                  {selectedApproval.status === 'pending' ? 'Review Approval' : 'Approval Details'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedApproval.workflow?.file_name || 'Document'}
                </p>
              </div>
              <button
                onClick={() => { setSelectedApproval(null); setWorkflowDetail(null); setComment(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-6 py-4 overflow-y-auto max-h-[60vh] space-y-6">
              {loadingDetail ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Document Info */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Document Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">File Name</p>
                        <p className="font-medium">{workflowDetail?.file_name || selectedApproval.workflow?.file_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Document ID</p>
                        <p className="font-mono text-xs">{workflowDetail?.document_id || selectedApproval.workflow?.document_id}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Requested By</p>
                        <p className="font-medium">{workflowDetail?.initiator_username || selectedApproval.workflow?.initiator_username}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Mode</p>
                        <p className="font-medium capitalize">{workflowDetail?.mode || selectedApproval.workflow?.mode}</p>
                      </div>
                    </div>
                    {(workflowDetail?.resolution_text || selectedApproval.workflow?.resolution_text) && (
                      <div className="mt-4">
                        <p className="text-gray-500 text-sm">Instructions</p>
                        <p className="mt-1">{workflowDetail?.resolution_text || selectedApproval.workflow?.resolution_text}</p>
                      </div>
                    )}
                  </div>

                  {/* Workflow Steps */}
                  {workflowDetail?.steps && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Approval Steps</h4>
                      <div className="space-y-3">
                        {workflowDetail.steps.map((step, index) => {
                          const stepBadge = getStatusBadge(step.status);
                          const isCurrentUser = step.id === selectedApproval.id;
                          
                          return (
                            <div
                              key={step.id}
                              className={`p-3 rounded-lg border-2 ${
                                isCurrentUser ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {workflowDetail.mode === 'serial' && (
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                      step.status === 'approved' ? 'bg-green-600 text-white' :
                                      step.status === 'rejected' ? 'bg-red-600 text-white' :
                                      step.status === 'pending' ? 'bg-yellow-500 text-white' :
                                      'bg-gray-400 text-white'
                                    }`}>
                                      {index + 1}
                                    </span>
                                  )}
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      {step.approver_username}
                                      {isCurrentUser && <span className="text-blue-600 ml-2">(You)</span>}
                                    </p>
                                    <p className="text-sm text-gray-500">{step.approver_email}</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${stepBadge.bg} ${stepBadge.text}`}>
                                  {step.status}
                                </span>
                              </div>
                              {step.comment && (
                                <p className="mt-2 text-sm text-gray-600 italic pl-9">"{step.comment}"</p>
                              )}
                              {step.acted_at && (
                                <p className="mt-1 text-xs text-gray-400 pl-9">{formatDate(step.acted_at)}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Comment Input (for pending approvals) */}
                  {selectedApproval.status === 'pending' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comment (Optional)
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment with your decision..."
                        rows={3}
                        className="input-field"
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
              {selectedApproval.status === 'pending' ? (
                <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <button
                    onClick={() => { setSelectedApproval(null); setWorkflowDetail(null); setComment(''); }}
                    className="btn-secondary order-3 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDecision(selectedApproval.id, 'reject')}
                    disabled={processingId === selectedApproval.id}
                    className="bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 order-2"
                  >
                    <XCircle size={18} />
                    <span>{processingId === selectedApproval.id ? 'Processing...' : 'Reject'}</span>
                  </button>
                  <button
                    onClick={() => handleDecision(selectedApproval.id, 'approve')}
                    disabled={processingId === selectedApproval.id}
                    className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 order-1 sm:order-3"
                  >
                    <CheckCircle size={18} />
                    <span>{processingId === selectedApproval.id ? 'Processing...' : 'Approve'}</span>
                  </button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    onClick={() => { setSelectedApproval(null); setWorkflowDetail(null); setComment(''); }}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default ApprovalDashboard;
